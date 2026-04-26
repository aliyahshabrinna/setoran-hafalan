import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMahasiswaList } from '../services/api';

function Dashboard() {
  const [nim, setNim] = useState('');
  const [mahasiswa, setMahasiswa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCari = async (e) => {
    e.preventDefault();
    setError('');
    setMahasiswa(null);
    if (!nim) {
      setError('NIM wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const data = await getMahasiswaList(nim);
      setMahasiswa(data);
    } catch (err) {
      setError(err.message || 'Mahasiswa tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handlePilih = () => {
    if (mahasiswa) {
      localStorage.setItem('currentNim', mahasiswa.nim);
      localStorage.setItem('currentNama', mahasiswa.nama);
      navigate('/setoran');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-vh-100" style={{ background: 'var(--bg-cream)' }}>
      <nav className="navbar navbar-expand-lg navbar-quran">
        <div className="container">
          <span className="navbar-brand">Setoran Hafalan</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Keluar</button>
        </div>
      </nav>
      <div className="container py-4">
        <div className="dashboard-header text-center">
          <h2 style={{ margin: 0 }}>Cari Mahasiswa</h2>
          <p className="mb-0 mt-2" style={{ opacity: 0.9 }}>Masukkan NIM mahasiswa untuk melihat/mengelola setoran</p>
        </div>
        <form onSubmit={handleCari} className="mb-4">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-quran mb-2"
                placeholder="Masukkan NIM mahasiswa..."
                value={nim}
                onChange={e => setNim(e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-quran w-100" disabled={loading}>
                {loading ? 'Mencari...' : 'Cari'}
              </button>
            </div>
          </div>
        </form>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        {mahasiswa && (
          <div className="card-quran mx-auto" style={{ maxWidth: 500 }}>
            <div className="card-header text-center">Info Mahasiswa</div>
            <div className="card-body text-center">
              <h4 className="mb-2">{mahasiswa.nama}</h4>
              <div>NIM: {mahasiswa.nim}</div>
              <div>Email: {mahasiswa.email}</div>
              <div>Angkatan: {mahasiswa.angkatan}</div>
              <div>Semester: {mahasiswa.semester}</div>
              {mahasiswa.dosen_pa && (
                <div className="mt-2">
                  <div style={{ fontWeight: 600 }}>PA: {mahasiswa.dosen_pa.nama}</div>
                  <div style={{ fontSize: '0.95em' }}>{mahasiswa.dosen_pa.email}</div>
                </div>
              )}
              <button className="btn btn-quran mt-3 w-100" onClick={handlePilih}>
                Pilih Mahasiswa Ini
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;