import { useState, useContext, useEffect } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { AccountContext } from '../AccountContext';
import CustomCard from './CustomCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function Withdraw() {
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [error, setError] = useState('');
    const { user, setUser } = useContext(AccountContext);
    const [withdrawHistory, setWithdrawHistory] = useState([]);

    useEffect(() => {
        const fetchBalance = async () => {
            const response = await axios.get(`http://localhost:3001/balance/${user.email}`);
            const updatedBalance = response.data.balance;
            setUser({ ...user, balance: updatedBalance });
        };

        fetchBalance();
    }, [withdrawHistory, setUser, user]);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            const response = await axios.get('http://localhost:3001/transactions');
            const withdrawalsOnly = response.data.filter(t => t.type === 'Withdraw' && t.accountId === user.email);
            setWithdrawHistory(withdrawalsOnly);
        };

        fetchWithdrawals();
    }, [user.email]);


    const handleWithdraw = () => {
        if (withdrawAmount === '' || withdrawAmount === '-' || withdrawAmount.toLowerCase() === 'e' || withdrawAmount.toLowerCase() === 'E' || isNaN(withdrawAmount) || withdrawAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (withdrawAmount > user.balance) {
            setError('Insufficient funds');
            return;
        }

        const validWithdrawAmount = parseFloat(withdrawAmount);
        const updatedBalance = user.balance - validWithdrawAmount;


        setUser({ ...user, balance: updatedBalance });




        const transaction = {
            accountId: user.email,
            id: uuidv4(),
            type: 'Withdraw',
            amount: withdrawAmount,
            effectiveDate: new Date().toISOString(),
        };

        axios.post('http://localhost:3001/transactions', transaction)
            .then(response => {
                toast.success("Successful Withdrawal");
                setWithdrawAmount('');
                setWithdrawHistory([...withdrawHistory, transaction]);
            })
            .catch(error => {
                console.error('Could not complete withdrawal:', error);
            });
    };


    const handleWithdrawAmountChange = (event) => {
        let amount = event.target.value;

        amount = amount.replace(/^0+/, '');

        setWithdrawAmount(amount);

        if (Number(amount) > user.balance) {
            setError('Insufficient funds');
        }
        else if (amount === '-' || amount.toLowerCase() === 'e' || amount.toLowerCase() === 'E' || (amount && (Number(amount) <= 0 || isNaN(Number(amount))))) {
            setError('Enter a valid amount');
        } else {
            setError('');
        }
    };

    return (
        <div className='full-height col-12 d-flex flex-column align-items-center pt-5 justify-content-start'>
            <ToastContainer theme="dark" position="bottom-left" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className='col-lg-8 col-md-10 col-sm-11'>
                <CustomCard className="bg-dark text-white col-lg-4 col-md-6 col-sm-5">
                    <CustomCard.Body className="gap-3">
                        <div className='d-flex flex-column'>
                            <div className='d-flex flex-row mb-3'>
                                <div className="h5 mb-0">Balance ${user.balance}</div>
                            </div>
                            <Form className='d-flex flex-row gap-2 align-items-center'>
                                <Form.Group className="">
                                    <Form.Control
                                        isInvalid={!!error}
                                        className='borderless border-radius bg-dark text-white custom-border'
                                        type="text"
                                        placeholder="Amount"
                                        value={withdrawAmount}
                                        onChange={handleWithdrawAmountChange}
                                    />
                                    <Form.Control.Feedback className='fs-6 position-absolute' type="invalid">
                                        {error}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Button className='border-radius' variant="primary" onClick={handleWithdraw} disabled={withdrawAmount === '' || !!error}>
                                    Withdraw
                                </Button>
                            </Form>
                        </div>
                    </CustomCard.Body>
                </CustomCard>
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
                    <tbody>
                        {withdrawHistory.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>{transaction.id}</td>
                                <td>Withdrawal</td>
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

export default Withdraw;
