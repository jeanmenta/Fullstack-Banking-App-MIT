import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AccountContext } from './AccountContext';
import Topbar from './components/Topbar';
import Home from './components/Home';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import AllData from './components/Transactions';
import Accounts from './components/Accounts';
import Login from './components/Login';
import CreateAccount from './components/CreateAccount';
import WaveParticles from './components/WaveParticles';
import './styles/App.css';

const userLinks = [
  { name: 'Home', url: '/home' },
  { name: 'Deposit', url: '/deposit' },
  { name: 'Withdraw', url: '/withdraw' },
  { name: 'Transactions', url: '/transactions' },
  { name: 'Accounts', url: '/accounts' },
];

const guestLinks = [
  { name: 'Login', url: '/login' },
  { name: 'Create Account', url: '/create-account' },
];

function App() {
  const [user, setUser] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState([]);

  const accountContextValue = {
    user,
    accounts,
    setUser,
    setAccounts,
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    const allAccounts = localStorage.getItem('accounts');

    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    } else {
      setUser(null);
    }

    if (allAccounts) {
      const foundAccounts = JSON.parse(allAccounts);
      setAccounts(foundAccounts);
    } else {
      setAccounts([]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    setLinks(user ? userLinks : guestLinks);
  }, [user]);

  if (isLoading) {
    return null;
  }

  return (
    <AccountContext.Provider value={accountContextValue}>
      <Router>
        <WaveParticles />
        {user && <Topbar links={links} />}
        <Routes>
          <Route path="/create-account" element={user === null ? <CreateAccount /> : <Navigate replace to="/home" />} />
          <Route path="/login" element={user === null ? <Login /> : <Navigate replace to="/home" />} />
          <Route path="/home" element={user ? <Home /> : <Navigate replace to="/login" />} />
          <Route path="/deposit" element={user ? <Deposit /> : <Navigate replace to="/login" />} />
          <Route path="/withdraw" element={user ? <Withdraw /> : <Navigate replace to="/login" />} />
          <Route path="/transactions" element={user ? <AllData /> : <Navigate replace to="/login" />} />
          <Route path="/accounts" element={user ? <Accounts /> : <Navigate replace to="/login" />} />
          <Route path="*" element={user ? <Navigate replace to="/home" /> : <Navigate replace to="/login" />} />
        </Routes>

      </Router>
    </AccountContext.Provider>
  );
}

export default App;
