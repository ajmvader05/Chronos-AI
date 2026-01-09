import { useState } from "react";
import { createTask } from "../api.js";

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #cbd5f5",
  fontSize: "14px",
};

const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" };

const AddTaskForm = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await createTask({
        title: title.trim(),
        due_date: dueDate,
        priority,
      });
      onSuccess?.();
    } catch (err) {
      setError("Unable to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gap: "12px" }}>
        <div>
          <label style={labelStyle} htmlFor="task-title">
            Title *
          </label>
          <input
            id="task-title"
            style={inputStyle}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Draft weekly update"
            required
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="task-due-date">
            Due date
          </label>
          <input
            id="task-due-date"
            style={inputStyle}
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            style={inputStyle}
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      {error && <p style={{ color: "#b91c1c", margin: "12px 0 0" }}>{error}</p>}
      <button
        type="submit"
        style={{
          marginTop: "16px",
          padding: "10px 16px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
        }}
        disabled={submitting}
      >
        {submitting ? "Adding task..." : "Add task"}
      </button>
    </form>
  );
};

export default AddTaskForm;
