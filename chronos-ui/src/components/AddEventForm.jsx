import { useState } from "react";
import { createEvent } from "../api.js";

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #cbd5f5",
  fontSize: "14px",
};

const labelStyle = { display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" };

const AddEventForm = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [calendar, setCalendar] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !date) {
      setError("Title and date are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await createEvent({
        title: title.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        calendar,
        location,
        notes,
      });
      onSuccess?.();
    } catch (err) {
      setError("Unable to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gap: "12px" }}>
        <div>
          <label style={labelStyle} htmlFor="event-title">
            Title *
          </label>
          <input
            id="event-title"
            style={inputStyle}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Planning session"
            required
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="event-date">
            Date *
          </label>
          <input
            id="event-date"
            style={inputStyle}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="event-start-time">
            Start time
          </label>
          <input
            id="event-start-time"
            style={inputStyle}
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="event-end-time">
            End time
          </label>
          <input
            id="event-end-time"
            style={inputStyle}
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="event-calendar">
            Calendar
          </label>
          <input
            id="event-calendar"
            style={inputStyle}
            type="text"
            value={calendar}
            onChange={(event) => setCalendar(event.target.value)}
            placeholder="Main calendar"
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="event-location">
            Location
          </label>
          <input
            id="event-location"
            style={inputStyle}
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Conference room"
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="event-notes">
            Notes
          </label>
          <textarea
            id="event-notes"
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Agenda, attendees, etc."
          />
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
        {submitting ? "Adding event..." : "Add event"}
      </button>
    </form>
  );
};

export default AddEventForm;
