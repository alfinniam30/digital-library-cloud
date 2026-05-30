import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, isAuthenticated } from "../services/authService";
import "../styles/Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mahasiswa");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/books");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password) {
      setError("Semua field harus diisi.");
      return;
    }

    try {
      await register({ name, email, password, role });
      setSuccess("Registrasi berhasil. Silakan login.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("mahasiswa");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal. Coba lagi.");
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Daftar Akun Baru</h1>
        <p>Buat akun untuk mengakses sistem perpustakaan kampus.</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nama Lengkap
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              required
            />
          </label>

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

          <label>
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button type="submit" className="auth-button">
            Daftar
          </button>
        </form>

        <div className="auth-footer">
          <span>Sudah punya akun?</span>
          <Link to="/" className="auth-link">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
