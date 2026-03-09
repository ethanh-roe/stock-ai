from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from app.schema import MessageType


class ConversationInfo(BaseModel):
    id: int
    title: str
    created_at: datetime


class NewMsg(BaseModel):
    conversation_id: int
    role: MessageType
    content: str


class MsgInfo(BaseModel):
    conversation_id: int
    role: MessageType
    content: str
    created_at: datetime


class ConversationHistory(BaseModel):
    id: int
    title: str
    messages: list[MsgInfo]

    class Config:
        orm_mode = True
