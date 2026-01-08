// Top-level layout that wires together the three main UI pieces.
import { useState } from "react";
import DaySummary from "./components/DaySummary.jsx";
import TaskList from "./components/TaskList.jsx";
import AskCaroline from "./components/AskCaroline.jsx";

const App = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);

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
    </div>
  );
};

export default App;
