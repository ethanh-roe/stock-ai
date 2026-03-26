from app.models import chatModels
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from app.security import user_from_jwt
from app.schema import Conversation, Message, MessageType
from app.database import get_db
from app.agents.chatBot import get_ai_reply

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post(
    "/conversation/new",
    response_model=chatModels.ConversationInfo,
    summary="Creates a new conversation.",
)
def create_conversation(
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
    new_conv = Conversation(user_id=current_user.user_id, title="New Conversation")
    try:
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem creating conversation")
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
        .filter(Conversation.id == request.id, Conversation.user_id == current_user.user_id)
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    convo.title = request.title
    db.commit()
    db.refresh(convo)
    return convo


@router.get(
    "/conversation/{conversation_id}",
    response_model=chatModels.ConversationHistory,
    summary="Gets chat history for a given conversation.",
)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.user_id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


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
        .filter(Conversation.id == msg.conversation_id, Conversation.user_id == current_user.user_id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    user_msg = Message(conversation_id=msg.conversation_id, role=MessageType.USER, content=msg.content)
    try:
        db.add(user_msg)
        db.commit()
        db.refresh(user_msg)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem saving user message")

    try:
        reply_text, new_response_id = get_ai_reply(
            content=msg.content,
            ticker=msg.ticker,
            previous_response_id=conversation.last_response_id,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {str(e)}")

    conversation.last_response_id = new_response_id
    db.commit()

    assistant_msg = Message(conversation_id=msg.conversation_id, role=MessageType.ASSISTANT, content=reply_text)
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
