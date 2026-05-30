import axios from "axios";

const API_URL = "http://localhost:3003/api";

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
 * Fetch semua peminjaman (borrowings)
 * @returns {Promise<Array>} Array berisi data peminjaman
 */
export const getBorrowings = async () => {
  try {
    const response = await apiClient.get("/borrowings");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching borrowings:", error);
    throw error;
  }
};

/**
 * Fetch peminjaman berdasarkan ID
 * @param {number} loanId - ID peminjaman
 * @returns {Promise<Object>} Data peminjaman
 */
export const getBorrowingById = async (loanId) => {
  try {
    const response = await apiClient.get(`/borrowings/${loanId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching borrowing ${loanId}:`, error);
    throw error;
  }
};

/**
 * Fetch peminjaman user saat ini
 * @returns {Promise<Array>} Array peminjaman user
 */
export const getUserBorrowings = async () => {
  try {
    const response = await apiClient.get("/user");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching user borrowings:", error);
    throw error;
  }
};

/**
 * Create peminjaman baru
 * @param {Object} borrowData - Data peminjaman
 * @param {number} borrowData.user_id - ID user
 * @param {number} borrowData.book_id - ID buku
 * @param {string} borrowData.borrow_date - Tanggal peminjaman (format: YYYY-MM-DD)
 * @returns {Promise<Object>} Data peminjaman yang baru dibuat
 */
export const createBorrowing = async (borrowData) => {
  try {
    const response = await apiClient.post("/borrowings", borrowData);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error creating borrowing:", error);
    throw error;
  }
};

/**
 * Return buku (kembalikan peminjaman)
 * @param {number} loanId - ID peminjaman
 * @param {string} return_date - Tanggal pengembalian (format: YYYY-MM-DD)
 * @returns {Promise<Object>} Data peminjaman yang diupdate
 */
export const returnBorrowing = async (loanId, return_date) => {
  try {
    const response = await apiClient.post(`/returns`, {
      borrowing_id: loanId,
      return_date,
      fine: 0,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error returning borrowing ${loanId}:`, error);
    throw error;
  }
};

/**
 * Update peminjaman
 * @param {number} loanId - ID peminjaman
 * @param {Object} borrowData - Data peminjaman yang diupdate
 * @returns {Promise<Object>} Data peminjaman yang diupdate
 */
export const updateBorrowing = async (loanId, borrowData) => {
  try {
    const response = await apiClient.put(`/${loanId}`, borrowData);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating borrowing ${loanId}:`, error);
    throw error;
  }
};

/**
 * Delete peminjaman
 * @param {number} loanId - ID peminjaman
 * @returns {Promise<void>}
 */
export const deleteBorrowing = async (loanId) => {
  try {
    await apiClient.delete(`/${loanId}`);
  } catch (error) {
    console.error(`Error deleting borrowing ${loanId}:`, error);
    throw error;
  }
};
