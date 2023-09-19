import React, { createContext, useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';

export const GET_BALANCE = gql`
  query GetBalance($email: String!) {
    balance(email: $email)
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions($email: String!) {
    transactions(email: $email) {
      id
      type
      amount
      effectiveDate
    }
  }
`;

export const AccountContext = createContext({
    user: null,
    balance: null,
    transactions: [],
    fetchAccountData: () => { }
});

export const AccountProvider = ({ children, initialUser }) => {
    const [user, setUser] = useState(initialUser);
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const { data: balanceData, refetch: refetchBalance } = useQuery(GET_BALANCE, {
        variables: { email: user?.email },
        skip: !user
    });

    const { data: transactionsData, refetch: refetchTransactions } = useQuery(GET_TRANSACTIONS, {
        variables: { email: user?.email },
        skip: !user
    });

    useEffect(() => {
        if (balanceData) {
            setBalance(balanceData.balance);
            setIsLoading(false);
        }
    }, [balanceData]);

    useEffect(() => {
        if (balanceData && transactionsData) {
            setBalance(balanceData.balance);
            setTransactions(transactionsData.transactions);
            setIsLoading(false);
        }
    }, [balanceData, transactionsData]);

    const fetchAccountData = () => {
        refetchBalance();
        refetchTransactions();
    };

    const contextValue = {
        user,
        balance,
        transactions,
        isLoading,
        setUser,
        fetchAccountData,
    };

    return (
        <AccountContext.Provider value={contextValue}>
            {children}
        </AccountContext.Provider>
    );
};