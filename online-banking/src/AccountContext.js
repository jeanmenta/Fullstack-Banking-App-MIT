// AccountContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getTransactions } from './api'; // Import the function

export const AccountContext = createContext({
    user: null,
    transactions: [],
    setUser: () => { },
    setTransactions: () => { }
});

export const AccountProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            const fetchedTransactions = await getTransactions();
            setTransactions(fetchedTransactions);
        };

        fetchTransactions();
    }, []);

    const contextValue = {
        user,
        transactions,
        setUser,
        setTransactions
    };

    return (
        <AccountContext.Provider value={contextValue}>
            {children}
        </AccountContext.Provider>
    );
};
