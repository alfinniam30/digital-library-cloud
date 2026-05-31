import { useEffect, useState } from "react";
import { getBooks, createBook, updateBook, deleteBook } from "../services/bookService";
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
    publisher: "",
    isbn: "",
    description: "",
    cover_image: "",
  });
  const [adminError, setAdminError] = useState(null);
  const [adminSuccess, setAdminSuccess] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    year: "",
    category_id: "",
    stock: 1,
    publisher: "",
    isbn: "",
    description: "",
    cover_image: "",
  });
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

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
      const filtered = books.filter((book) => {
        const term = searchTerm.toLowerCase();
        return (
          (book.title || "").toLowerCase().includes(term) ||
          (book.author || "").toLowerCase().includes(term) ||
          (book.publisher || "").toLowerCase().includes(term) ||
          (book.isbn || "").toLowerCase().includes(term) ||
          (book.description || "").toLowerCase().includes(term)
        );
      });
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

  const updateForm = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({
      ...prev,
      [name]:
        name === "stock" || name === "year" || name === "category_id"
          ? Number(value)
          : value,
    }));
  };

  const handleFileInput = async (event, setter) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setter((prev) => ({
        ...prev,
        cover_image: reader.result || "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditBook = (book) => {
    setEditBook(book);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      year: book.year || "",
      category_id: book.category_id || "",
      stock: book.stock || 1,
      publisher: book.publisher || "",
      isbn: book.isbn || "",
      description: book.description || "",
      cover_image: book.cover_image || "",
    });
    setEditError(null);
    setEditSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditBook(null);
    setEditForm({
      title: "",
      author: "",
      year: "",
      category_id: "",
      stock: 1,
      publisher: "",
      isbn: "",
      description: "",
      cover_image: "",
    });
    setEditError(null);
    setEditSuccess(null);
  };

  const getCoverImageSrc = (coverImage) => {
    if (!coverImage) return null;
    if (typeof coverImage === "string" && coverImage.startsWith("data:")) {
      return coverImage;
    }
    return typeof coverImage === "string"
      ? `data:image/jpeg;base64,${coverImage}`
      : null;
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
      setAdminForm({
        title: "",
        author: "",
        year: "",
        category_id: "",
        stock: 1,
        publisher: "",
        isbn: "",
        description: "",
        cover_image: "",
      });
      loadBooks();
    } catch (err) {
      console.error("Gagal menambahkan buku:", err);
      setAdminError(
        err.response?.data?.message ||
          "Gagal menambahkan buku. Silakan coba lagi."
      );
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    setEditError(null);

    if (!editForm.title || !editForm.author || !editForm.year || !editForm.stock) {
      setEditError("Judul, penulis, tahun, dan stok wajib diisi.");
      return;
    }

    try {
      await updateBook(editBook.id, editForm);
      setEditSuccess("Buku berhasil diperbarui.");
      setEditBook(null);
      setEditForm({
        title: "",
        author: "",
        year: "",
        category_id: "",
        stock: 1,
        publisher: "",
        isbn: "",
        description: "",
        cover_image: "",
      });
      loadBooks();
    } catch (err) {
      console.error("Gagal memperbarui buku:", err);
      setEditError(
        err.response?.data?.message ||
          "Gagal memperbarui buku. Silakan coba lagi."
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

      {!loading && isAdmin && editBook && (
        <div className="edit-panel">
          <div className="admin-header">
            <h2>✏️ Edit Buku</h2>
            <p>Ubah semua field buku yang tersedia, kemudian simpan.</p>
          </div>
          <form onSubmit={handleUpdateBook} className="admin-form">
            <div className="admin-row">
              <input
                type="text"
                name="title"
                placeholder="Judul buku"
                value={editForm.title}
                onChange={updateForm(setEditForm)}
              />
              <input
                type="text"
                name="author"
                placeholder="Penulis"
                value={editForm.author}
                onChange={updateForm(setEditForm)}
              />
            </div>

            <div className="admin-row">
              <input
                type="number"
                name="year"
                placeholder="Tahun terbit"
                value={editForm.year}
                onChange={updateForm(setEditForm)}
                min="1900"
              />
              <input
                type="text"
                name="category_id"
                placeholder="Kategori ID"
                value={editForm.category_id}
                onChange={updateForm(setEditForm)}
              />
            </div>

            <div className="admin-row">
              <input
                type="number"
                name="stock"
                placeholder="Stok"
                value={editForm.stock}
                onChange={updateForm(setEditForm)}
                min="1"
              />
              <input
                type="text"
                name="publisher"
                placeholder="Penerbit"
                value={editForm.publisher}
                onChange={updateForm(setEditForm)}
              />
            </div>

            <div className="admin-row admin-row-single">
              <input
                type="text"
                name="isbn"
                placeholder="ISBN"
                value={editForm.isbn}
                onChange={updateForm(setEditForm)}
              />
            </div>

            <div className="admin-row admin-row-single">
              <textarea
                name="description"
                placeholder="Deskripsi buku"
                value={editForm.description}
                onChange={updateForm(setEditForm)}
                rows="4"
              />
            </div>

            <div className="admin-row admin-row-single">
              <label className="file-label">
                Cover Image
                <input
                  type="file"
                  accept="image/*"
                  name="cover_image"
                  onChange={(event) => handleFileInput(event, setEditForm)}
                />
              </label>
            </div>

            {editError && <div className="admin-error">{editError}</div>}
            {editSuccess && <div className="admin-success">{editSuccess}</div>}

            <div className="admin-row admin-row-single">
              <button type="submit" className="btn-submit-book">
                Simpan Perubahan
              </button>
              <button
                type="button"
                className="btn-retry"
                onClick={handleCancelEdit}
              >
                Batal
              </button>
            </div>
          </form>
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

            <div className="admin-row">
              <input
                type="number"
                name="stock"
                placeholder="Stok"
                value={adminForm.stock}
                onChange={handleAdminChange}
                min="1"
              />
              <input
                type="text"
                name="publisher"
                placeholder="Penerbit"
                value={adminForm.publisher}
                onChange={handleAdminChange}
              />
            </div>

            <div className="admin-row admin-row-single">
              <input
                type="text"
                name="isbn"
                placeholder="ISBN"
                value={adminForm.isbn}
                onChange={handleAdminChange}
              />
            </div>

            <div className="admin-row admin-row-single">
              <textarea
                name="description"
                placeholder="Deskripsi buku"
                value={adminForm.description}
                onChange={handleAdminChange}
                rows="4"
              />
            </div>

            <div className="admin-row admin-row-single">
              <label className="file-label">
                Cover Image
                <input
                  type="file"
                  accept="image/*"
                  name="cover_image"
                  onChange={(event) => handleFileInput(event, setAdminForm)}
                />
              </label>
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
                  <th>Cover</th>
                  <th>Judul Buku</th>
                  <th>Penulis</th>
                  <th>Penerbit</th>
                  <th>ISBN</th>
                  <th>Stok</th>
                  <th className="status-col">Status</th>
                  {isAdmin && <th className="action-col">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="table-row">
                    <td className="id-col">{book.id}</td>
                    <td className="cover-col">
                      {getCoverImageSrc(book.cover_image) ? (
                        <img
                          src={getCoverImageSrc(book.cover_image)}
                          alt={book.title}
                          className="cover-thumbnail"
                        />
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="title-col">
                      <strong>{book.title}</strong>
                      {book.description && (
                        <p className="book-description">{book.description}</p>
                      )}
                    </td>
                    <td className="author-col">{book.author || '-'}</td>
                    <td className="publisher-col">{book.publisher || '-'}</td>
                    <td className="isbn-col">{book.isbn || '-'}</td>
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
                          className="btn-edit"
                          onClick={() => handleEditBook(book)}
                        >
                          Edit
                        </button>
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