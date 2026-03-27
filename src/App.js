import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Dashboard      from './components/Dashboard';
import AddExpense     from './components/AddExpense';
import ExpenseList    from './components/ExpenseList';
import ProjectManager from './components/ProjectManager';
import LoginPage      from './components/LoginPage';
import './App.css';



function App() {
    const { user, logout, darkMode, toggleDarkMode } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [refreshKey, setRefreshKey] = useState(0);

    // Not logged in → show login page
    if (!user) return <LoginPage />;

    const navigate = (page) => setActivePage(page);

    const handleExpenseAdded = () => {
        setRefreshKey(k => k + 1);
        setActivePage('list');
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard      key={refreshKey} />;
            case 'add':       return <AddExpense     onExpenseAdded={handleExpenseAdded} />;
            case 'list':      return <ExpenseList    key={refreshKey} />;
            case 'projects':  return <ProjectManager key={refreshKey} />;
            default:          return <Dashboard />;
        }
    };

    const navItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard'  },
        { id: 'add',       icon: '➕', label: 'Add Expense' },
        { id: 'list',      icon: '📋', label: 'All Expenses'},
        { id: 'projects',  icon: '🏗️', label: 'Projects'    },
    ];

    const pageTitles = {
        dashboard: '📊 Dashboard Overview',
        add:       '➕ Add New Expense',
        list:      '📋 All Expense Records',
        projects:  '🏗️ Project Management',
    };

    return (
        <div className="app">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo">
                    <span className="logo-icon">🏗️</span>
                    <div>
                        <h1>Expense Tracker</h1>
                        <p>Construction &amp; Projects</p>
                    </div>
                </div>

                <nav className="nav-menu">
                    {navItems.map(({ id, icon, label }) => (
                        <button key={id}
                            className={`nav-item ${activePage === id ? 'active' : ''}`}
                            onClick={() => navigate(id)}>
                            <span className="nav-icon">{icon}</span>
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <span className="user-avatar">👤</span>
                        <span className="user-name">{user}</span>
                    </div>
                    <button className="btn-logout" onClick={logout}>🚪 Logout</button>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">
                <header className="top-bar">
                    <div className="top-bar-title">{pageTitles[activePage]}</div>
                    <div className="top-bar-right">
                        <button className="dark-toggle" onClick={toggleDarkMode}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                            {darkMode ? '☀️ Light' : '🌙 Dark'}
                        </button>
                        <div className="top-bar-info">🔗 localhost:8080</div>
                    </div>
                </header>

                <div className="content-area">{renderPage()}</div>
            </main>
        </div>
    );
}

export default App;
