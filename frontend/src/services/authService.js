import axios from "axios";

const API_URL = "https://user-service-639080931374.asia-southeast2.run.app/api/users";

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const register = async ({ name, email, password, role = "mahasiswa" }) => {
  const response = await apiClient.post("/register", {
    name,
    email,
    password,
    role,
  });

  return response.data;
};

export const login = async (email, password) => {
  const response = await apiClient.post(`/login`, {
    email,
    password,
  });

  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};