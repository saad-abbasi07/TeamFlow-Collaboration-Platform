'use client';
import React, { useState } from "react";
import { createTask } from "../services/taskService";

interface TaskFormProps {
  projectId: string;
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ projectId, onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({ title, description, projectId, priority, dueDate });
      setTitle(""); setDescription(""); setPriority(""); setDueDate("");
      onTaskCreated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="border p-2 w-full mb-2"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="border p-2 w-full mb-2"
      />
      <input
        type="text"
        placeholder="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;