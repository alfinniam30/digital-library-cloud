import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, isAuthenticated } from "../services/authService";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/books");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate("/books");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Cek email dan password.");
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login Perpustakaan Digital</h1>
        <p>Masuk untuk mengelola buku dan peminjaman.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </label>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="auth-footer">
          <span>Belum punya akun?</span>
          <Link to="/register" className="auth-link">
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;