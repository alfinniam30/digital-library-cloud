import { Link, useNavigate } from "react-router-dom";
import { getUserFromToken, isAuthenticated, logout } from "../services/authService";
import "../styles/Navbar.css";

function Navbar() {
  const user = getUserFromToken();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <header className="app-navbar">
      <div className="navbar-brand">
        <Link to="/books">Digital Campus Library</Link>
      </div>

      <nav className="navbar-links">
        <Link to="/books">Buku</Link>
        <Link to="/borrowings">Peminjaman Buku</Link>
        <Link to="/borrowings">Pengembalian Buku</Link>
      </nav>

      <div className="navbar-actions">
        <span className="navbar-user">
          {user?.email} · {user?.role}
        </span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
