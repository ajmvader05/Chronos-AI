// Top-level layout that wires together the three main UI pieces.
import { useState } from "react";
import DaySummary from "./components/DaySummary.jsx";
import TaskList from "./components/TaskList.jsx";
import AskCaroline from "./components/AskCaroline.jsx";
import FloatingAddButton from "./components/FloatingAddButton.jsx";

const AddModal = () => {
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
      </div>
    </div>
  );
};

const App = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chronos UI</h1>
        <p className="subtitle">Read-only schedule + tasks with a quick ChatGPT prompt.</p>
      </header>

      <main className="app-grid">
        <section className="panel">
          <DaySummary onEventsLoaded={setEvents} />
        </section>

        <section className="panel">
          <TaskList onTasksLoaded={setTasks} />
        </section>

        <section className="panel">
          <AskCaroline events={events} tasks={tasks} />
        </section>
      </main>

      {showModal ? <AddModal /> : null}
      <FloatingAddButton setShowModal={setShowModal} />
    </div>
  );
};

export default App;
