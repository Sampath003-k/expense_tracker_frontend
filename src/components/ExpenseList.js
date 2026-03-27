import React, { useState, useEffect } from 'react';
import ExpenseService from '../services/ExpenseService';

const EXPENSE_TYPES = [
    'Materials', 'Labor', 'Equipment', 'Transport',
    'Utilities', 'Subcontractor', 'Permits', 'Miscellaneous'
];
const BLANK = { projectName: '', expenseType: '', amount: '', vendor: '', date: '', description: '' };

const ExpenseList = () => {
    const [expenses, setExpenses]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [message, setMessage]             = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm]       = useState('');
    const [filterType, setFilterType]       = useState('');
    const [editingExpense, setEditingExpense] = useState(null);
    const [editForm, setEditForm]           = useState(BLANK);
    const [saving, setSaving]               = useState(false);

    useEffect(() => { fetchExpenses(); }, []);

    const fetchExpenses = async () => {
        try {
            const res = await ExpenseService.getAllExpenses();
            setExpenses(res.data);
        } catch {
            showMsg('❌ Failed to load expenses.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (text, type, ms = 3500) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), ms);
    };

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense? This cannot be undone.')) return;
        try {
            await ExpenseService.deleteExpense(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
            showMsg('✅ Expense deleted.', 'success');
        } catch {
            showMsg('❌ Failed to delete.', 'error');
        }
    };

    // Open edit modal
    const openEdit = (exp) => {
        setEditingExpense(exp);
        setEditForm({
            projectName: exp.projectName, expenseType: exp.expenseType,
            amount: exp.amount, vendor: exp.vendor,
            date: exp.date, description: exp.description || ''
        });
    };
    const closeEdit = () => { setEditingExpense(null); setEditForm(BLANK); };
    const handleEditChange = e => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }));

    // Save edit
    const handleEditSave = async () => {
        const { projectName, expenseType, amount, vendor, date } = editForm;
        if (!projectName || !expenseType || !amount || !vendor || !date) {
            showMsg('⚠️ Please fill all required fields.', 'error', 3000); return;
        }
        setSaving(true);
        try {
            const res = await ExpenseService.updateExpense(editingExpense.id, editForm);
            setExpenses(prev => prev.map(e => e.id === editingExpense.id ? res.data : e));
            showMsg('✅ Expense updated successfully.', 'success');
            closeEdit();
        } catch {
            showMsg('❌ Failed to update expense.', 'error');
        } finally { setSaving(false); }
    };

    // Filter
    const uniqueTypes = [...new Set(expenses.map(e => e.expenseType))];
    const filtered = expenses.filter(e => {
        const q = searchTerm.toLowerCase();
        return (
            (e.projectName.toLowerCase().includes(q) ||
             e.vendor.toLowerCase().includes(q) ||
             e.expenseType.toLowerCase().includes(q) ||
             (e.description && e.description.toLowerCase().includes(q))) &&
            (filterType ? e.expenseType === filterType : true)
        );
    });
    const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);

    if (loading) return <div className="loading"><span className="spin">⏳</span> Loading expenses…</div>;

    return (
        <div className="expense-list">
            <h2 className="page-title">📋 Expense Records</h2>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="filters-bar">
                <input type="text" className="search-input"
                    placeholder="🔍 Search project, vendor, type, description…"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <select className="filter-select" value={filterType}
                    onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {(searchTerm || filterType) && (
                    <button className="btn btn-secondary btn-sm"
                        onClick={() => { setSearchTerm(''); setFilterType(''); }}>
                        ✕ Clear
                    </button>
                )}
                <div className="total-badge">
                    {filtered.length} record{filtered.length !== 1 ? 's' : ''} &nbsp;|&nbsp;
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No expenses found. Try a different search or add a new expense.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="expense-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Project</th><th>Type</th><th>Amount (₹)</th>
                                <th>Vendor</th><th>Date</th><th>Description</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((exp, i) => (
                                <tr key={exp.id}>
                                    <td>{i + 1}</td>
                                    <td><strong>{exp.projectName}</strong></td>
                                    <td><span className="badge">{exp.expenseType}</span></td>
                                    <td className="amount-cell">₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td>{exp.vendor}</td>
                                    <td>{exp.date}</td>
                                    <td className="desc-cell">{exp.description || '—'}</td>
                                    <td className="action-cell">
                                        <button className="btn btn-edit btn-sm" onClick={() => openEdit(exp)}>✏️ Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exp.id)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="total-row">
                                <td colSpan="3"><strong>Grand Total</strong></td>
                                <td className="amount-cell"><strong>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                                <td colSpan="4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {editingExpense && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✏️ Edit Expense <span className="modal-id">#{editingExpense.id}</span></h3>
                            <button className="modal-close" onClick={closeEdit}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Project Name <span className="required">*</span></label>
                                    <input type="text" name="projectName" value={editForm.projectName} onChange={handleEditChange} />
                                </div>
                                <div className="form-group">
                                    <label>Expense Type <span className="required">*</span></label>
                                    <select name="expenseType" value={editForm.expenseType} onChange={handleEditChange}>
                                        <option value="">-- Select --</option>
                                        {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amount (₹) <span className="required">*</span></label>
                                    <input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} min="0" step="0.01" />
                                </div>
                                <div className="form-group">
                                    <label>Vendor <span className="required">*</span></label>
                                    <input type="text" name="vendor" value={editForm.vendor} onChange={handleEditChange} />
                                </div>
                                <div className="form-group">
                                    <label>Date <span className="required">*</span></label>
                                    <input type="date" name="date" value={editForm.date} onChange={handleEditChange} />
                                </div>
                                <div className="form-group full-span">
                                    <label>Description</label>
                                    <textarea name="description" rows="2" value={editForm.description} onChange={handleEditChange} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeEdit}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>
                                {saving ? 'Saving…' : '💾 Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
