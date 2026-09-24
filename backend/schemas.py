from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict
from pydantic import Field

Priority = Literal["low", "medium", "high"]
Status = Literal["Open", "In Progress", "Resolved"]

class TicketCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=5000)
    requester_name: str = Field(min_length=1, max_length=80)
    priority: Priority = "medium"

class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    requester_name: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime

class StatusUpdate(BaseModel):
    status: Status
