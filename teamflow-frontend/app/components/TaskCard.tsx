import { Task } from "../services/taskService";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="border p-4 rounded-md">
      <h4 className="font-semibold">{task.title}</h4>
      <p>{task.description || ""}</p>
      {task.dueDate ? (
        <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
      ) : null}
    </div>
  );
}