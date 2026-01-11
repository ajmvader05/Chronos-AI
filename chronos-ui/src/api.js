// Simple fetch wrappers for Chronos backend endpoints.

const BASE_URL = import.meta.env.VITE_API_URL;
export const AUTH_TOKEN = import.meta.env.VITE_API_TOKEN;

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

const defaultHeaders = buildHeaders();

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (response.status === 401) {
    console.error("Chronos API request unauthorized (401).");
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Chronos API request failed.", {
      status: response.status,
      body: errorBody,
    });
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

const requestText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (response.status === 401) {
    console.error("Chronos API request unauthorized (401).");
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Chronos API request failed.", {
      status: response.status,
      body: errorBody,
    });
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.text();
};

export const fetchEventsForDate = (dateString) =>
  requestJson(`${BASE_URL}/events?start=${dateString}&end=${dateString}`);

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

export const updateTask = async (taskId, updates) => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: defaultHeaders,
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTask = async (taskId) => {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
};

export const updateEvent = async (eventId, updates) => {
  const res = await fetch(`${BASE_URL}/events/${eventId}`, {
    method: "PATCH",
    headers: defaultHeaders,
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
};

export const deleteEvent = async (eventId) => {
  const res = await fetch(`${BASE_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: defaultHeaders,
  });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
};

export const fetchDaySummary = (dateString) =>
  requestJson(`${BASE_URL}/snapshot?snapshot_date=${dateString}`);

export const fetchDailyPrompt = (dateString) =>
  requestText(`${BASE_URL}/daily-prompt?date=${dateString}`, {
    method: "POST",
    body: JSON.stringify({
      clientTime: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });
