// Fetches and displays events for a chosen day (defaults to tomorrow).
import { useEffect, useState } from "react";
import { fetchDaySummary } from "../api.js";

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const DaySummary = ({ onEventsLoaded }) => {
  const [dateString] = useState(getTomorrowDateString());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            <li key={event.id ?? `${event.title}-${event.startTime}`}>
              <strong>{event.startTime ?? event.time ?? ""}</strong> {event.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DaySummary;
