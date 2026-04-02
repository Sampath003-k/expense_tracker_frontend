import axios from 'axios';

const API = 'https://expense-tracker-backend-1-iq4u.onrender.com';

// Attach JWT token
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('et_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// AUTH
export const AuthService = {
    login: (username, password) =>
        axios.post(`${API}/api/auth/login`, { username, password }),

    register: (username, password) =>
        axios.post(`${API}/api/auth/register`, { username, password }),
};

// EXPENSES
const ExpenseService = {
    getAllExpenses: () => axios.get(`${API}/api/expenses`),
    getExpenseById: (id) => axios.get(`${API}/api/expenses/${id}`),
    createExpense: (expense) => axios.post(`${API}/api/expenses`, expense),
    updateExpense: (id, expense) => axios.put(`${API}/api/expenses/${id}`, expense),
    deleteExpense: (id) => axios.delete(`${API}/api/expenses/${id}`),
};

// PROJECTS
export const ProjectService = {
    getAllProjects: () => axios.get(`${API}/api/projects`),
    createProject: (project) => axios.post(`${API}/api/projects`, project),
    updateProject: (id, data) => axios.put(`${API}/api/projects/${id}`, data),
    deleteProject: (id) => axios.delete(`${API}/api/projects/${id}`),
};

export default ExpenseService;