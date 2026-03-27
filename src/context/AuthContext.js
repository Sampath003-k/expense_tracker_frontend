import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    // Restore session on page reload
    useEffect(() => {
        const savedToken = localStorage.getItem('et_token');
        const savedUser  = localStorage.getItem('et_user');
        const savedTheme = localStorage.getItem('et_dark');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(savedUser);
        }
        if (savedTheme === 'true') setDarkMode(true);
    }, []);

    // Apply dark-mode class to <html>
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('et_dark', darkMode);
    }, [darkMode]);

    const login = (username, jwt) => {
        setUser(username);
        setToken(jwt);
        localStorage.setItem('et_token', jwt);
        localStorage.setItem('et_user', username);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('et_token');
        localStorage.removeItem('et_user');
    };

    const toggleDarkMode = () => setDarkMode(prev => !prev);

    return (
        <AuthContext.Provider value={{ user, token, darkMode, login, logout, toggleDarkMode }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
