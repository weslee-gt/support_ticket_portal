from datetime import datetime
from pydantic import BaseModel, ConfigDict
from pydantic import Field

class TicketCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=5000)
    requester_name: str = Field(min_length=1, max_length=80)
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")

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
    status: str