import React, { useState } from 'react';
import { AuthService } from '../services/ExpenseService';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ username: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = e =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        if (!form.username.trim() || !form.password.trim()) {
            setMessage({ text: 'Username and password are required.', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            if (isRegister) {
                await AuthService.register(form.username, form.password);
                setMessage({ text: '✅ Registered! You can now log in.', type: 'success' });
                setIsRegister(false);
                setForm({ username: form.username, password: '' });
            } else {
                const res = await AuthService.login(form.username, form.password);
                login(res.data.username, res.data.token);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Something went wrong. Try again.';
            setMessage({ text: `❌ ${msg}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Left panel */}
                <div className="login-brand">
                    <div className="login-brand-icon">🏗️</div>
                    <h1>Expense Tracker</h1>
                    <p>Construction &amp; Project<br />Expense Management</p>
                    
                </div>

                {/* Right panel */}
                <div className="login-form-panel">
                    <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                    <p className="login-sub">
                        {isRegister
                            ? 'Register to start tracking expenses'
                            : 'Sign in to your account'}
                    </p>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>{message.text}</div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                autoComplete="username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={loading}
                        >
                            {loading
                                ? (isRegister ? 'Registering...' : 'Signing in...')
                                : (isRegister ? '🚀 Register' : '🔑 Sign In')}
                        </button>
                    </form>

                    <div className="login-switch">
                        {isRegister ? (
                            <>Already have an account?{' '}
                                <button className="link-btn" onClick={() => { setIsRegister(false); setMessage({ text: '', type: '' }); }}>
                                    Sign In
                                </button>
                            </>
                        ) : (
                            <>Don't have an account?{' '}
                                <button className="link-btn" onClick={() => { setIsRegister(true); setMessage({ text: '', type: '' }); }}>
                                    Register
                                </button>
                            </>
                        )}
                    </div>

                    <div className="login-demo">
                        <span>Demo credentials:</span>
                        <code>admin / admin123</code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
