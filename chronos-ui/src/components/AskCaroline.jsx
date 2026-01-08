// Builds a single prompt from events + tasks + question, then opens ChatGPT.
import { useMemo, useState } from "react";

const formatEvents = (events) =>
  events
    .map((event) => `${event.startTime ?? event.time ?? ""} ${event.title}`.trim())
    .join("\n");

const formatTasks = (tasks) => tasks.map((task) => `- ${task.title}`).join("\n");

const AskCaroline = ({ events, tasks }) => {
  const [question, setQuestion] = useState("");

  const prompt = useMemo(() => {
    const eventsBlock = events.length ? formatEvents(events) : "(No events)";
    const tasksBlock = tasks.length ? formatTasks(tasks) : "(No tasks)";

    return [
      "You are helping me with my schedule.",
      "",
      "Events:",
      eventsBlock,
      "",
      "Tasks:",
      tasksBlock,
      "",
      "Question:",
      question || "(No question yet)",
    ].join("\n");
  }, [events, tasks, question]);

  const handleOpenChatGPT = () => {
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://chat.openai.com/?prompt=${encodedPrompt}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <h2>Ask Caroline</h2>
      <p className="muted">
        Caroline will use your events and tasks to answer your question.
      </p>
      <label htmlFor="question" className="label">
        Your question
      </label>
      <textarea
        id="question"
        rows={5}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="What should I focus on tomorrow?"
      />
      <button type="button" onClick={handleOpenChatGPT}>
        Open in ChatGPT with context
      </button>

      <details className="preview">
        <summary>Preview prompt</summary>
        <pre>{prompt}</pre>
      </details>
    </div>
  );
};

export default AskCaroline;
