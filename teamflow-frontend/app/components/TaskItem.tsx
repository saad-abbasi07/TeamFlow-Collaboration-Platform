'use client';
import React from "react";

interface TaskItemProps {
  title: string;
  description: string;
  priority?: string;
  dueDate?: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ title, description, priority, dueDate }) => {
  return (
    <div className="border p-4 rounded shadow mb-2">
      <h3 className="font-bold">{title}</h3>
      <p>{description}</p>
      {priority && <p>Priority: {priority}</p>}
      {dueDate && <p>Due: {new Date(dueDate).toLocaleDateString()}</p>}
    </div>
  );
};

export default TaskItem;