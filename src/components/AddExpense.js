import React, { useState, useEffect } from 'react';
import ExpenseService from '../services/ExpenseService';
import { ProjectService } from '../services/ExpenseService';

const EXPENSE_TYPES = [
    'Materials', 'Labor', 'Equipment', 'Transport',
    'Utilities', 'Subcontractor', 'Permits', 'Miscellaneous'
];
const BLANK = { projectName: '', expenseType: '', amount: '', vendor: '', date: '', description: '' };

const AddExpense = ({ onExpenseAdded }) => {
    const [expense, setExpense]   = useState(BLANK);
    const [projects, setProjects] = useState([]);
    const [message, setMessage]   = useState({ text: '', type: '' });
    const [loading, setLoading]   = useState(false);

    useEffect(() => {
        ProjectService.getAllProjects()
            .then(res => setProjects(res.data))
            .catch(() => {});
    }, []);

    const handleChange = e => setExpense(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        const { projectName, expenseType, amount, vendor, date } = expense;
        if (!projectName || !expenseType || !amount || !vendor || !date) {
            setMessage({ text: '⚠️ Please fill all required fields.', type: 'error' }); return;
        }
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await ExpenseService.createExpense(expense);
            setMessage({ text: '✅ Expense added successfully!', type: 'success' });
            setExpense(BLANK);
            if (onExpenseAdded) onExpenseAdded();
        } catch {
            setMessage({ text: '❌ Failed to add expense. Is the backend running?', type: 'error' });
        } finally { setLoading(false); }
    };

    return (
        <div className="add-expense">
            <h2 className="page-title">➕ Add New Expense</h2>
            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Project Name <span className="required">*</span></label>
                            {projects.length > 0 ? (
                                <select name="projectName" value={expense.projectName} onChange={handleChange} required>
                                    <option value="">-- Select Project --</option>
                                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            ) : (
                                <input type="text" name="projectName" value={expense.projectName}
                                    onChange={handleChange} placeholder="e.g. Building Block A" required />
                            )}
                        </div>
                        <div className="form-group">
                            <label>Expense Type <span className="required">*</span></label>
                            <select name="expenseType" value={expense.expenseType} onChange={handleChange} required>
                                <option value="">-- Select Type --</option>
                                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Amount (₹) <span className="required">*</span></label>
                            <input type="number" name="amount" value={expense.amount}
                                onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
                        </div>
                        <div className="form-group">
                            <label>Vendor / Supplier <span className="required">*</span></label>
                            <input type="text" name="vendor" value={expense.vendor}
                                onChange={handleChange} placeholder="e.g. ABC Constructions" required />
                        </div>
                        <div className="form-group">
                            <label>Date <span className="required">*</span></label>
                            <input type="date" name="date" value={expense.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group full-span">
                            <label>Description</label>
                            <textarea name="description" value={expense.description}
                                onChange={handleChange} placeholder="Optional details…" rows="3" />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary"
                            onClick={() => { setExpense(BLANK); setMessage({ text: '', type: '' }); }}>
                            🔄 Reset
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving…' : '💾 Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpense;
