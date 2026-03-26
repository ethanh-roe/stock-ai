from pydantic import BaseModel
from datetime import datetime
from app.schema import MessageType

class ConversationInfo(BaseModel):
    id: int
    title: str
    created_at: datetime
    model_config = {"from_attributes": True}

class ConversationHistory(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: list["MsgInfo"]
    model_config = {"from_attributes": True}

class MsgInfo(BaseModel):
    conversation_id: int
    role: MessageType
    content: str
    created_at: datetime
    model_config = {"from_attributes": True}

class NewMsg(BaseModel):
    conversation_id: int
    role: MessageType
    content: str

class SendMsg(BaseModel):
    conversation_id: int
    ticker: str
    content: str

class ConvoRename(BaseModel):
    id: int
    title: str
