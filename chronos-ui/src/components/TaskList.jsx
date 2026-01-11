// Fetches and displays tasks from the Chronos backend.
import { useEffect, useState } from "react";
import { completeTask, fetchTasks } from "../api.js";

const TaskList = ({ onTasksLoaded, taskRefreshKey }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasksList = async () => {
    const data = await fetchTasks();
    return (data ?? []).filter((task) => task.status === "open");
  };

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        setLoading(true);
        const tasksList = await fetchTasksList();

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

  const handleCompleteTask = async (taskId) => {
    try {
      setLoading(true);
      setError("");
      await completeTask(taskId);
      const tasksList = await fetchTasksList();
      setTasks(tasksList);
      onTasksLoaded(tasksList);
    } catch (err) {
      setError("Unable to load tasks.");
      onTasksLoaded([]);
    } finally {
      setLoading(false);
    }
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
              {task.status === "open" && (
                <button type="button" onClick={() => handleCompleteTask(task.id)}>
                  Complete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
