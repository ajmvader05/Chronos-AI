// Simple fetch wrappers for Chronos backend endpoints.

// TODO: Replace with your Cloudflare Worker or API base URL.
const BASE_URL = "https://your-chronos-worker.example.com";

// TODO: Replace with your real token once authentication is available.
export const AUTH_TOKEN = "YOUR_TOKEN_HERE";

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

export const fetchTasks = async (headers = defaultHeaders) => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }

  return response.json();
};

export const createEvent = async (eventData) => {
  const response = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error("Failed to create event");
  }

  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
};

export const completeTask = async (taskId) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: defaultHeaders,
    body: JSON.stringify({ status: "completed" }),
  });

  if (!response.ok) {
    throw new Error("Failed to complete task");
  }

  return response.json();
};

export const fetchDaySummary = async (dateString) => {
  const response = await fetch(`${BASE_URL}/ai/day?date=${dateString}`, {
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error("Failed to load day summary");
  }

  return response.json();
};
