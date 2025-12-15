# Phase II Demo Script

**Duration:** 60-90 seconds
**Purpose:** Demonstrate all Phase II features of the Full-Stack Todo Application

---

## Pre-Demo Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Neon database connected
- [ ] Browser open with DevTools (optional)
- [ ] Task list is empty or has a few sample tasks

---

## Demo Flow (90 seconds)

### 1. Introduction (5 sec)
**Say:** "This is Phase II of our Todo App - a full-stack web application with Next.js, FastAPI, and Neon Postgres."

**Action:** Show the main task list page.

---

### 2. Create a Task (15 sec)
**Say:** "Let's create a new task with all features."

**Actions:**
1. Click **"+ Add Task"** button
2. Fill in:
   - Title: `"Weekly Team Standup"`
   - Description: `"Discuss sprint progress"`
   - Priority: `High`
   - Tags: `work, meeting`
   - Due Date: Tomorrow at 9:00 AM
   - Recurrence: `Weekly`
3. Click **Submit**

**Say:** "Notice the task appears with a red high-priority badge and recurrence indicator."

---

### 3. Show Visual Indicators (10 sec)
**Say:** "The app shows visual indicators for task status."

**Actions:**
1. Point to the **priority badge** (red for high)
2. Point to the **due date** and "DUE SOON" badge (if within 24h)
3. Point to the **recurrence badge** showing "Weekly"

---

### 4. Demonstrate Filtering (15 sec)
**Say:** "We can filter tasks by various criteria."

**Actions:**
1. Create another task: `"Buy groceries"` (Low priority)
2. Set **Priority filter** to "High"
3. Show only high-priority tasks appear
4. Reset filter to "All"

---

### 5. Demonstrate Search (10 sec)
**Say:** "Real-time search across titles and descriptions."

**Actions:**
1. Type `"standup"` in the search bar
2. Show only matching task appears
3. Clear search

---

### 6. Demonstrate Sorting (10 sec)
**Say:** "Tasks can be sorted by different fields."

**Actions:**
1. Select **Sort by: Priority**
2. Toggle to **Descending**
3. Show high priority tasks first

---

### 7. Complete a Recurring Task (15 sec)
**Say:** "When we complete a recurring task, the system automatically creates the next occurrence."

**Actions:**
1. Click the checkbox on the **"Weekly Team Standup"** task
2. Task becomes completed (strikethrough)
3. **Point out:** New task appears with due date +7 days
4. **Say:** "The original is marked complete, and next week's meeting is automatically created."

---

### 8. Show Persistence (10 sec)
**Say:** "All data is persisted in Neon Postgres."

**Actions:**
1. **Refresh the browser** (F5)
2. **Show:** All tasks are still there
3. **Say:** "Data survives page refresh and server restart."

---

### 9. Wrap-up (5 sec)
**Say:** "Phase II is complete - full CRUD, priorities, tags, search, filter, sort, recurring tasks, and visual indicators. Ready for Phase III with AI integration."

---

## Key Features to Highlight

| Feature | Demo Action |
|---------|-------------|
| **Create Task** | Click "Add Task", fill form, submit |
| **Priority Badges** | Point to red/yellow/green badges |
| **Tags** | Show tag chips on task |
| **Due Date** | Show date and OVERDUE/DUE SOON |
| **Recurrence** | Create weekly task, complete it |
| **Search** | Type keyword, see results filter |
| **Filter** | Use dropdown to filter by status/priority |
| **Sort** | Change sort order, show reordering |
| **Persistence** | Refresh page, data remains |

---

## Troubleshooting During Demo

| Issue | Fix |
|-------|-----|
| Tasks not loading | Check backend is running |
| API errors | Check browser console, verify CORS |
| No due date indicator | Task may not be overdue/soon |
| Recurrence not showing | Verify recurrence was set to non-"none" |

---

## Post-Demo Q&A Points

- **Architecture:** Next.js + FastAPI + Neon (serverless Postgres)
- **Tech Stack:** TypeScript, Python 3.13+, SQLModel
- **Testing:** pytest with SQLite in-memory for unit/API tests
- **Phase III Plans:** AI/chatbot integration
- **Not in Phase II:** Authentication, Docker, event bus

---

**End of Demo Script**
