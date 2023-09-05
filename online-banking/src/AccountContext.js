import { createContext } from 'react';

export const AccountContext = createContext({
    user: null,
    accounts: [],
    setUser: () => { },
    setAccounts: () => { }
});
