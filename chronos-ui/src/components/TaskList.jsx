// Fetches and displays tasks from the Chronos backend.
import { useEffect, useState } from "react";
import { fetchTasks } from "../api.js";

const TaskList = ({ onTasksLoaded }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await fetchTasks();
        const tasksList = data?.tasks ?? [];

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
  }, [onTasksLoaded]);

  return (
    <div>
      <h2>Tasks</h2>
      {loading && <p>Loading tasks...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <ul className="list">
          {tasks.length === 0 && <li>No tasks yet.</li>}
          {tasks.map((task) => (
            <li key={task.id ?? task.title}>{task.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
