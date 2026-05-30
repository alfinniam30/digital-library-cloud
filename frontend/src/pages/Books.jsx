import { useEffect, useState } from "react";
import { getBooks, createBook, deleteBook } from "../services/bookService";
import { getUserFromToken } from "../services/authService";
import "../styles/Books.css";

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [adminForm, setAdminForm] = useState({
    title: "",
    author: "",
    year: "",
    category_id: "",
    stock: 1,
  });
  const [adminError, setAdminError] = useState(null);
  const [adminSuccess, setAdminSuccess] = useState(null);

  const user = getUserFromToken();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Load books saat component mount
  useEffect(() => {
    loadBooks();
  }, []);

  // Filter books berdasarkan search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, books]);

  useEffect(() => {
    if (adminSuccess) {
      const timer = setTimeout(() => setAdminSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [adminSuccess]);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getBooks();
      // Pastikan data adalah array
      const booksArray = Array.isArray(data) ? data : [];
      setBooks(booksArray);
      setFilteredBooks(booksArray);
    } catch (err) {
      console.error("Gagal mengambil data buku:", err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data buku. Silakan coba lagi."
      );
      setBooks([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({
      ...prev,
      [name]:
        name === "stock" || name === "year" || name === "category_id"
          ? Number(value)
          : value,
    }));
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminForm.title || !adminForm.author || !adminForm.year || !adminForm.stock) {
      setAdminError("Judul, penulis, tahun, dan stok wajib diisi.");
      return;
    }

    try {
      await createBook(adminForm);
      setAdminSuccess("Buku berhasil ditambahkan.");
      setAdminForm({ title: "", author: "", year: "", category_id: "", stock: 1 });
      loadBooks();
    } catch (err) {
      console.error("Gagal menambahkan buku:", err);
      setAdminError(
        err.response?.data?.message ||
          "Gagal menambahkan buku. Silakan coba lagi."
      );
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Yakin ingin menghapus buku ini?")) {
      return;
    }

    try {
      await deleteBook(bookId);
      const updatedBooks = books.filter((book) => book.id !== bookId);
      setBooks(updatedBooks);
      setFilteredBooks(updatedBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      setAdminSuccess("Buku berhasil dihapus.");
    } catch (err) {
      console.error("Gagal menghapus buku:", err);
      setAdminError(
        err.response?.data?.message ||
          "Gagal menghapus buku. Silakan coba lagi."
      );
    }
  };

  return (
    <div className="books-container">
      <div className="books-header">
        <h1>📚 Daftar Buku Perpustakaan</h1>
        <button onClick={loadBooks} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Cari buku berdasarkan judul atau penulis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={loadBooks} className="btn-retry">
            Coba Lagi
          </button>
        </div>
      )}

      {!loading && isAdmin && (
        <div className="admin-panel">
          <div className="admin-header">
            <h2>➕ Tambah Buku Baru</h2>
            <p>Hanya admin yang dapat menambahkan buku baru ke katalog.</p>
          </div>
          <form onSubmit={handleCreateBook} className="admin-form">
            <div className="admin-row">
              <input
                type="text"
                name="title"
                placeholder="Judul buku"
                value={adminForm.title}
                onChange={handleAdminChange}
              />
              <input
                type="text"
                name="author"
                placeholder="Penulis"
                value={adminForm.author}
                onChange={handleAdminChange}
              />
            </div>

            <div className="admin-row">
              <input
                type="number"
                name="year"
                placeholder="Tahun terbit"
                value={adminForm.year}
                onChange={handleAdminChange}
                min="1900"
              />
              <input
                type="text"
                name="category_id"
                placeholder="Kategori ID"
                value={adminForm.category_id}
                onChange={handleAdminChange}
              />
            </div>

            <div className="admin-row admin-row-single">
              <input
                type="number"
                name="stock"
                placeholder="Stok"
                value={adminForm.stock}
                onChange={handleAdminChange}
                min="1"
              />
            </div>

            {adminError && <div className="admin-error">{adminError}</div>}
            {adminSuccess && <div className="admin-success">{adminSuccess}</div>}

            <button type="submit" className="btn-submit-book">
              Tambah Buku
            </button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-message">
          <p>⏳ Memuat data buku...</p>
        </div>
      )}

      {/* Books Table */}
      {!loading && !error && (
        <div className="table-wrapper">
          {filteredBooks.length === 0 ? (
            <div className="no-data">
              <p>
                {books.length === 0
                  ? "Belum ada data buku"
                  : "Tidak ada hasil yang sesuai dengan pencarian"}
              </p>
            </div>
          ) : (
            <table className="books-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Judul Buku</th>
                  <th>Penulis</th>
                  <th>Stok</th>
                  <th className="status-col">Status</th>
                  {isAdmin && <th className="action-col">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="table-row">
                    <td className="id-col">{book.id}</td>
                    <td className="title-col">{book.title}</td>
                    <td className="author-col">{book.author}</td>
                    <td className="stock-col">
                      <span className="stock-badge">{book.stock}</span>
                    </td>
                    <td className="status-col">
                      {book.stock > 0 ? (
                        <span className="badge-available">Tersedia</span>
                      ) : (
                        <span className="badge-unavailable">Tidak Tersedia</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="action-col">
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="table-footer">
            <p>
              Menampilkan <strong>{filteredBooks.length}</strong> dari{" "}
              <strong>{books.length}</strong> buku
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;