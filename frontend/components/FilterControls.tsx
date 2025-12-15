"use client";

import { TaskFilters } from "@/lib/types";

interface FilterControlsProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  availableTags: string[];
}

export default function FilterControls({
  filters,
  onChange,
  availableTags,
}: FilterControlsProps) {
  const handleChange = (key: keyof TaskFilters, value: string) => {
    onChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={filters.status || ""}
          onChange={(e) => handleChange("status", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          value={filters.priority || ""}
          onChange={(e) => handleChange("priority", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tag
        </label>
        <select
          value={filters.tag || ""}
          onChange={(e) => handleChange("tag", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date From
        </label>
        <input
          type="date"
          value={filters.due_from || ""}
          onChange={(e) => handleChange("due_from", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date To
        </label>
        <input
          type="date"
          value={filters.due_to || ""}
          onChange={(e) => handleChange("due_to", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
