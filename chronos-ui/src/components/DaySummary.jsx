// Fetches and displays events for a chosen day (defaults to tomorrow).
import { useEffect, useState } from "react";
import { deleteEvent, fetchDaySummary, updateEvent } from "../api.js";

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const formatEventTime = (event) => {
  if (!event.start_time) return "";
  return new Date(event.start_time).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const noop = () => {};

const DaySummary = ({ onEventsLoaded = noop }) => {
  const [dateString] = useState(getTomorrowDateString());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);
  const [editValues, setEditValues] = useState({
    title: "",
    start_time: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchDaySummary(dateString);
        const eventsList = data?.events ?? [];

        if (isMounted) {
          setEvents(eventsList);
          onEventsLoaded(eventsList);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load events.");
          onEventsLoaded([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [dateString, onEventsLoaded]);

  const startEditing = (event) => {
    setEditingEventId(event.id);
    setEditValues({
      title: event.title ?? "",
      start_time: event.start_time ? event.start_time.slice(0, 16) : "",
    });
  };

  const cancelEditing = () => {
    setEditingEventId(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateEvent = async (event, eventId) => {
    event.preventDefault();
    setError("");
    const previousEvents = events;
    const optimisticUpdates = {
      title: editValues.title,
      start_time: editValues.start_time
        ? new Date(editValues.start_time).toISOString()
        : null,
    };
    const nextEvents = events.map((item) =>
      item.id === eventId ? { ...item, ...optimisticUpdates } : item
    );
    setEvents(nextEvents);
    onEventsLoaded(nextEvents);
    setEditingEventId(null);

    try {
      const updatedEvent = await updateEvent(eventId, optimisticUpdates);
      const confirmedEvents = nextEvents.map((item) =>
        item.id === eventId ? updatedEvent : item
      );
      setEvents(confirmedEvents);
      onEventsLoaded(confirmedEvents);
    } catch (err) {
      setEvents(previousEvents);
      onEventsLoaded(previousEvents);
      setError("Unable to update event.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event?")) return;
    setError("");
    const previousEvents = events;
    const nextEvents = events.filter((event) => event.id !== eventId);
    setEvents(nextEvents);
    onEventsLoaded(nextEvents);

    try {
      await deleteEvent(eventId);
    } catch (err) {
      setEvents(previousEvents);
      onEventsLoaded(previousEvents);
      setError("Unable to delete event.");
    }
  };

  return (
    <div>
      <h2>Tomorrow&apos;s Events</h2>
      <p className="muted">Date: {dateString}</p>

      {loading && <p>Loading events...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <ul className="list">
          {events.length === 0 && <li>No events scheduled.</li>}
          {events.map((event) => (
            <li key={event.id ?? `${event.title}-${event.start_time}`}>
              {editingEventId === event.id ? (
                <form onSubmit={(e) => handleUpdateEvent(e, event.id)}>
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
                    Start time
                    <input
                      type="datetime-local"
                      name="start_time"
                      value={editValues.start_time}
                      onChange={handleEditChange}
                    />
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
                  <strong>{formatEventTime(event)}</strong> {event.title}
                  <div>
                    <button type="button" onClick={() => startEditing(event)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id)}
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

export default DaySummary;
