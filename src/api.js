// Simple fetch wrappers for Chronos backend endpoints.

// TODO: Replace with your Cloudflare Worker or API base URL.
const BASE_URL = "https://your-chronos-worker.example.com";

// TODO: Replace with your real token once authentication is available.
const AUTH_TOKEN = "YOUR_TOKEN_HERE";

const defaultHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${AUTH_TOKEN}`,
};

export const fetchEventsForDate = async (dateString) => {
  const response = await fetch(`${BASE_URL}/events?date=${dateString}`, {
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error("Failed to load events");
  }

  return response.json();
};

export const fetchTasks = async () => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }

  return response.json();
};
