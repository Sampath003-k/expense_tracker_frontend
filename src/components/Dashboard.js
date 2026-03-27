import React, { useState, useEffect } from 'react';
import ExpenseService from '../services/ExpenseService';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        ExpenseService.getAllExpenses()
            .then(res => setExpenses(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const total    = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const byProject = expenses.reduce((a, e) => { a[e.projectName] = (a[e.projectName] || 0) + e.amount; return a; }, {});
    const byType    = expenses.reduce((a, e) => { a[e.expenseType] = (a[e.expenseType] || 0) + e.amount; return a; }, {});
    const recent    = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (loading) return <div className="loading"><span>⏳</span> Loading dashboard…</div>;

    return (
        <div className="dashboard">
            <h2 className="page-title">📊 Dashboard</h2>

            <div className="stats-grid">
                {[
                    { icon: '💰', label: 'Total Expenses',  value: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, cls: 'primary' },
                    { icon: '📋', label: 'Total Records',   value: expenses.length, cls: 'info' },
                    { icon: '🏗️', label: 'Active Projects', value: Object.keys(byProject).length, cls: 'success' },
                    { icon: '📦', label: 'Expense Types',   value: Object.keys(byType).length, cls: 'warning' },
                ].map(({ icon, label, value, cls }) => (
                    <div key={label} className={`stat-card ${cls}`}>
                        <div className="stat-icon">{icon}</div>
                        <div className="stat-info">
                            <h3>{label}</h3>
                            <p className="stat-value">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>💼 Expenses by Project</h3>
                    {Object.keys(byProject).length === 0 ? (
                        <p className="no-data">No data yet.</p>
                    ) : (
                        <table className="breakdown-table">
                            <thead><tr><th>Project</th><th>Total</th></tr></thead>
                            <tbody>
                                {Object.entries(byProject)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([p, amt]) => (
                                    <tr key={p}>
                                        <td>{p}</td>
                                        <td className="amount-cell">₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="dashboard-card">
                    <h3>🏷️ Expenses by Type</h3>
                    {Object.keys(byType).length === 0 ? (
                        <p className="no-data">No data yet.</p>
                    ) : (
                        <table className="breakdown-table">
                            <thead><tr><th>Type</th><th>Total</th></tr></thead>
                            <tbody>
                                {Object.entries(byType)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([t, amt]) => (
                                    <tr key={t}>
                                        <td><span className="badge">{t}</span></td>
                                        <td className="amount-cell">₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="dashboard-card full-width">
                <h3>🕒 Recent Expenses</h3>
                {recent.length === 0 ? (
                    <p className="no-data">No expenses yet. Add your first one!</p>
                ) : (
                    <table className="breakdown-table">
                        <thead>
                            <tr><th>Project</th><th>Type</th><th>Vendor</th><th>Date</th><th>Amount</th></tr>
                        </thead>
                        <tbody>
                            {recent.map(e => (
                                <tr key={e.id}>
                                    <td><strong>{e.projectName}</strong></td>
                                    <td><span className="badge">{e.expenseType}</span></td>
                                    <td>{e.vendor}</td>
                                    <td>{e.date}</td>
                                    <td className="amount-cell">₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
