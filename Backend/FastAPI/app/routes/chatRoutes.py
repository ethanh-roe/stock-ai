from app.models import chatModels
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, status
from app.security import user_from_jwt
from app.schema import Conversation, Message
from app.database import get_db
from openai import OpenAI

client = OpenAI()
router = APIRouter(prefix="/chat", tags=["chat messages"])


# Creates a new conversation to store a sequence of messages to/from LLM.
@router.post(
    "/conversation/new",
    response_model=chatModels.ConversationInfo,
    summary="Creates a new conversation for message storage.",
)
def create_conversation(
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
    user_id = current_user.user_id

    new_conv = Conversation(user_id=user_id, title="New Conversation")

    try:
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem creating conversation")

    # Return the newly created conversation record directly
    return new_conv


@router.patch(
    "/conversation/rename",
    response_model=chatModels.ConversationInfo,
    summary="Rename a conversation.",
)
def rename_convo(
    request: chatModels.ConvoRename,
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
    convo = (
        db.query(Conversation)
        .filter(
            Conversation.id == request.id,
            Conversation.user_id == current_user.user_id,
        )
        .first()
    )

    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    convo.title = request.title
    db.commit()
    db.refresh(convo)

    # Return the updated ORM object directly (matches response_model)
    return convo


@router.post(
    "/conversation/addmsg",
    response_model=chatModels.MsgInfo,
    summary="Adds a message to a conversation's history.",
)
def add_message(
    msg: chatModels.NewMsg,
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
    # Verify the conversation belongs to the current user
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

    new_msg = Message(
        conversation_id=msg.conversation_id,
        role=msg.role,
        content=msg.content,
    )

    try:
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem adding message")

    return chatModels.MsgInfo(
        conversation_id=new_msg.conversation_id,
        role=new_msg.role,
        content=new_msg.content,
        created_at=new_msg.created_at,
    )


# Grabs the chat history for a given conversation
@router.get(
    "/conversation/{conversation_id}",
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


# Sends the conversation history to OpenAI and returns the assistant's reply.
# The caller is responsible for saving the returned message via /conversation/addmsg.
@router.post(
    "/conversation/{conversation_id}/reply",
    response_model=chatModels.MsgInfo,
    summary="Generate an AI reply for the given conversation.",
)
def generate_reply(
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

    # Build the message history for OpenAI from oldest to newest
    history = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    if not history:
        raise HTTPException(status_code=400, detail="No messages in conversation to reply to")

    openai_messages = [{"role": msg.role, "content": msg.content} for msg in history]

    try:
        response = client.responses.create(
            model="gpt-4o",
            instructions=(
                "You are a financial advisor. "
                "Only respond to questions about finance, stocks, and investing. "
                "Politely decline any off-topic questions."
            ),
            input=openai_messages,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {str(e)}")

    assistant_content = response.output_text

    # Persist the assistant reply
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=assistant_content,
    )

    try:
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem saving assistant reply")

    return chatModels.MsgInfo(
        conversation_id=assistant_msg.conversation_id,
        role=assistant_msg.role,
        content=assistant_msg.content,
        created_at=assistant_msg.created_at,
    )

@router.post(
    "/conversation/send",
    response_model=chatModels.MsgInfo,
    summary="Save user message and return AI reply in one request.",
)
def send_message(
    msg: chatModels.SendMsg,
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
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

    user_msg = Message(
        conversation_id=msg.conversation_id,
        role="user",
        content=msg.content,
    )
    try:
        db.add(user_msg)
        db.commit()
        db.refresh(user_msg)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem saving user message")

    history = (
        db.query(Message)
        .filter(Message.conversation_id == msg.conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    openai_messages = [{"role": m.role, "content": m.content} for m in history]

    try:
        response = client.responses.create(
            model="gpt-4o",
            instructions=(
                "You are a financial advisor. "
                "Only respond to questions about finance, stocks, and investing. "
                "Politely decline any off-topic questions."
            ),
            input=openai_messages,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {str(e)}")

    assistant_msg = Message(
        conversation_id=msg.conversation_id,
        role="assistant",
        content=response.output_text,
    )
    try:
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem saving assistant reply")

    return chatModels.MsgInfo(
        conversation_id=assistant_msg.conversation_id,
        role=assistant_msg.role,
        content=assistant_msg.content,
        created_at=assistant_msg.created_at,
    )
