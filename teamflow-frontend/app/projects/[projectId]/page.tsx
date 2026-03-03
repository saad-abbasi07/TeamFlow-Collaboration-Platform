"use client";

import { useCallback, useEffect, useState } from "react";
import TaskItem from "./TaskItem";
import { getTasksByProject, createTask, Task } from "../../services/taskService";

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasksByProject(projectId);
      setTasks(data);
    } catch (err: unknown) {
      console.error(err);
    }
  }, [projectId]);

  useEffect(() => {
    Promise.resolve().then(fetchTasks);
  }, [fetchTasks]);

  const handleCreate = async () => {
    try {
      await createTask({ title, description, projectId });
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Project Tasks</h1>

      <div>
        <input
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleCreate}>Add Task</button>
      </div>

      <div>
        {tasks.map((task) => (
          <TaskItem key={task._id} task={task} refresh={fetchTasks} />
        ))}
      </div>
    </div>
  );
}