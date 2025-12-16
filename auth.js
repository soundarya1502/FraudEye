import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, email } or null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('fraudeye_auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
      } catch (e) {
        localStorage.removeItem('fraudeye_auth');
      }
    }
    setLoading(false);
  }, []);
const saveAuth = (userObj, token) => {
  localStorage.setItem('fraudeye_token', token);
  localStorage.setItem('fraudeye_auth', JSON.stringify({ user: userObj }));
  setUser(userObj);

  // --- NEW: Send token to extension automatically ---
  try {
    window.postMessage(
      {
        source: "fraudeye-webapp",
        type: "FRAUDEYE_TOKEN",
        token,
      },
      "*"
    );
  } catch (err) {
    console.warn("Failed to postMessage token to extension", err);
  }
};

  

  const logout = () => {
    localStorage.removeItem('fraudeye_token');
    localStorage.removeItem('fraudeye_auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
