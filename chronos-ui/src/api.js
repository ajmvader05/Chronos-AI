// Simple fetch wrappers for Chronos backend endpoints.

const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN = import.meta.env.VITE_API_TOKEN;

console.log("API:", BASE_URL);
console.log("Token loaded:", !!AUTH_TOKEN);

const buildAuthHeader = () => {
  if (!AUTH_TOKEN) {
    console.warn(
      "Chronos API token is missing. Set VITE_API_TOKEN in your environment."
    );
  }
  return `Bearer ${AUTH_TOKEN ?? ""}`;
};

const buildHeaders = (overrides = {}) => ({
  "Content-Type": "application/json",
  Authorization: buildAuthHeader(),
  ...overrides,
});

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (response.status === 401) {
    console.error("Chronos API request unauthorized (401).");
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchEventsForDate = (dateString) =>
  requestJson(`${BASE_URL}/events?date=${dateString}`);

export const fetchTasks = () => requestJson(`${BASE_URL}/tasks`);

export const createEvent = (eventData) =>
  requestJson(`${BASE_URL}/events`, {
    method: "POST",
    body: JSON.stringify(eventData),
  });

export const createTask = (taskData) =>
  requestJson(`${BASE_URL}/tasks`, {
    method: "POST",
    body: JSON.stringify(taskData),
  });

export const completeTask = (taskId) =>
  requestJson(`${BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" }),
  });

export const fetchDaySummary = (dateString) =>
  requestJson(`${BASE_URL}/ai/day?date=${dateString}`);
