import { Table, Form } from 'react-bootstrap';
import { useEffect, useState, useContext, useMemo } from 'react';
import { AccountContext } from '../AccountContext';
import axios from 'axios'; // Import Axios

function Transactions() {
    const { user } = useContext(AccountContext);

    const [allTransactions, setAllTransactions] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/transactions')
            .then(response => {
                setAllTransactions(response.data);
            })
            .catch(error => {
                console.error('Could not fetch transactions:', error);
            });
    }, []);

    const userTransactions = useMemo(() =>
        allTransactions
            .filter(transaction => transaction.accountId === user.email)
            .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate)),
        [allTransactions, user]);

    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [displayTransactions, setDisplayTransactions] = useState(userTransactions);

    const handleTypeFilter = (e) => {
        setFilterType(e.target.value.toLowerCase());
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    useEffect(() => {
        let filteredTransactions = userTransactions;

        if (filterType !== 'all') {
            filteredTransactions = filteredTransactions.filter(transaction => transaction.type.toLowerCase() === filterType);
        }

        if (searchTerm !== '') {
            filteredTransactions = filteredTransactions.filter(transaction =>
                transaction.id.toString().toLowerCase().includes(searchTerm) ||
                transaction.amount.toString().toLowerCase().includes(searchTerm) ||
                transaction.type.toLowerCase().includes(searchTerm)
            );
        }

        setDisplayTransactions(filteredTransactions);
    }, [filterType, searchTerm, userTransactions]);

    return (
        <div className='full-height col-12 d-flex flex-column align-items-center pt-5 justify-content-start'>
            <div className='col-lg-8 col-md-10 col-sm-11'>
                <div className=' gap-3 d-flex flex-row justify-content-between flex-row align-items-center'>
                    <Form.Group className='col-lg-5 col-md-7 col-sm-5' controlId="search">
                        <Form.Control
                            className='borderless border-radius bg-dark text-white'
                            type="text"
                            placeholder="Search by Id, Amount, or Type..."
                            onChange={handleSearch}
                        />
                    </Form.Group>
                    <Form.Group className='col-lg-2 col-md-2 col-sm-3' controlId="filterType">
                        <Form.Control className='borderless border-radius bg-dark text-white' as="select" onChange={handleTypeFilter}>
                            <option value="all">All</option>
                            <option value="deposit">Deposits</option>
                            <option value="withdraw">Withdrawals</option>
                        </Form.Control>
                    </Form.Group>
                </div>
                <Table className='table table-borderless mt-3 border-radius overflow-hidden table-dark' striped>
                    <thead>
                        <tr>
                            <th>Transaction Id</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody style={{ maxHeight: "40vh", overflow: "auto" }}>
                        {displayTransactions.map((transaction, index) => (
                            <tr key={transaction.id}>
                                <td>{transaction.id}</td>
                                <td>{transaction.type === "Withdraw" ? "Withdrawal" : transaction.type}</td>
                                <td>${transaction.amount}</td>
                                <td>{new Date(transaction.effectiveDate).toLocaleDateString()}</td>
                                <td>{new Date(transaction.effectiveDate).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default Transactions;
