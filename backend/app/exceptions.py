"""Custom exceptions for the Todo API.

Defines application-specific exceptions with error codes for client consumption.
"""


class TodoAPIException(Exception):
    """Base exception for all Todo API errors.

    Attributes:
        message: Human-readable error message
        code: Machine-readable error code
    """

    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code
        super().__init__(self.message)


class TaskNotFoundError(TodoAPIException):
    """Raised when a requested task does not exist."""

    def __init__(self, task_id: int):
        super().__init__(
            message=f"Task with ID {task_id} not found",
            code="TASK_NOT_FOUND"
        )
        self.task_id = task_id


class EmptyTitleError(TodoAPIException):
    """Raised when attempting to create/update a task with an empty title."""

    def __init__(self):
        super().__init__(
            message="Task title cannot be empty",
            code="EMPTY_TITLE"
        )


class ValidationError(TodoAPIException):
    """Raised when input validation fails."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR"
        )
