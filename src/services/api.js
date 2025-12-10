import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // For cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle 401/Refresh (Simplified)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If 401, clear token and maybe redirect (for now just reject)
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            // window.location.href = '/login'; // Optional: Force redirect
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('accessToken', data.accessToken);
        return data;
    },
    signup: async (email, password, name, phone, dob) => {
        const { data } = await api.post('/auth/signup', { email, password, name, phone, dob });
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        return data;
    },
    verify: async (email, otp) => {
        const { data } = await api.post('/auth/verify', { email, otp });
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        return data;
    },
    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
    },
};

export const user = {
    getProfile: async () => {
        const { data } = await api.get('/users/me');
        return data;
    },
    updateProfile: async (formData) => {
        // Note: formData must be sent with appropriate headers
        const { data } = await api.put('/users/me', formData);
        return data;
    }
};

export const finance = {
    getExpenses: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const { data } = await api.get(`/expenses?${params}`);
        return data;
    },
    addExpense: async (expenseData) => {
        const { data } = await api.post('/expenses', expenseData);
        return data;
    },
    getBudget: async (month) => {
        const { data } = await api.get(`/budgets?month=${month}`);
        return data;
    },
    setBudget: async (month, amountTotal) => {
        const { data } = await api.post('/budgets', { month, amountTotal });
        return data;
    }
};

export default api;
