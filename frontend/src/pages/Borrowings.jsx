import { useEffect, useState } from "react";
import {
  getBorrowings,
  createBorrowing,
  returnBorrowing,
} from "../services/loanService";
import { getBooks } from "../services/bookService";
import { getUserFromToken } from "../services/authService";
import "../styles/Borrowings.css";

function Borrowings() {
  const currentUser = getUserFromToken();
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    user_id: currentUser?.id || "",
    book_id: "",
    borrow_date: new Date().toISOString().split("T")[0],
  });

  // Load borrowings dan books saat component mount
  useEffect(() => {
    loadData();
  }, []);

  // Clear success message setelah 3 detik
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    let bookError = null;
    let borrowingError = null;

    try {
      const booksData = await getBooks();
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (err) {
      console.error("Gagal memload data buku:", err);
      bookError =
        err.response?.data?.message ||
        "Gagal memuat daftar buku. Silakan coba lagi.";
      setBooks([]);
    }

    try {
      const borrowingsData = await getBorrowings();
      setBorrowings(Array.isArray(borrowingsData) ? borrowingsData : []);
    } catch (err) {
      console.error("Gagal memload data peminjaman:", err);
      borrowingError =
        err.response?.data?.message ||
        "Gagal memuat daftar peminjaman. Silakan coba lagi.";
      setBorrowings([]);
    }

    if (bookError && borrowingError) {
      setError(`${bookError} ${borrowingError}`);
    } else if (bookError) {
      setError(bookError);
    } else if (borrowingError) {
      setError(borrowingError);
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "book_id" || name === "user_id"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validasi form
    if ((!formData.user_id && !currentUser?.id) || !formData.book_id || !formData.borrow_date) {
      setError("Semua field harus diisi");
      setSubmitting(false);
      return;
    }

    try {
      // Convert values ke number dan gunakan user login jika tersedia
      const borrowData = {
        user_id: currentUser?.id ? Number(currentUser.id) : parseInt(formData.user_id),
        book_id: parseInt(formData.book_id),
        borrow_date: formData.borrow_date,
        status: "borrowed",
      };

      await createBorrowing(borrowData);

      // Refresh data dari backend supaya record baru tampil lengkap
      await loadData();

      // Reset form
      setFormData({
        user_id: currentUser?.id || "",
        book_id: "",
        borrow_date: new Date().toISOString().split("T")[0],
      });

      setSuccessMessage("✅ Peminjaman berhasil ditambahkan!");
    } catch (err) {
      console.error("Gagal membuat peminjaman:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.sqlMessage ||
          "Gagal membuat peminjaman. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (loanId) => {
    if (!window.confirm("Apakah Anda yakin ingin mengembalikan buku ini?")) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      await returnBorrowing(loanId, today);

      // Refresh data from backend to ensure returned status and stock are persisted
      await loadData();

      setSuccessMessage("✅ Buku berhasil dikembalikan!");
    } catch (err) {
      console.error("Gagal mengembalikan buku:", err);
      setError(
        err.response?.data?.message ||
          "Gagal mengembalikan buku. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getBookTitle = (bookId) => {
    const book = books.find((b) => b.id === bookId);
    return book ? book.title : `Book ID: ${bookId}`;
  };

  const calculateDaysOverdue = (borrowDate, returnDate) => {
    if (!borrowDate) return 0;
    
    const borrow = new Date(borrowDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    
    const diffTime = Math.abs(returned - borrow);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="borrowings-container">
      <h1>📖 Peminjaman Buku</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn-close">
            ×
          </button>
        </div>
      )}

      <div className="borrowings-content">
        {/* Form Section */}
        <div className="form-section">
          <h2>📝 Tambah Peminjaman Baru</h2>
          <form onSubmit={handleSubmit} className="borrowing-form">
            <div className="form-group">
              <label htmlFor="user_id">ID User</label>
              <input
                type="number"
                id="user_id"
                name="user_id"
                value={currentUser?.id || formData.user_id}
                onChange={handleInputChange}
                placeholder={currentUser ? "ID user diisi otomatis" : "Masukkan ID user..."}
                min="1"
                disabled={Boolean(currentUser) || submitting}
                readOnly={Boolean(currentUser)}
              />
              {currentUser && (
                <p className="note-text">
                  Meminjam sebagai <strong>{currentUser.email}</strong>.
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="book_id">Pilih Buku</label>
              <select
                id="book_id"
                name="book_id"
                value={formData.book_id}
                onChange={handleInputChange}
                disabled={submitting || books.length === 0}
              >
                <option value="">-- Pilih Buku --</option>
                {books.map((book) => (
                  <option
                    key={book.id || book.book_id}
                    value={book.id || book.book_id}
                    disabled={book.stock === 0}
                  >
                    {book.title || book.name || "Buku tanpa Judul"} {book.stock === 0 ? "(Tidak Tersedia)" : ""}
                  </option>
                ))}
              </select>
              {books.length === 0 && !loading && (
                <p className="no-books-note">
                  Tidak ada buku tersedia. Silakan tambah buku di halaman Buku terlebih dahulu.
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="borrow_date">Tanggal Peminjaman</label>
              <input
                type="date"
                id="borrow_date"
                name="borrow_date"
                value={formData.borrow_date}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={submitting || books.length === 0}
            >
              {submitting ? "⏳ Menyimpan..." : "💾 Simpan Peminjaman"}
            </button>
          </form>
        </div>

        {/* Borrowings List Section */}
        <div className="list-section">
          <div className="list-header">
            <h2>📊 Daftar Peminjaman</h2>
            <button onClick={loadData} className="btn-refresh" disabled={loading}>
              🔄 Refresh
            </button>
          </div>

          {loading && (
            <div className="loading-message">
              <p>⏳ Memuat data peminjaman...</p>
            </div>
          )}

          {!loading && borrowings.length === 0 && (
            <div className="no-data">
              <p>Belum ada data peminjaman</p>
            </div>
          )}

          {!loading && borrowings.length > 0 && (
            <div className="table-wrapper">
              <table className="borrowings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Judul Buku</th>
                    <th>Tgl Pinjam</th>
                    <th>Tgl Kembali</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings.map((borrowing) => {
                    const isReturned = borrowing.return_date || borrowing.status === "returned";
                    const daysOverdue = calculateDaysOverdue(
                      borrowing.borrow_date,
                      borrowing.return_date
                    );

                    return (
                      <tr key={borrowing.id} className={isReturned ? "row-returned" : ""}>
                        <td className="id-col">{borrowing.id}</td>
                        <td className="user-col">{borrowing.user_id}</td>
                        <td className="book-col">
                          {getBookTitle(borrowing.book_id)}
                        </td>
                        <td className="date-col">
                          {new Date(borrowing.borrow_date).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                        <td className="date-col">
                          {borrowing.return_date
                            ? new Date(
                                borrowing.return_date
                              ).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                        <td className="status-col">
                          {isReturned ? (
                            <span className="badge-returned">Dikembalikan</span>
                          ) : (
                            <span className="badge-borrowed">
                              Dipinjam ({daysOverdue} hari)
                            </span>
                          )}
                        </td>
                        <td className="action-col">
                          {!isReturned && (
                            <button
                              onClick={() => handleReturn(borrowing.id)}
                              className="btn-return"
                              disabled={submitting}
                            >
                              Kembalikan
                            </button>
                          )}
                          {isReturned && <span className="completed">✓</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="table-footer">
                <p>
                  Total: <strong>{borrowings.length}</strong> peminjaman (
                  <strong>
                    {borrowings.filter((b) => !b.return_date && b.status !== "returned")
                      .length}
                  </strong>{" "}
                  aktif)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Borrowings;