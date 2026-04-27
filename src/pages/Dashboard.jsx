import { useState, useEffect } from "react";
import {
  cariMahasiswa,
  deleteSetoran,
  simpanSetoran,
  getPaSaya,
  getUserInfo, // Tambahan API
} from "../services/api";
import "../index.css";
import swal from 'sweetalert';

function Dashboard({ token, setToken }) {
  const [nim, setNim] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [paList, setPaList] = useState([]);
  const [showPA, setShowPA] = useState(true);
  const [dosen, setDosen] = useState(null);

  // ========================
  // DECODE TOKEN (Dosen Info)
  // ========================
  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  // ========================
  // FETCH DATA
  // ========================
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Data PA
      const resPa = await getPaSaya(token);
      if (resPa?.response) {
        const info = resPa.data.info_mahasiswa_pa;
        let mahasiswa = [];
        Object.values(info).forEach((angkatan) => {
          if (Array.isArray(angkatan)) {
            mahasiswa = mahasiswa.concat(angkatan);
          }
        });
        setPaList(mahasiswa);
      }

      // 2. Ambil Data Dosen (Coba dari API dulu, kalau gagal baru decode)
      try {
        const resDosen = await getUserInfo(token);
        setDosen({
          nama: resDosen.name || resDosen.preferred_username,
          email: resDosen.email,
          nip: resDosen.nip // Tambahan data dari API
        });
      } catch {
        const user = decodeToken(token);
        if (user) {
          setDosen({
            nama: user.name || user.preferred_username,
            email: user.email,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ========================
  // CARI
  // ========================
  const handleCari = async (nimParam) => {
    const nimFix = nimParam || nim;
    if (!nimFix) return swal("Peringatan", "Masukkan NIM terlebih dahulu", "warning");

    setLoading(true);
    setError("");

    try {
      const res = await cariMahasiswa(token, nimFix);
      
      // Jika res?.response bernilai false, artinya API mengirim error (misal: NIM tidak ada)
      if (res?.response) {
        setData(res.data);
        setShowPA(false);
      } else {
        // Tampilkan pesan error spesifik dari API
        swal("Tidak Ditemukan", res.message || "Data mahasiswa tidak ada", "error");
        setError(res.message);
      }
    } catch (err) {
      swal("Error", "Gagal mengambil data dari server", "error");
      setError("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
};

  // ========================
  // TAMBAH 
  // ========================
const handleTambah = async () => {
    const targetNim = data?.info?.nim || nim;
    if (!targetNim) return swal("Peringatan", "Pilih mahasiswa terlebih dahulu", "warning");
    if (!keterangan) return swal("Peringatan", "Pilih surah terlebih dahulu", "warning");

    const selected = listSurah.find((s) => s.id === keterangan);
    if (!selected) return swal("Error", "Surah tidak valid", "error");

    const payload = {
      data_setoran: [
        {
          id_komponen_setoran: selected.id,
          nama_komponen_setoran: selected.nama,
        },
      ],
    };

    try {
      setLoading(true);
      const res = await simpanSetoran(token, targetNim, payload);
      if (res?.response) {
        setKeterangan("");
        // Notifikasi Sukses
        swal("Berhasil!", "Setoran hafalan telah diverifikasi", "success");
        await handleCari(targetNim);
      } else {
        // Notifikasi Gagal dari Respon API
        swal("Gagal", res.message || "Gagal menyimpan data", "error");
      }
    } catch (err) {
      // Notifikasi Error Server
      swal("Error", "Terjadi kesalahan server saat menambah data", "error");
    } finally {
      setLoading(false);
    }
  };
  // ========================
  // DELETE 
  // ========================
  const handleDelete = async (item) => {
    const targetNim = data?.info?.nim || nim;

    // SweetAlert Konfirmasi Hapus
    const yakin = await swal({
      title: "Apakah Anda yakin?",
      text: `Setoran surah ${item.nama} akan dihapus!`,
      icon: "warning",
      buttons: ["Batal", "Ya, Hapus!"],
      dangerMode: true,
    });

    if (!yakin) return;

    const realId = item?.info_setoran?.id; 
    if (!item.sudah_setor || !realId) {
      return swal("Gagal", "Data ini memang belum disetor atau ID tidak ditemukan", "error");
    }

    const payload = {
      data_setoran: [
        {
          id: realId,
          id_komponen_setoran: item.id,
          nama_komponen_setoran: item.nama,
        },
      ],
    };

    try {
      setLoading(true);
      const res = await deleteSetoran(token, targetNim, payload);
      if (res?.response) {
        swal("Berhasil!", "Setoran telah dihapus", "success");
        await handleCari(targetNim);
      } else {
        swal("Gagal", res.message || "Gagal menghapus", "error");
      }
    } catch (err) {
      swal("Error", "Error server saat menghapus data", "error");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  // ========================
  // SURAH
  // ========================
  const listSurah = [
    { nama: "Al-Fatihah", id: "SURAH_1" },
    { nama: "Adh-Dhuha", id: "SURAH_93" },
    { nama: "Al-Insyirah", id: "SURAH_94" },
    { nama: "At-Tiin", id: "SURAH_95" },
    { nama: "Al-'Alaq", id: "SURAH_96" },
    { nama: "Al-Qadr", id: "SURAH_97" },
    { nama: "Al-Bayyinah", id: "SURAH_98" },
    { nama: "Az-Zalzalah", id: "SURAH_99" },
    { nama: "Al-'Aadiyaat", id: "SURAH_100" },
    { nama: "Al-Qaari'ah", id: "SURAH_101" },
    { nama: "At-Takaatsur", id: "SURAH_102" },
    { nama: "Al-'Ashr", id: "SURAH_103" },
    { nama: "Al-Humazah", id: "SURAH_104" },
    { nama: "Al-Fiil", id: "SURAH_105" },
    { nama: "Quraisy", id: "SURAH_106" },
    { nama: "Al-Maa'un", id: "SURAH_107" },
    { nama: "Al-Kautsar", id: "SURAH_108" },
    { nama: "Al-Kaafirun", id: "SURAH_109" },
    { nama: "An-Nashr", id: "SURAH_110" },
    { nama: "Al-Lahab", id: "SURAH_111" },
    { nama: "Al-Ikhlash", id: "SURAH_112" },
    { nama: "Al-Falaq", id: "SURAH_113" },
    { nama: "An-Nas", id: "SURAH_114" },
  ];

  const totalSetorReal = data ? data.setoran.detail.filter((i) => i.sudah_setor).length : 0;
  const totalWajib = data ? data.setoran.detail.length : 0;
  const persen = totalWajib > 0 ? Math.round((totalSetorReal / totalWajib) * 100) : 0;

  return (
    <div className="dashboard-page px-3 py-4">
      <div className="container">
        <div className="dashboard-card shadow-lg bg-white p-4 rounded-4">
          
          {/* HEADER DOSEN */}
          <div className="dashboard-title h2 text-center fw-bold text-success mb-4">
            Monitoring Hafalan Qur'an
          </div>

          {dosen && (
            <div className="info-box mb-4 d-flex justify-content-between align-items-center bg-light p-3 rounded shadow-sm border">
              <div className="text-start">
                <h5 className="mb-0 fw-bold text-success">{dosen.nama}</h5>
                <small className="text-muted">{dosen.email} {dosen.nip && `| NIP: ${dosen.nip}`}</small>
              </div>
              <button className="btn btn-outline-danger btn-sm fw-bold" onClick={logout}>LOGOUT</button>
            </div>
          )}

          {/* SEARCH */}
          <div className="d-flex justify-content-center gap-2 mb-5">
            <input
              className="form-control w-50 border-success"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Masukkan NIM Mahasiswa..."
            />
            <button className="btn btn-success px-4 fw-bold" onClick={() => handleCari()} disabled={loading}>
              {loading ? "..." : "CARI"}
            </button>
          </div>

          {/* LIST MAHASISWA PA */}
          {showPA && (
            <div className="row g-3">
              <h6 className="fw-bold text-success mb-3 text-start">Daftar Mahasiswa Bimbingan Akademik:</h6>
              {paList.map((mhs, i) => (
                <div className="col-md-4 mb-3" key={i}>
                  <div className="card p-3 h-100 text-center shadow-sm hover-card border-0 bg-light">
                    <h6 className="fw-bold mb-1">{mhs.nama}</h6>
                    <small className="text-muted mb-2 d-block">{mhs.nim}</small>
                    <div className="d-flex justify-content-between mt-2">
                    <span className="badge bg-success">Semester {mhs.semester || '-'}</span>
                    <span className="badge bg-secondary">Angkatan {mhs.angkatan || mhs.tahun_masuk || '-'}</span>
                    </div>
                    <button className="btn btn-success btn-sm w-100" onClick={() => handleCari(mhs.nim)}>
                      Detail Hafalan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DETAIL MAHASISWA */}
          {data && (
            <div className="animate-fade-in">
              <button className="btn btn-link text-success p-0 mb-4 fw-bold text-decoration-none" onClick={() => { setData(null); setShowPA(true); setNim(""); }}>
                ← KEMBALI KE DAFTAR
              </button>

              <div className="p-3 border rounded mb-4 bg-light shadow-sm text-center">
                <h4 className="fw-bold mb-1 text-dark">{data.info.nama}</h4>
                <p className="text-muted mb-0">{data.info.nim} | {data.info.prodi || "Teknik Informatika"}</p>
              </div>

              {/* STAT CARDS */}
              <div className="row g-3 mb-4">
                <div className="col-md-4"><div className="stat-card p-3 bg-white border rounded text-center shadow-sm"><h5>Total</h5><p className="h3 h3 fw-bold text-warning">{totalWajib}</p></div></div>
                <div className="col-md-4"><div className="stat-card p-3 bg-white border rounded text-center shadow-sm"><h5>Sudah</h5><p className="h3 h3 fw-bold text-warning">{totalSetorReal}</p></div></div>
                <div className="col-md-4"><div className="stat-card p-3 bg-white border rounded text-center shadow-sm"><h5>Progress</h5><p className="h3 fw-bold text-warning">{persen}%</p></div></div>
              </div>

              {/* PROGRESS BAR */}
              <div className="progress mb-4 shadow-sm" style={{ height: "25px" }}>
                <div className="progress-bar bg-success fw-bold" style={{ width: `${persen}%` }}>{persen}%</div>
              </div>

              {/* INPUT TAMBAH SETORAN */}
              <div className="card p-3 mb-4 border-0 shadow-sm bg-white border">
                <div className="row g-2 align-items-center">
                  <div className="col-md-9">
                    <select className="form-select border-success" value={keterangan} onChange={(e) => setKeterangan(e.target.value)}>
                      <option value="">-- Pilih Nama Surah --</option>
                      {listSurah.map((s, i) => (
                        <option key={i} value={s.id}>{s.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-success w-100 fw-bold" onClick={handleTambah}>VERIFIKASI</button>
                  </div>
                </div>
              </div>

              {/* TABEL DATA */}
              <div className="table-responsive rounded-3 border shadow-sm">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">NAMA SURAH</th>
                      <th className="text-center">STATUS</th>
                      <th className="text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.setoran.detail.map((item) => (
                      <tr key={item.id} className={item.sudah_setor ? "table-success align-middle" : "align-middle"}>
                        <td className="ps-4 fw-bold text-dark">{item.nama}</td>
                        <td className="text-center">
                          <span className={`badge px-3 py-2 rounded-pill ${item.sudah_setor ? 'bg-success' : 'bg-secondary'}`}>
                            {item.sudah_setor ? "TERVERIFIKASI" : "BELUM SETOR"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(item)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;