import { useState } from "react";
import { fetchDailyPrompt } from "../api.js";

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const DailyPrompt = () => {
  const [dateString] = useState(getTodayDateString());
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGeneratePrompt = async () => {
    try {
      setLoading(true);
      setError("");
      setCopied(false);
      const data = await fetchDailyPrompt(dateString);
      setPrompt(data);
    } catch (err) {
      setError("Unable to generate daily prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch (err) {
      setCopied(false);
      setError("Unable to copy prompt.");
    }
  };

  return (
    <div className="daily-prompt">
      <h2>Daily Prompt</h2>
      <p className="muted">Date: {dateString}</p>
      <button type="button" onClick={handleGeneratePrompt} disabled={loading}>
        {loading ? "Generating..." : "Generate Daily Prompt"}
      </button>
      {error && <p className="error">{error}</p>}
      <textarea
        readOnly
        rows={12}
        value={prompt}
        placeholder="Generate a daily prompt to see it here."
        aria-label="Daily prompt"
      />
      <button type="button" onClick={handleCopyPrompt} disabled={!prompt}>
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
};

export default DailyPrompt;
