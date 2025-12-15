"use client";

import { TaskSort } from "@/lib/types";

interface SortControlsProps {
  sort: TaskSort;
  onChange: (sort: TaskSort) => void;
}

export default function SortControls({ sort, onChange }: SortControlsProps) {
  const handleFieldChange = (value: string) => {
    onChange({
      ...sort,
      sort_by: value === "" ? undefined : (value as TaskSort["sort_by"]),
    });
  };

  const handleOrderChange = () => {
    onChange({
      ...sort,
      sort_order: sort.sort_order === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          value={sort.sort_by || "created_at"}
          onChange={(e) => handleFieldChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at">Created Date</option>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div className="pt-6">
        <button
          onClick={handleOrderChange}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 font-medium text-sm"
          title={`Sort ${sort.sort_order === "asc" ? "Ascending" : "Descending"}`}
        >
          {sort.sort_order === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>
    </div>
  );
}
