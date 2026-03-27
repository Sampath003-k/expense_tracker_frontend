import React, { useState, useEffect } from 'react';
import { ProjectService } from '../services/ExpenseService';

const STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED'];
const BLANK = { name: '', description: '', status: 'ACTIVE' };

const ProjectManager = () => {
    const [projects, setProjects]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [message, setMessage]             = useState({ text: '', type: '' });
    const [form, setForm]                   = useState(BLANK);
    const [editingProject, setEditingProject] = useState(null);
    const [editForm, setEditForm]           = useState(BLANK);
    const [saving, setSaving]               = useState(false);

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        try {
            const res = await ProjectService.getAllProjects();
            setProjects(res.data);
        } catch {
            showMsg('❌ Failed to load projects.', 'error');
        } finally { setLoading(false); }
    };

    const showMsg = (text, type, ms = 3500) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), ms);
    };

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    // Add project
    const handleAdd = async e => {
        e.preventDefault();
        if (!form.name.trim()) { showMsg('⚠️ Project name is required.', 'error', 3000); return; }
        setSaving(true);
        try {
            const res = await ProjectService.createProject(form);
            setProjects(prev => [...prev, res.data]);
            setForm(BLANK);
            showMsg('✅ Project created!', 'success');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create project.';
            showMsg(`❌ ${msg}`, 'error');
        } finally { setSaving(false); }
    };

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        try {
            await ProjectService.deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
            showMsg('✅ Project deleted.', 'success');
        } catch {
            showMsg('❌ Failed to delete project.', 'error');
        }
    };

    // Edit modal
    const openEdit = (p) => { setEditingProject(p); setEditForm({ name: p.name, description: p.description || '', status: p.status }); };
    const closeEdit = () => { setEditingProject(null); setEditForm(BLANK); };
    const handleEditChange = e => setEditForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleEditSave = async () => {
        if (!editForm.name.trim()) { showMsg('⚠️ Name required.', 'error', 3000); return; }
        setSaving(true);
        try {
            const res = await ProjectService.updateProject(editingProject.id, editForm);
            setProjects(prev => prev.map(p => p.id === editingProject.id ? res.data : p));
            showMsg('✅ Project updated.', 'success');
            closeEdit();
        } catch {
            showMsg('❌ Failed to update.', 'error');
        } finally { setSaving(false); }
    };

    const statusColor = { ACTIVE: 'status-active', ON_HOLD: 'status-hold', COMPLETED: 'status-done' };

    if (loading) return <div className="loading">⏳ Loading projects…</div>;

    return (
        <div className="project-manager">
            <h2 className="page-title">🏗️ Project Management</h2>
            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            {/* Add form */}
            <div className="form-card" style={{ marginBottom: '28px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>➕ Add New Project</h3>
                <form onSubmit={handleAdd}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Project Name <span className="required">*</span></label>
                            <input type="text" name="name" value={form.name}
                                onChange={handleChange} placeholder="e.g. Apartment Block A" />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={form.status} onChange={handleChange}>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group full-span">
                            <label>Description</label>
                            <textarea name="description" value={form.description}
                                onChange={handleChange} rows="2" placeholder="Optional project description…" />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary"
                            onClick={() => setForm(BLANK)}>🔄 Reset</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Creating…' : '🏗️ Create Project'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Projects table */}
            {projects.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏗️</div>
                    <p>No projects yet. Create your first project above.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="expense-table">
                        <thead>
                            <tr><th>#</th><th>Project Name</th><th>Description</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {projects.map((p, i) => (
                                <tr key={p.id}>
                                    <td>{i + 1}</td>
                                    <td><strong>{p.name}</strong></td>
                                    <td className="desc-cell">{p.description || '—'}</td>
                                    <td><span className={`status-badge ${statusColor[p.status] || ''}`}>{p.status}</span></td>
                                    <td className="action-cell">
                                        <button className="btn btn-edit btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit modal */}
            {editingProject && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>✏️ Edit Project</h3>
                            <button className="modal-close" onClick={closeEdit}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Project Name <span className="required">*</span></label>
                                    <input type="text" name="name" value={editForm.name} onChange={handleEditChange} />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={editForm.status} onChange={handleEditChange}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
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

export default ProjectManager;
