from typing import List, Optional, Tuple
from src.models import Task

tasks: List[Task] = []
next_id: int = 1

def add_task(title: str, description: Optional[str] = None) -> Task:
    global next_id
    if not title:
        raise ValueError("Title cannot be empty.")
    
    new_task = Task(id=next_id, title=title, description=description)
    tasks.append(new_task)
    next_id += 1
    return new_task

def get_all_tasks() -> List[Task]:
    return list(tasks)

def find_task_by_id(task_id: int) -> Optional[Task]:
    for task in tasks:
        if task.id == task_id:
            return task
    return None

def update_task(task_id: int, new_title: Optional[str] = None, new_description: Optional[str] = None) -> bool:
    task = find_task_by_id(task_id)
    if not task:
        return False
    
    if new_title is not None:
        if not new_title:
            raise ValueError("Title cannot be empty.")
        task.title = new_title
    
    if new_description is not None:
        task.description = new_description
        
    return True

def delete_task(task_id: int) -> bool:
    global tasks
    original_len = len(tasks)
    tasks = [task for task in tasks if task.id != task_id]
    return len(tasks) < original_len

def toggle_task_completion(task_id: int) -> Tuple[bool, Optional[bool]]:
    task = find_task_by_id(task_id)
    if not task:
        return False, None
    
    task.completed = not task.completed
    return True, task.completed