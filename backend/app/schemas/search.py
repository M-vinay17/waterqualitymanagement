from pydantic import BaseModel, ConfigDict
from datetime import datetime


class SearchCreate(BaseModel):
    user_id: int
    parameter: str
    value: str


class SearchResponse(BaseModel):

    id: int
    user_id: int
    parameter: str
    value: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)