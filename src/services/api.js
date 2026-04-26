const BASE_URL = "https://api.tif.uin-suska.ac.id/setoran-dev/v1";
const KC_URL = "https://id.tif.uin-suska.ac.id";

export async function loginDosen(username, password) {
  const body = new URLSearchParams();
  body.append("client_id", "setoran-mobile-dev");
  body.append("client_secret", "aqJp3xnXKudgC7RMOshEQP7ZoVKWzoSl");
  body.append("grant_type", "password");
  body.append("username", username);
  body.append("password", password);
  body.append("scope", "openid profile email");

  const response = await fetch(
    `${KC_URL}/realms/dev/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error_description || "Login gagal");
  }

  return {
    response: true,
    data: {
      token: result.access_token,
    },
  };
}

export async function cariMahasiswa(token, nim) {
  const response = await fetch(
    `${BASE_URL}/mahasiswa/setoran/${nim}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

export async function getPaSaya(token) {
  const res = await fetch(`${BASE_URL}/dosen/pa-saya`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export const simpanSetoran = async (token, nim, payload) => {
  const res = await fetch(`${BASE_URL}/mahasiswa/setoran/${nim}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Gagal simpan setoran");
  }

  return data;
};

export const deleteSetoran = async (token, nim, payload) => {
  console.log("🔥 DELETE BODY:", JSON.stringify(payload, null, 2));

  const res = await fetch(`${BASE_URL}/mahasiswa/setoran/${nim}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  console.log("🔥 DELETE STATUS:", res.status);
  console.log("🔥 DELETE RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data?.message || "Gagal delete setoran");
  }

  return data;
};
export async function getUserInfo(token) {
  const res = await fetch(
    `${KC_URL}/realms/dev/protocol/openid-connect/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 🔥 DEBUG
  console.log("USERINFO STATUS:", res.status);

  if (!res.ok) {
    const text = await res.text(); // jangan langsung json
    console.error("USERINFO ERROR RAW:", text);
    throw new Error("Gagal ambil user info");
  }

  return res.json();
}