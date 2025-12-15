# Todo App Frontend

A modern, responsive Todo application frontend built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Task Management**: Create, read, update, and delete tasks
- **Advanced Filtering**: Filter by status, priority, tags, and due date range
- **Flexible Sorting**: Sort by due date, priority, title, or creation date
- **Search**: Real-time debounced search across task titles and descriptions
- **Visual Indicators**: Color-coded priority badges and due date status alerts
- **Recurring Tasks**: Support for daily, weekly, and monthly recurring tasks
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Data Fetching**: Custom hooks with native fetch API

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000` (or configured URL)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (optional):
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` if your backend API is not on `http://localhost:8000`:
   ```
   NEXT_PUBLIC_API_URL=http://your-api-url:port
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (task list)
│   ├── globals.css          # Global styles
│   └── tasks/               # Task routes
│       ├── new/             # Create task page
│       └── [id]/edit/       # Edit task page
├── components/              # React components
│   ├── TaskList.tsx        # Task list container
│   ├── TaskItem.tsx        # Individual task card
│   ├── TaskForm.tsx        # Create/edit form
│   ├── SearchBar.tsx       # Search input with debounce
│   ├── FilterControls.tsx  # Filter dropdowns
│   ├── SortControls.tsx    # Sort controls
│   ├── DueDateIndicator.tsx # Due date status badge
│   ├── PriorityBadge.tsx   # Priority badge
│   └── TagList.tsx         # Tag chips
├── hooks/                   # Custom React hooks
│   ├── useTasks.ts         # Fetch and manage tasks
│   └── useTaskMutations.ts # Create/update/delete operations
├── lib/                     # Utilities
│   ├── api.ts              # API client functions
│   └── types.ts            # TypeScript type definitions
└── package.json            # Dependencies

```

## API Integration

The frontend communicates with the FastAPI backend through a REST API:

- **GET** `/api/tasks` - List tasks with filters and sorting
- **GET** `/api/tasks/{id}` - Get single task
- **POST** `/api/tasks` - Create task
- **PUT** `/api/tasks/{id}` - Update task
- **PATCH** `/api/tasks/{id}/complete` - Mark complete
- **PATCH** `/api/tasks/{id}/incomplete` - Mark incomplete
- **DELETE** `/api/tasks/{id}` - Delete task

## Component Overview

### Pages

- **Home (/)**: Main task list with search, filters, sort controls
- **/tasks/new**: Create new task form
- **/tasks/[id]/edit**: Edit existing task form

### Components

- **TaskList**: Container that renders TaskItems, handles loading/error states
- **TaskItem**: Displays task with checkbox, badges, edit/delete actions
- **TaskForm**: Reusable form for creating and editing tasks
- **SearchBar**: Debounced search input (300ms delay)
- **FilterControls**: Dropdowns for status, priority, tag, date range
- **SortControls**: Sort field selector and order toggle
- **DueDateIndicator**: Shows due date with OVERDUE/DUE SOON badges
- **PriorityBadge**: Color-coded priority display (High=Red, Medium=Yellow, Low=Green)
- **TagList**: Displays tags as blue chips

### Custom Hooks

- **useTasks(filters, sort)**: Fetches tasks with auto-refresh on filter/sort changes
- **useTaskMutations()**: Provides create, update, delete, complete, incomplete functions

## Visual Design

### Priority Colors
- **High**: Red badge
- **Medium**: Yellow badge
- **Low**: Green badge

### Due Date Indicators
- **Overdue**: Red "OVERDUE" badge (past due date, not completed)
- **Due Soon**: Yellow "DUE SOON" badge (within 24 hours, not completed)
- **Completed**: No indicator (strikethrough title, dimmed)

### Task States
- **Active**: Full opacity
- **Completed**: Line-through title, 50% opacity

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### TypeScript

The project uses strict TypeScript mode. All API responses are typed, and type safety is enforced throughout the codebase.

### Styling

Tailwind CSS is used for all styling. Key design principles:
- Mobile-first responsive design
- Consistent spacing and colors
- Accessible form controls
- Smooth transitions

## Browser Support

- Modern browsers with ES2017+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## Known Limitations

- No authentication (single-user app in Phase II)
- No pagination (loads all tasks)
- No offline support
- No real-time updates

## Future Enhancements (Phase III+)

- User authentication and multi-user support
- AI-powered task suggestions
- Real-time collaboration
- Offline PWA support
- Push notifications

## License

Private project - Phase II of Full-Stack Todo App
