from app.models import chatModels
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, status
from app.security import user_from_jwt
from app.schema import Conversation, Message
from app.database import get_db


router = APIRouter(prefix="/chat", tags=["chat messages"])


# Creates a new conversation to store a sequence of messages to/from LLM.
@router.post(
    "/newconversation",
    response_model=chatModels.ConversationInfo,
    summary="Creates a new conversation for message storage.",
)
def create_conversation(
    db: Session = Depends(get_db), current_user=Depends(user_from_jwt)
):
    user_id = current_user.user_id

    new_conv = Conversation(
        user_id=user_id, title="New Conversation"  # Can be updated after creation
    )

    try:
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem creating conversation")

    response = chatModels.ConversationInfo(
        id=new_conv.id, title=new_conv.title, created_at=new_conv.created_at
    )

    return response


# Adds new message to history of given conversation.s
@router.post(
    "/addmessage",
    response_model=chatModels.MsgInfo,
    summary="Adds a message to a conversation's history.",
)
def add_message(
    msg: chatModels.NewMsg,
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
    # Attempt to grab conversation
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == msg.conversation_id,
            Conversation.user_id == current_user.user_id,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Create Message entry
    new_msg = Message(
        conversation_id=msg.conversation_id, role=msg.type, content=msg.text
    )

    try:
        db.add()
        db.commit()
        db.refresh(new_msg)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem adding message")

    response = chatModels.MsgInfo(
        conversation_id=new_msg.conversation_id,
        type=new_msg.role,
        text=new_msg.content,
        created_at=new_msg.created_at,
    )

    return response


# Grabs the chat history for a given conversation
@router.get(
    "/history/{conversation_id}",
    response_model=chatModels.ConversationHistory,
    summary="Gets chat history for given conversation.",
)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.user_id,
        )
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation
