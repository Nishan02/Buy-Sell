import axios from 'axios';

const API = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}/api`,
});

// 1. REQUEST Interceptor: Attaches Token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// 2. RESPONSE Interceptor: Listens for "Banned" errors
API.interceptors.response.use(
    (response) => response, // If success, just return data
    (error) => {
        // Check if the error is a 403 Forbidden (which is what we set for bans)
        if (error.response && error.response.status === 403) {
            const errorMessage = error.response.data.message || "";

            // Check if the message specifically mentions banning or suspension
            if (
                errorMessage.toLowerCase().includes('banned') || 
                errorMessage.toLowerCase().includes('suspended')
            ) {
                // A. Kill the session
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('searchHistory');

                // B. Alert the user so they know why they were kicked out
                // We use window.alert because it pauses execution until clicked
                alert(`SESSION TERMINATED:\n\n${errorMessage}`);

                // C. Force redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;