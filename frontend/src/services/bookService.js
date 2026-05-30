import axios from "axios";

const API_URL = "https://book-service-639080931374.asia-southeast2.run.app/api/books";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Create axios instance dengan default headers
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add token ke setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fetch semua buku dari Book Service
 * @returns {Promise<Array>} Array berisi data buku
 */
export const getBooks = async () => {
  try {
    const response = await apiClient.get("/");
    return response.data.data || response.data.books || response.data || [];
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

/**
 * Fetch buku berdasarkan ID
 * @param {number} bookId - ID buku
 * @returns {Promise<Object>} Data buku
 */
export const getBookById = async (bookId) => {
  try {
    const response = await apiClient.get(`/${bookId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching book ${bookId}:`, error);
    throw error;
  }
};

/**
 * Cari buku berdasarkan title atau author
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array hasil pencarian
 */
export const searchBooks = async (query) => {
  try {
    const response = await apiClient.get("/", {
      params: { search: query },
    });
    return response.data.data || response.data.books || response.data || [];
  } catch (error) {
    console.error("Error searching books:", error);
    throw error;
  }
};

/**
 * Create buku baru (admin only)
 * @param {Object} bookData - Data buku
 * @returns {Promise<Object>} Data buku yang baru dibuat
 */
export const createBook = async (bookData) => {
  try {
    const response = await apiClient.post("/", bookData);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error creating book:", error);
    throw error;
  }
};

/**
 * Update buku (admin only)
 * @param {number} bookId - ID buku
 * @param {Object} bookData - Data buku yang diupdate
 * @returns {Promise<Object>} Data buku yang diupdate
 */
export const updateBook = async (bookId, bookData) => {
  try {
    const response = await apiClient.put(`/${bookId}`, bookData);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating book ${bookId}:`, error);
    throw error;
  }
};

/**
 * Delete buku (admin only)
 * @param {number} bookId - ID buku
 * @returns {Promise<void>}
 */
export const deleteBook = async (bookId) => {
  try {
    await apiClient.delete(`/${bookId}`);
  } catch (error) {
    console.error(`Error deleting book ${bookId}:`, error);
    throw error;
  }
};
