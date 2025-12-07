from dataclasses import dataclass, field
from typing import Optional

@dataclass
class Task:
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = field(default=False)
