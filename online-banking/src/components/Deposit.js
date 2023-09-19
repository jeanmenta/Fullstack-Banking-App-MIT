import { useState, useContext } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Button, Form, Table } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { AccountContext } from '../AccountContext';
import CustomCard from './CustomCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GET_BALANCE, GET_TRANSACTIONS } from '../AccountContext';

const ADD_DEPOSIT_TRANSACTION = gql`
  mutation AddTransaction($transaction: TransactionInput!) {
    addTransaction(transaction: $transaction) {
      id
    }
  }
`;

function Deposit() {
    const [depositAmount, setDepositAmount] = useState('');
    const [error, setError] = useState('');
    const { user, balance, transactions, isLoading } = useContext(AccountContext);

    const [addTransaction] = useMutation(ADD_DEPOSIT_TRANSACTION, {
        refetchQueries: [
            {
                query: GET_BALANCE,
                variables: { email: user?.email }
            },
            {
                query: GET_TRANSACTIONS,
                variables: { email: user?.email }
            }
        ]
    });

    const handleDeposit = async () => {
        if (depositAmount === '' || isNaN(depositAmount) || depositAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const transaction = {
            accountId: user.email,
            id: uuidv4(),
            type: 'Deposit',
            amount: parseFloat(depositAmount),
            effectiveDate: new Date().toISOString(),
        };

        try {
            await addTransaction({ variables: { transaction } });
            toast.success("Successful Deposit");
            setDepositAmount('');
        } catch (error) {
            console.error('Could not complete deposit:', error);
        }
    };

    const handleDepositAmountChange = (event) => {
        let amount = event.target.value;
        amount = amount.replace(/^0+/, '');
        setDepositAmount(amount);

        if (amount === '-' || amount.toLowerCase() === 'e' || amount.toLowerCase() === 'E' || (amount && (Number(amount) <= 0 || isNaN(Number(amount))))) {
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
                                <div className="h5 mb-0">
                                    {isLoading ? 'Loading...' : `Balance $${balance}`}
                                </div>
                            </div>
                            <Form className='d-flex flex-row gap-2 align-items-center'>
                                <Form.Group className="">
                                    <Form.Control
                                        isInvalid={!!error}
                                        className='borderless border-radius bg-dark text-white custom-border'
                                        type="text"
                                        placeholder="Amount"
                                        value={depositAmount}
                                        onChange={handleDepositAmountChange}
                                    />
                                    <Form.Control.Feedback className='fs-6 position-absolute' type="invalid">
                                        {error}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Button className='border-radius' variant="primary" onClick={handleDeposit} disabled={depositAmount === '' || !!error}>
                                    Deposit
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
                        {isLoading ? (
                            <tr>
                                <td colSpan="5">Loading...</td>
                            </tr>
                        ) : (
                            transactions
                                .filter(transaction => transaction.type === 'Deposit')
                                .map(transaction => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.id}</td>
                                        <td>{transaction.type}</td>
                                        <td>${transaction.amount}</td>
                                        <td>{new Date(transaction.effectiveDate).toLocaleDateString()}</td>
                                        <td>{new Date(transaction.effectiveDate).toLocaleTimeString()}</td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default Deposit;
