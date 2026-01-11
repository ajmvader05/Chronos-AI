// Fetches and displays tasks from the Chronos backend.
import { useEffect, useState } from "react";
import { completeTask, deleteTask, fetchTasks, updateTask } from "../api.js";

const noop = () => {};

const TaskList = ({ onTasksLoaded = noop, taskRefreshKey }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editValues, setEditValues] = useState({
    title: "",
    due_date: "",
    priority: 2,
  });

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

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditValues({
      title: task.title ?? "",
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      priority: task.priority ?? 2,
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: name === "priority" ? Number(value) : value,
    }));
  };

  const handleUpdateTask = async (event, taskId) => {
    event.preventDefault();
    try {
      setError("");
      const updates = {
        title: editValues.title,
        due_date: editValues.due_date || null,
        priority: editValues.priority,
      };
      const updatedTask = await updateTask(taskId, updates);
      const nextTasks = tasks.map((task) =>
        task.id === taskId ? updatedTask : task
      );
      setTasks(nextTasks);
      onTasksLoaded(nextTasks);
      setEditingTaskId(null);
    } catch (err) {
      setError("Unable to update task.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      setError("");
      await deleteTask(taskId);
      const nextTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(nextTasks);
      onTasksLoaded(nextTasks);
    } catch (err) {
      setError("Unable to delete task.");
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
              {editingTaskId === task.id ? (
                <form onSubmit={(event) => handleUpdateTask(event, task.id)}>
                  <label>
                    Title
                    <input
                      name="title"
                      value={editValues.title}
                      onChange={handleEditChange}
                      required
                    />
                  </label>
                  <label>
                    Due date
                    <input
                      type="date"
                      name="due_date"
                      value={editValues.due_date}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>
                    Priority
                    <select
                      name="priority"
                      value={editValues.priority}
                      onChange={handleEditChange}
                    >
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                    </select>
                  </label>
                  <div>
                    <button type="submit">Save</button>
                    <button type="button" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>{task.title}</div>
                  <div>
                    Due:{" "}
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div>Priority: {getPriorityLabel(task.priority)}</div>
                  <div>
                    {task.status === "open" && (
                      <button
                        type="button"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Complete
                      </button>
                    )}
                    <button type="button" onClick={() => startEditing(task)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
