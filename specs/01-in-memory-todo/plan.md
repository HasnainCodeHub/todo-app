# Phase I Technical Plan  
## Todo In-Memory Python Console Application

---

## 1. Goals & Constraints

**Goals:**
- Implement a command-line Todo application using Python that allows a user to manage a list of tasks stored entirely in memory during runtime.
- Establish clean domain logic, spec-driven development discipline, and a foundation that can evolve in later phases.
- The application must implement exactly the following five features:
  1. Add Task
  2. Delete Task
  3. Update Task
  4. View Task List
  5. Mark Task as Complete / Incomplete

**Constraints:**
- No persistence to disk or database. All data resets when the program exits.
- No web frameworks, HTTP APIs, AI, NLP, chatbots, or agents.
- No cloud tooling (Docker, Kubernetes, etc.).
- No task priorities, tags, due dates, reminders, or multi-user support.
- Python version 3.13+ must be used.
- The output must be a single Markdown plan document.
- The plan must be detailed enough that a later `/sp.tasks` step can derive concrete tasks, and `/sp.implement` can generate correct code.

---

## 2. Technology & Tooling

**Language:** Python 3.13+
**Tooling:** `uv` for environment and dependency management (if needed, though standard library is sufficient for Phase I).
**Dependencies:** No external runtime dependencies are strictly required; the solution will rely solely on Python's standard library.
**Project layout:** The project will adhere to a `src/` directory as the main source root.

This approach is sufficient for Phase I as the requirements are limited to an in-memory console application. Using standard library components minimizes external dependencies, simplifying setup and focusing on core logic, which aligns with the goal of establishing a clean foundation for future phases. `uv` is a modern, fast Python package manager and dependency resolver that is suitable for managing potential future dependencies, but its use is optional for this phase.

---

## 3. High-Level Architecture

The architecture will be a simple layered structure designed to ensure separation of concerns and facilitate future evolution.

-   **Presentation Layer (CLI)**
    -   **Responsibility:** Handling all direct user interaction. This includes displaying the main menu, presenting task lists, prompting for user input (e.g., task details, IDs, menu choices), and printing operation results or error messages to the console.
    -   **Location:** Primarily within `src/main.py`.
    -   **Interaction:** Calls functions in the Application/Service Layer to perform business logic operations based on user input.

-   **Application / Service Layer**
    -   **Responsibility:** Implementing the core business logic for managing tasks. This layer will encapsulate the operations for adding, listing, updating, deleting, and marking tasks as complete/incomplete. It will also be responsible for input validation related to these operations (e.g., non-empty titles, valid task IDs).
    -   **Location:** `src/services.py`.
    -   **Interaction:** Operates on the domain models provided by the Domain Layer. It manipulates the in-memory task collection and communicates results or errors back to the Presentation Layer.

-   **Domain / Model Layer**
    -   **Responsibility:** Defining the fundamental data structures and entities of the application. This includes the `Task` entity and its attributes.
    -   **Location:** `src/models.py`.
    -   **Interaction:** Provides the `Task` object definition to the Application/Service Layer. It does not contain operational logic but rather represents the data.

These layers interact sequentially: the Presentation Layer receives user input, passes it to the Application Layer for processing, which in turn uses the Domain Layer's models to perform operations on the in-memory state. Results are then returned up the stack to the Presentation Layer for display. This clear separation ensures that business logic is isolated and reusable, allowing the Presentation Layer to be easily swapped out for a web UI or API in later phases without affecting the core task management logic.

---

## 4. Data Structures & State Management

Tasks will be stored entirely in memory using standard Python data structures.

-   **Task Storage:** A Python list will be used to hold `Task` objects. This list will represent the current collection of tasks.
    -   Example: `tasks: list[Task] = []`
-   **ID Generation:** A simple integer counter, `next_id: int`, will be maintained to generate unique `id`s for new tasks. This counter will be incremented each time a new task is added.
    -   IDs are assigned sequentially and will not be reused during a single program execution.
-   **State Reset:** All data (the `tasks` list and `next_id` counter) will reside in the application's runtime memory. Consequently, the entire state will be reset and lost when the program exits.

**Operation Impact on State:**
-   **Add Task:** A new `Task` object will be instantiated, assigned the current `next_id` (which is then incremented), and appended to the `tasks` list.
-   **View Task List:** The `tasks` list will be iterated over to retrieve and display information about each `Task` object.
-   **Update Task:** The `tasks` list will be searched by `id`. Once the target `Task` object is found, its `title` and/or `description` attributes will be modified in place.
-   **Delete Task:** The `tasks` list will be searched by `id`. The found `Task` object will be removed from the list.
-   **Mark Task Complete / Incomplete:** The `tasks` list will be searched by `id`. The `completed` attribute of the found `Task` object will be toggled.

---

## 5. CLI Interaction & UX Flow

The application will provide a clear, menu-driven command-line interface.

### 5.1 Main Menu Loop

-   **Startup:** Upon execution, the application will immediately display a menu of available actions:
    ```
    Todo Application Menu:
    1. Add Task
    2. List Tasks
    3. Update Task
    4. Delete Task
    5. Mark Task Complete / Incomplete
    0. Exit
    Enter your choice:
    ```
-   **Loop Behavior:** The application will operate within a continuous loop. After each user action (successful or failed), the menu will be re-displayed, and the user will be prompted for another choice.
-   **Input Handling:**
    -   The application will read integer input corresponding to menu options.
    -   Invalid (non-numeric, out-of-range) choices will be handled gracefully with an error message, and the menu will reappear.
-   **Exit Condition:** The loop will terminate only when the user explicitly selects the "Exit" option (e.g., by entering `0`).

### 5.2 Input Flows

**Add Task**
-   **Prompt:**
    -   "Enter task title (required): "
    -   "Enter task description (optional): "
-   **Validation:**
    -   The entered title must not be empty. If empty, an error message ("Title cannot be empty.") will be displayed, and the user will be re-prompted or returned to the main menu.
-   **Confirmation:** "Task '[title]' added with ID [id]."

**List Tasks**
-   **Display:**
    -   If tasks exist, they will be displayed in a formatted table or list, showing `ID`, `Title`, `Description` (if present), and `Completion status` (e.g., `[x]` for complete, `[ ]` for incomplete).
    -   Example:
        ```
        ID  Title             Description         Status
        --- --------------- ------------------- --------
        1   Buy groceries     Milk, eggs, bread   [ ]
        2   Call mom                              [x]
        ```
    -   If no tasks are in the list, the message "No tasks found." will be displayed.

**Update Task**
-   **Prompt:**
    -   "Enter the ID of the task to update: "
-   **ID Validation:**
    -   If the entered ID is non-numeric, an error ("Invalid ID format.") will be shown.
    -   If the ID does not correspond to an existing task, an error ("Task with ID [id] not found.") will be shown.
    -   In both error cases, the application will return to the main menu.
-   **Update Prompts:**
    -   "Enter new title (press Enter to keep current: '[current_title]'): "
    -   "Enter new description (press Enter to keep current: '[current_description]'): "
-   **Title Validation:** If a new title is provided, it must not be empty. If empty, an error ("Title cannot be empty.") will be shown, and the update will be aborted, returning to the main menu.
-   **Confirmation:** "Task with ID [id] updated successfully."

**Delete Task**
-   **Prompt:**
    -   "Enter the ID of the task to delete: "
-   **ID Validation:**
    -   If the entered ID is non-numeric or does not exist, an error ("Invalid ID format." or "Task with ID [id] not found.") will be shown, and the application will return to the main menu.
-   **Confirmation:** "Task with ID [id] deleted successfully."

**Mark Task Complete / Incomplete**
-   **Prompt:**
    -   "Enter the ID of the task to mark: "
-   **ID Validation:**
    -   If the entered ID is non-numeric or does not exist, an error ("Invalid ID format." or "Task with ID [id] not found.") will be shown, and the application will return to the main menu.
-   **Confirmation:** "Task with ID [id] marked as [Complete/Incomplete]."

---

## 6. Error Handling Strategy

The application will implement robust error handling to ensure stability and provide clear user feedback.

-   **Invalid Menu Choices:**
    -   **Cause:** User enters non-numeric input or a number outside the valid menu range (e.g., `0-5`).
    -   **Handling:** Display "Invalid choice. Please enter a number from the menu." and re-display the main menu. The application must not crash.
-   **Non-Integer IDs:**
    -   **Cause:** User provides non-numeric input when an integer `id` is expected (e.g., for Update, Delete, Mark Complete/Incomplete).
    -   **Handling:** Catch `ValueError` during integer conversion. Display "Invalid ID format. Please enter a number." and return to the main menu.
-   **Non-Existent IDs:**
    -   **Cause:** User provides an integer `id` that does not correspond to any task in the in-memory list.
    -   **Handling:** Display "Task with ID [id] not found." and return to the main menu.
-   **Empty Titles:**
    -   **Cause:** User attempts to add a task with an empty title or update a task's title to an empty string.
    -   **Handling:** Display "Title cannot be empty." and abort the current operation, returning to the main menu.
-   **Operations on Empty Task List:**
    -   **Cause:** User attempts to List, Update, Delete, or Mark Complete/Incomplete when the `tasks` list is empty.
    -   **Handling:** For List, display "No tasks found." For Update/Delete/Mark, display "No tasks available to perform this action." and return to the main menu.

**General Principles:**
-   The program must never terminate unexpectedly (`crash`) due to user input or predictable error conditions.
-   All error messages must be clear, concise, and guide the user on how to correct their input or action.
-   After an error, the application will always return to the main menu loop, allowing the user to continue interacting with the application.

---

## 7. Project Structure

The project will follow a modular structure within a `src/` directory to promote separation of concerns and maintainability.

-   `src/`
    -   `main.py`:
        -   Acts as the application's entry point.
        -   Contains the main CLI loop, menu display logic, and functions for reading raw user input.
        -   Dispatches user requests to functions in `services.py`.
        -   Handles top-level error messages before returning to the main menu.
    -   `models.py`:
        -   Defines the `Task` class or dataclass.
        -   Attributes: `id` (int), `title` (str), `description` (str | None), `completed` (bool).
        -   May include a `__str__` or `__repr__` method for easy printing.
    -   `services.py`:
        -   Contains the business logic functions for task management.
        -   Manages the in-memory `tasks` list and `next_id` counter.
        -   Provides functions:
            -   `add_task(tasks: list[Task], next_id: int, title: str, description: str | None) -> tuple[list[Task], int]`
            -   `get_all_tasks(tasks: list[Task]) -> list[Task]` (or simply returns the list)
            -   `update_task(tasks: list[Task], task_id: int, new_title: str | None, new_description: str | None) -> bool`
            -   `delete_task(tasks: list[Task], task_id: int) -> bool`
            -   `toggle_task_completion(tasks: list[Task], task_id: int) -> tuple[bool, bool | None]` (returns success status and new completion status)
            -   Helper functions for finding tasks by ID, validating titles, etc.
    -   `utils.py` (optional):
        -   Could house generic utility functions such as console output formatting (`print_tasks_table`), general input validation (e.g., `get_integer_input`), or other reusable helpers that don't directly relate to task business logic or CLI control. This promotes cleaner `main.py` and `services.py`.

This structure ensures that changes to the CLI (e.g., different menu presentation) do not impact the core task logic, and vice-versa, making the application easier to maintain and evolve.

---

## 8. Testing & Manual Verification Plan

For Phase I, a manual testing checklist is sufficient to verify functionality due to the application's simplicity and in-memory nature.

**Manual Testing Checklist:**
-   **Basic Operations:**
    -   [ ] Add multiple tasks (e.g., 3-5 tasks) with varying titles and descriptions.
    -   [ ] List all tasks and verify that all added tasks are displayed correctly with their `id`, `title`, `description`, and `completed` status.
    -   [ ] Update an existing task:
        -   [ ] Change only the title. Verify the change.
        -   [ ] Change only the description. Verify the change.
        -   [ ] Change both title and description. Verify the changes.
        -   [ ] Attempt to update a task, but press Enter to skip changing title/description. Verify task remains unchanged.
    -   [ ] Toggle the completion status of a task from incomplete to complete. Verify the status change.
    -   [ ] Toggle the completion status of a task from complete to incomplete. Verify the status change.
    -   [ ] Delete an existing task. Verify it is removed from the list.
    -   [ ] Delete all tasks. Verify the list becomes empty.
-   **Error Handling:**
    -   [ ] Attempt to add a task with an empty title. Verify error message and no task is added.
    -   [ ] Attempt to update a task's title to be empty. Verify error message and no change.
    -   [ ] Attempt to perform an action (Update, Delete, Mark) with a non-numeric ID. Verify error message.
    -   [ ] Attempt to perform an action (Update, Delete, Mark) with an ID that does not exist. Verify error message.
    -   [ ] Attempt to perform actions (List, Update, Delete, Mark) when no tasks exist. Verify appropriate "No tasks found" or "No tasks available" messages.
    -   [ ] Enter an invalid menu choice (e.g., 'a', '9'). Verify error message and menu re-display.
-   **State Reset:**
    -   [ ] Add several tasks.
    -   [ ] Exit the application.
    -   [ ] Restart the application. Verify that no tasks are present (i.e., state was reset).

While manual testing is sufficient for Phase I, future phases may introduce automated unit and integration tests as complexity increases and external dependencies are introduced.

---

## 9. Evolution Considerations

The proposed design for Phase I is built with clear architectural separation to facilitate seamless evolution into future phases without requiring major rewrites of core logic.

-   **`Task` Model Reusability:** The `Task` domain model (`src/models.py`) is defined generically. It can be directly reused in:
    -   **Phase II (Web Application):** The same `Task` object can be serialized/deserialized for web API requests and responses.
    -   **Phase III (AI Chatbot):** The `Task` object can be used by an AI agent to understand and manipulate user tasks.
    -   **Later Phases:** Regardless of persistence or interaction method, the fundamental definition of a task remains consistent.

-   **Service Layer Isolation:** The functions in `src/services.py` are isolated from the CLI (Presentation Layer) and any persistence mechanism. This means:
    -   **Database Integration (Phase II+):** The `tasks: list[Task]` parameter in service functions can be easily replaced or abstracted by a `Repository` interface or a database access layer that interacts with a SQL database (e.g., SQLAlchemy) or NoSQL store. The service functions themselves (e.g., `add_task`, `update_task`) would largely remain the same, just operating on a different underlying data store.
    -   **API Exposure (Phase II):** The service functions can be directly called by web framework endpoints (e.g., FastAPI, Flask) to serve as the backend logic for an HTTP API.
    -   **Chatbot Integration (Phase III):** An AI agent can invoke these service functions based on natural language commands to manage tasks.

-   **Pluggable Presentation Layer:** The `src/main.py` CLI module is designed to be self-contained.
    -   **Web UI Replacement (Phase II):** The entire `main.py` can be replaced by a web application framework (e.g., React frontend, FastAPI backend) without any changes to `models.py` or `services.py`. The web application would simply call the `services.py` functions.
    -   **Chatbot Interface (Phase III):** A chatbot interface would similarly bypass `main.py` and interact directly with `services.py`.

This architectural foresight ensures that while Phase I is simple and adheres strictly to its in-memory, CLI-only constraints, its foundational structure is robust enough to accommodate the increased complexity and technological shifts planned for subsequent phases. No Phase II+ technology is implemented now; this section purely focuses on how the current architecture enables future growth.