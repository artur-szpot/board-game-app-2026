from pydantic import BaseModel


class NamedItem(BaseModel):
    id: str
    name: str
