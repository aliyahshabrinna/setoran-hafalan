import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(null); // ⛔ null dulu
  const [loading, setLoading] = useState(true); // ⛔ loading state

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
    } else {
      setToken("");
    }

    setLoading(false); // selesai load
  }, []);

  // ⛔ jangan render apa-apa dulu
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return token ? (
    <Dashboard token={token} setToken={setToken} />
  ) : (
    <Login setToken={setToken} />
  );
}

export default App;