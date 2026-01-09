// Top-level layout that wires together the three main UI pieces.
import { useState } from "react";
import DaySummary from "./components/DaySummary.jsx";
import TaskList from "./components/TaskList.jsx";
import AskCaroline from "./components/AskCaroline.jsx";
import FloatingAddButton from "./components/FloatingAddButton.jsx";
import AddEventForm from "./components/AddEventForm.jsx";
import AddTaskForm from "./components/AddTaskForm.jsx";

const AddModal = ({ onEventCreated, onTaskCreated }) => {
  const [activeTab, setActiveTab] = useState("event");

  const tabButtonStyle = (tab) => ({
    flex: 1,
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid",
    borderColor: activeTab === tab ? "#0f172a" : "#cbd5f5",
    backgroundColor: activeTab === tab ? "#0f172a" : "#f8fafc",
    color: activeTab === tab ? "#ffffff" : "#0f172a",
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px 28px",
          minWidth: "280px",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.2)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Add item</h2>
        <p style={{ margin: "12px 0 0", color: "#475569" }}>
          Add your new event or task here.
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button type="button" style={tabButtonStyle("event")} onClick={() => setActiveTab("event")}>
            Event
          </button>
          <button type="button" style={tabButtonStyle("task")} onClick={() => setActiveTab("task")}>
            Task
          </button>
        </div>
        <div style={{ marginTop: "20px" }}>
          {activeTab === "event" ? (
            <AddEventForm onSuccess={onEventCreated} />
          ) : (
            <AddTaskForm onSuccess={onTaskCreated} />
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [dayRefreshKey, setDayRefreshKey] = useState(0);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  const handleEventCreated = () => {
    setShowModal(false);
    setDayRefreshKey((prev) => prev + 1);
  };

  const handleTaskCreated = () => {
    setShowModal(false);
    setDayRefreshKey((prev) => prev + 1);
    setTaskRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chronos UI</h1>
        <p className="subtitle">Read-only schedule + tasks with a quick ChatGPT prompt.</p>
      </header>

      <main className="app-grid">
        <section className="panel">
          <DaySummary key={`day-${dayRefreshKey}`} onEventsLoaded={setEvents} />
        </section>

        <section className="panel">
          <TaskList key={`task-${taskRefreshKey}`} onTasksLoaded={setTasks} />
        </section>

        <section className="panel">
          <AskCaroline events={events} tasks={tasks} />
        </section>
      </main>

      {showModal ? (
        <AddModal onEventCreated={handleEventCreated} onTaskCreated={handleTaskCreated} />
      ) : null}
      <FloatingAddButton setShowModal={setShowModal} />
    </div>
  );
};

export default App;
