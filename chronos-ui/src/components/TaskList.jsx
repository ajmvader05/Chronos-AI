// Fetches and displays tasks from the Chronos backend.
import { useEffect, useState } from "react";
import { AUTH_TOKEN, fetchTasks } from "../api.js";

const TaskList = ({ onTasksLoaded, taskRefreshKey }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await fetchTasks({
          Authorization: `Bearer ${AUTH_TOKEN}`,
        });
        const tasksList = (data ?? []).filter((task) => task.status === "open");

        if (isMounted) {
          setTasks(tasksList);
          onTasksLoaded(tasksList);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load tasks.");
          onTasksLoaded([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [onTasksLoaded, taskRefreshKey]);

  const getPriorityLabel = (priority) => {
    if (priority === 1) return "low";
    if (priority === 2) return "medium";
    if (priority === 3) return "high";
    return "unknown";
  };

  return (
    <div>
      <h2>Tasks</h2>
      {loading && <p>Loading tasks...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <ul className="list">
          {tasks.length === 0 && <li>No tasks yet.</li>}
          {tasks.map((task) => (
            <li key={task.id ?? task.title}>
              <div>{task.title}</div>
              <div>
                Due:{" "}
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString()
                  : "N/A"}
              </div>
              <div>Priority: {getPriorityLabel(task.priority)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
