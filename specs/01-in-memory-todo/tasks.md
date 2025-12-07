# Phase I Task Breakdown
## Todo In-Memory Python Console Application

---

## 1. Planning & Repository Hygiene

- [ ] T001 Verify Python 3.13+ environment readiness
  - Short description: Check if Python 3.13 or a newer version is installed and accessible.
  - Category: planning
  - Dependencies: None
  - Acceptance criteria:
    - Python 3.13+ is installed.
    - Python is added to PATH.
    - `python --version` command outputs 3.13 or higher.

- [ ] T002 Verify `uv` installation
  - Short description: Ensure `uv` is installed, as it's recommended for dependency management.
  - Category: planning
  - Dependencies: None
  - Acceptance criteria:
    - `uv --version` command executes successfully.
    - `uv` is installed and functional.

- [ ] T003 Confirm repository structure (`.specify/`)
  - Short description: Verify that the `.specify/` directory contains the constitution, feature specs, and history as expected.
  - Category: planning
  - Dependencies: None
  - Acceptance criteria:
    - `.specify/memory/constitution.md` exists.
    - `specs/01-in-memory-todo/spec.md` exists.
    - `specs/01-in-memory-todo/plan.md` exists.
    - `history/prompts/01-in-memory-todo/` directory exists.

- [X] T004 Create `src/` directory
  - Short description: Set up the main source code directory.
  - Category: planning
  - Dependencies: None
  - Acceptance criteria:
    - `src/` directory is created at the project root.

---

## 2. Domain Model Implementation Tasks

- [X] T005 Create `src/models.py` for `Task` entity
- [X] T006 Define `id` attribute in `Task` model
- [X] T007 Define `title` attribute in `Task` model
- [X] T008 Define `description` attribute in `Task` model
- [X] T009 Define `completed` attribute in `Task` model

---

## 3. In-Memory State & Data Structure Tasks

- [X] T010 Initialize `tasks` list and `next_id` in `src/services.py`
  - Short description: Set up the in-memory storage for tasks and the ID counter within the `services` module.
  - Category: state
  - Dependencies: T009
  - Acceptance criteria:
    - `src/services.py` is created.
    - It initializes `tasks: list[Task] = []` and `next_id: int = 1`.
    - `Task` model is imported into `src/services.py`.

---

## 4. Service / Business Logic Tasks

- [X] T011 [US1] Implement `add_task` function in `src/services.py`
- [X] T012 [US4] Implement `get_all_tasks` function in `src/services.py`
- [X] T013 [US3] Implement `find_task_by_id` helper function in `src/services.py`
- [X] T014 [US3] Implement `update_task` function in `src/services.py`
- [X] T015 [US2] Implement `delete_task` function in `src/services.py`
- [X] T016 [US5] Implement `toggle_task_completion` function in `src/services.py`

---

## 5. CLI / Presentation Layer Tasks

- [X] T017 Create `src/main.py` entry point
- [X] T018 Implement main menu display in `src/main.py`
- [X] T019 Implement main application loop in `src/main.py`
- [X] T020 Implement `handle_add_task` in `src/main.py` [US1]
- [X] T021 Implement `handle_list_tasks` in `src/main.py` [US4]
- [X] T022 Implement `handle_update_task` in `src/main.py` [US3]
- [X] T023 Implement `handle_delete_task` in `src/main.py` [US2]
- [X] T024 Implement `handle_toggle_completion` in `src/main.py` [US5]
- [X] T025 Implement `get_numeric_input` helper in `src/main.py` (or `src/utils.py`)
- [X] T026 Handle invalid menu choices in `src/main.py`
- [X] T027 Handle non-existent task IDs in CLI handlers (`src/main.py`)
- [X] T028 Handle empty task list operations in `src/main.py`

---

## 7. Manual Testing Tasks

- [X] T029 Perform manual test: Add and List Tasks
- [X] T030 Perform manual test: Update Tasks
- [X] T031 Perform manual test: Delete Tasks
- [X] T032 Perform manual test: Toggle Completion
- [X] T033 Perform manual test: Error Handling
- [X] T034 Perform manual test: State Reset

---

## 8. Documentation & Cleanup Tasks

- [X] T035 Update `README.md` with setup and usage instructions
- [X] T036 Create or update `GEMINI.md` (or equivalent AI instructions)
- [X] T037 Final code structure review
- [X] T038 Verify no future-phase tech introduction
