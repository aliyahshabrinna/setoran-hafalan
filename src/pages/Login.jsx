import { useState } from "react";
import { loginDosen } from "../services/api";
import "../index.css";

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginDosen(username, password);

      if (res?.response) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      } else {
        setError(res?.message || "Login gagal");
      }
    } catch (err) {
      setError(err.message || "Login gagal");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card shadow">
        <div className="text-center mb-4">
          <h2 className="login-title text-center">
            Setoran Hafalan <br />
          <span className="sub-title">Al-Qur'an</span>
          </h2>
          <p className="login-subtitle">Login Dosen Pembimbing Akademik</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username Dosen</label>
            <input
              type="text"
              className="form-control"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button type="submit" className="btn btn-success w-100 login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;