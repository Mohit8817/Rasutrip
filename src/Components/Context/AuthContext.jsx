// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // "customer" or "agent"
  

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedUserType) {
      setUserType(savedUserType);
    }
  }, []);

  const login = (userData, type) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
    setUser(userData);
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, userType, setUserType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
