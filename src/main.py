import src.services as services
from src.models import Task
from typing import Optional

def display_menu():
    print("\nTodo Application Menu:")
    print("1. Add Task")
    print("2. List Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Task Complete / Incomplete")
    print("0. Exit")

def get_numeric_input(prompt_message: str) -> Optional[int]:
    while True:
        user_input = input(prompt_message).strip()
        if not user_input:
            return None # Allow empty input for optional fields or skipping updates
        try:
            return int(user_input)
        except ValueError:
            print("Invalid input. Please enter a number.")

def handle_add_task():
    title = input("Enter task title (required): ").strip()
    description = input("Enter task description (optional): ").strip()
    if not description:
        description = None

    try:
        new_task = services.add_task(title, description)
        print(f"Task '{new_task.title}' added with ID {new_task.id}.")
    except ValueError as e:
        print(f"Error: {e}")

def handle_list_tasks():
    tasks = services.get_all_tasks()
    if not tasks:
        print("No tasks found.")
        return

    print("\n--- Your Tasks ---")
    print(f"{ 'ID':<4} {'Title':<30} {'Description':<40} {'Status':<10}")
    print(f"{ '----':<4} {'------------------------------':<30} {'----------------------------------------':<40} {'----------':<10}")
    for task in tasks:
        status = "✅ Complete" if task.completed else "❌ Incomplete"
        description = task.description if task.description else ""
        print(f"{task.id:<4} {task.title:<30} {description:<40} {status:<10}")
    print("------------------")

def handle_update_task():
    if not services.get_all_tasks():
        print("No tasks available to perform this action.")
        return

    task_id = get_numeric_input("Enter the ID of the task to update: ")
    if task_id is None: # User pressed enter without input
        print("Task ID cannot be empty.")
        return

    task_to_update = services.find_task_by_id(task_id)
    if not task_to_update:
        print(f"Task with ID {task_id} not found.")
        return
    
    print(f"Updating Task ID: {task_id}, Current Title: '{task_to_update.title}', Current Description: '{task_to_update.description if task_to_update.description else ''}'")

    new_title = input(f"Enter new title (press Enter to keep current: '{task_to_update.title}'): ").strip()
    if new_title == "":
        new_title = None # Keep current title
    
    new_description = input(f"Enter new description (press Enter to keep current: '{task_to_update.description if task_to_update.description else ''}'): ").strip()
    if new_description == "":
        new_description = None # Keep current description

    try:
        if services.update_task(task_id, new_title, new_description):
            print(f"Task with ID {task_id} updated successfully.")
        else:
            print(f"Task with ID {task_id} not found or no changes made.")
    except ValueError as e:
        print(f"Error: {e}")


def handle_delete_task():
    if not services.get_all_tasks():
        print("No tasks available to perform this action.")
        return

    task_id = get_numeric_input("Enter the ID of the task to delete: ")
    if task_id is None:
        print("Task ID cannot be empty.")
        return

    if services.delete_task(task_id):
        print(f"Task with ID {task_id} deleted successfully.")
    else:
        print(f"Task with ID {task_id} not found.")

def handle_toggle_completion():
    if not services.get_all_tasks():
        print("No tasks available to perform this action.")
        return

    task_id = get_numeric_input("Enter the ID of the task to mark: ")
    if task_id is None:
        print("Task ID cannot be empty.")
        return

    success, new_status = services.toggle_task_completion(task_id)
    if success:
        status_str = "Complete" if new_status else "Incomplete"
        print(f"Task with ID {task_id} marked as {status_str}.")
    else:
        print(f"Task with ID {task_id} not found.")

def main_loop():
    while True:
        display_menu()
        choice = get_numeric_input("Enter your choice: ")

        if choice == 1:
            handle_add_task()
        elif choice == 2:
            handle_list_tasks()
        elif choice == 3:
            handle_update_task()
        elif choice == 4:
            handle_delete_task()
        elif choice == 5:
            handle_toggle_completion()
        elif choice == 0:
            print("Exiting Todo Application. Goodbye!")
            break
        else:
            print("Invalid choice. Please enter a number from the menu (0-5).")

if __name__ == "__main__":
    main_loop()
