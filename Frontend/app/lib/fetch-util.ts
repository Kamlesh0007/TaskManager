import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api-v1";

// ✅ Create a reusable Axios instance
// Every request made using "api" will have this baseURL and default headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Request Interceptor
// Runs before each request is sent
// Used to automatically attach JWT token to Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token ?? ""}`;
  }
  return config;
});

// 🔹 Response Interceptor
// Runs on every response received
// Useful for handling global errors (like expired tokens)
// Add a global handler for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 (Unauthorized), it means token is invalid/expired
    if (error.response && error.response.status === 401) {
      // Trigger a custom event so AuthProvider can catch it and log user out
      window.dispatchEvent(new Event("force-logout"));
    }
    return Promise.reject(error); // pass error forward for handling
  }
);

const postData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.post(url, data);

  return response.data;
};

const updateData = async <T>(url: string, data: unknown): Promise<T> => {
  const response = await api.put(url, data);

  return response.data;
};

const fetchData = async <T>(url: string): Promise<T> => {
  const response = await api.get(url);

  return response.data;
};

const deleteData = async <T>(url: string): Promise<T> => {
  const response = await api.delete(url);

  return response.data;
};

export { postData, fetchData, updateData, deleteData };