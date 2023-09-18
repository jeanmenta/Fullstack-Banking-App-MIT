// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001', // Replace with your server's address
});

export const getTransactions = async () => {
    try {
        const response = await api.get('/transactions');
        return response.data;
    } catch (error) {
        console.error('An error occurred while fetching data: ', error);
    }
};

// Add more API calls as needed
