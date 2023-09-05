import { useState, useContext, useEffect } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { AccountContext } from '../AccountContext';
import CustomCard from './CustomCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Withdraw() {
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [error, setError] = useState('');
    const { user, setUser } = useContext(AccountContext);
    const [withdrawHistory, setWithdrawHistory] = useState([]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const withdrawTransactions = transactions.filter(
            (transaction) => transaction.type === 'Withdraw' && transaction.accountId === storedUser.email
        );
        const sortedWithdrawTransactions = withdrawTransactions.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
        setWithdrawHistory(sortedWithdrawTransactions);
    }, [setUser]);

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

        let storedAccounts = JSON.parse(localStorage.getItem('accounts')) || [];

        const updatedAccounts = storedAccounts.map((account) => {
            if (account.email === user.email) {
                account.balance = updatedBalance;
            }
            return account;
        });

        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));

        const updatedUser = { ...user, balance: updatedBalance };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

        const transaction = {
            accountId: user.email,
            id: uuidv4(),
            type: 'Withdraw',
            amount: withdrawAmount,
            effectiveDate: new Date().toISOString(),
        };

        transactions.push(transaction);

        localStorage.setItem('transactions', JSON.stringify(transactions));

        setWithdrawAmount('');
        setWithdrawHistory([...withdrawHistory, transaction]);

        toast.success("Successful Withdrawal");
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
