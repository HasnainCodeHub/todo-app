# Phase I Specification ## Todo In-Memory Python Console Application

---

## 1. Objective
Build a command-line Todo application using Python that allows a user to manage a list of tasks stored entirely in memory during runtime. The purpose of Phase I is to establish clean domain logic, spec-driven development discipline, and a foundation that can evolve in later phases.

---

## 2. In-Scope Features
The application MUST implement exactly the following five features:
1. Add Task
2. Delete Task
3. Update Task
4. View Task List
5. Mark Task as Complete or Incomplete
No additional features are permitted.

---

## 3. Out-of-Scope (Explicit)
The following are strictly forbidden in Phase I:
- Databases or file persistence
- Web frameworks or HTTP APIs
- AI, NLP, chatbots, or agents
- Cloud tooling (Docker, Kubernetes, etc.)
- Task priorities, tags, due dates, or reminders
- Multi-user support

---

## 4. User Interaction Model (CLI)
The application must run entirely in the terminal.
### 4.1 Startup Behavior
- On start, the application displays a menu of available actions.
- The menu repeats after every action until the user exits.
### 4.2 Menu Options
At minimum, the menu must allow:
- Add a new task
- List all tasks
- Update an existing task
- Delete a task
- Mark task as complete / incomplete
- Exit the application
User input is via standard input (stdin).

---

## 5. Task Domain Model
### 5.1 Task Entity
Each task MUST have:
- `id` — unique integer identifier, auto-incremented
- `title` — short text, required, non-empty
- `description` — optional text
- `completed` — boolean status (default: false)
IDs must remain stable throughout runtime.

---

## 6. Functional Requirements
### 6.1 Add Task
- User provides title and optional description.
- Title must be validated as non-empty.
- A new task is created with `completed = false`.
- The task is added to the in-memory list.
- The system confirms task creation.
### 6.2 View Task List
- Displays all tasks in a readable table or list.
- Each task shows:
    - ID
    - Title
    - Description (if present)
    - Completion status (e.g., ✅ / ❌ or [x] / [ ])
- If no tasks exist, display a clear “No tasks found” message.
### 6.3 Update Task
- User selects a task by ID.
- If ID does not exist, show an error and return to menu.
- User may update:
    - Title (must remain non-empty)
    - Description
- Completion status is NOT changed here.
- System confirms successful update.
### 6.4 Delete Task
- User selects a task by ID.
- If ID does not exist, show an error and return to menu.
- The task is removed from memory.
- System confirms deletion.
### 6.5 Mark Task Complete / Incomplete
- User selects a task by ID.
- If ID does not exist, show an error.
- Toggle the `completed` status.
- System confirms the new status.

---

## 7. Error Handling & Validation
- Invalid menu choices must not crash the app.
- Non-integer IDs must be handled gracefully.
- Empty titles must be rejected.
- Attempting actions on an empty task list must show a friendly message.
- The application must never terminate unexpectedly due to user input.

---

## 8. Non-Functional Requirements
- Python version: 3.13+
- Code must follow clean structure and readability.
- Logic must be separated from user interaction where reasonable.
- All data must reset when the program exits.

---

## 9. Project Structure (Guidance)
The generated implementation should follow a clean structure similar to:
- `src/`
- `main.py` (CLI entry point)
- `models.py` (task entity)
- `services.py` (task management logic)
- `README.md` with setup and usage instructions
Exact filenames are flexible but separation of concerns is required.

---

## 10. Acceptance Criteria
The feature is complete when:
- All five required features work correctly.
- The app runs fully in the terminal.
- No data persists between runs.
- No forbidden features or technologies are present.
- The implementation matches this specification exactly.
