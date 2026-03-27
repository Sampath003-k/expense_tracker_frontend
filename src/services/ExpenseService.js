import axios from 'axios';

const API = 'http://localhost:8080/api';

// Attach JWT token to every request automatically
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('et_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────────
export const AuthService = {
    login: (username, password) =>
        axios.post(`${API}/auth/login`, { username, password }),
    register: (username, password) =>
        axios.post(`${API}/auth/register`, { username, password }),
};

// ─── Expenses ──────────────────────────────────────────────────────────────
const ExpenseService = {
    getAllExpenses:    ()           => axios.get(`${API}/expenses`),
    getExpenseById:   (id)         => axios.get(`${API}/expenses/${id}`),
    createExpense:    (expense)    => axios.post(`${API}/expenses`, expense),
    updateExpense:    (id, expense) => axios.put(`${API}/expenses/${id}`, expense),
    deleteExpense:    (id)         => axios.delete(`${API}/expenses/${id}`),
};

// ─── Projects ──────────────────────────────────────────────────────────────
export const ProjectService = {
    getAllProjects:  ()          => axios.get(`${API}/projects`),
    createProject:  (project)   => axios.post(`${API}/projects`, project),
    updateProject:  (id, data)  => axios.put(`${API}/projects/${id}`, data),
    deleteProject:  (id)        => axios.delete(`${API}/projects/${id}`),
};

export default ExpenseService;
