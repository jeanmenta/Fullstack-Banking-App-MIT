import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Form, Col, Row, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AccountContext } from '../AccountContext';
import CustomCard from './CustomCard';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Accounts() {
    const { user, accounts, setAccounts, setUser } = useContext(AccountContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showLoginConfirmation, setShowLoginConfirmation] = useState(false);
    const navigate = useNavigate();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [emailError, setEmailError] = useState('');

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const handleBlur = (field) => () => {
        setTouched({ ...touched, [field]: true });
    }

    useEffect(() => {
        const storedAccounts = JSON.parse(localStorage.getItem('accounts'));
        if (storedAccounts) {
            setAccounts(storedAccounts);
        }
    }, [setAccounts, user]);

    const handleLogin = (account) => {
        setSelectedAccount(account);
        setShowLoginConfirmation(true);
    };

    const handleConfirmLogin = () => {
        setUser(selectedAccount);
        localStorage.setItem('user', JSON.stringify(selectedAccount));
        navigate('/accounts');
    };

    const emailExistsInAccounts = (email) => {
        return accounts.some(account => account.email === email);
    };


    const handleCreateAndLinkAccount = () => {
        const newAccount = {
            id: uuidv4(),
            email: email,
            password: password,
            name: name,
            balance: 0,
            linkedAccounts: [user.email],
        };

        if (emailExistsInAccounts(email)) {
            setEmailError('This email is already taken.');
            return;
        }

        setEmailError('');

        const updatedAccounts = [...accounts];
        let updatedUser = { ...user };

        for (let account of updatedAccounts) {
            if (account.email === updatedUser.email || updatedUser.linkedAccounts.includes(account.email)) {
                if (!account.linkedAccounts.includes(newAccount.email)) {
                    account.linkedAccounts.push(newAccount.email);
                }

                if (!newAccount.linkedAccounts.includes(account.email)) {
                    newAccount.linkedAccounts.push(account.email);
                }

                if (account.email === updatedUser.email && !updatedUser.linkedAccounts.includes(newAccount.email)) {
                    updatedUser.linkedAccounts.push(newAccount.email);
                }
            }

            if (account.email === updatedUser.email) {
                account.balance = updatedUser.balance;
                account.linkedAccounts = updatedUser.linkedAccounts;
            }
        }

        updatedAccounts.push(newAccount);

        setAccounts(updatedAccounts);
        setUser(updatedUser);
        localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowModal(false);

        toast.success("Account linked successfully");

        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTouched({
            name: false,
            email: false,
            password: false,
            confirmPassword: false
        });

        navigate('/accounts');
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email.length > 0 && password.length >= 8 && password === confirmPassword && emailRegex.test(email) && !emailError;
    };


    const linkedAccounts = accounts.filter(
        (account) => (user.linkedAccounts.includes(account.email) && account.email !== user.email)
    );

    return (
        <div className='full-height col-12 d-flex flex-column align-items-center pt-5 justify-content-start'>
            <ToastContainer theme="dark" position="bottom-left" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className='col-lg-8 col-md-10 col-sm-11'>
                <Row className='d-flex flex-column'>
                    <Col>
                        {user && (
                            <CustomCard className="bg-dark text-center text-white col-lg-4 col-md-6 col-sm-5">
                                <CustomCard.Body className="gap-3">
                                    <Card.Title>{user.email}</Card.Title>
                                    <Card.Text>Balance ${user.balance}</Card.Text>
                                </CustomCard.Body>
                            </CustomCard>
                        )}
                        <Button className='mt-3 border-radius' variant="primary" onClick={() => setShowModal(true)}>
                            Create and Link Account
                        </Button>
                    </Col>
                    <Col>
                        <div className="table-responsive">
                            <Table className='table table-borderless mt-3 border-radius overflow-hidden table-dark align-middle' striped>
                                <thead>
                                    <tr>
                                        <th>Account Id</th>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>Balance</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody style={{ maxHeight: "40vh", overflow: "auto" }}>
                                    {linkedAccounts.map((account, index) => (
                                        <tr key={account.id}>
                                            <td>{account.id}</td>
                                            <td>{account.email}</td>
                                            <td>{account.email}</td>

                                            <td>${account.balance}</td>
                                            <td>
                                                <Button className='border-radius' variant="primary" onClick={() => handleLogin(account)}>
                                                    Log in
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                    <Modal className='mt-5' show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header className='' closeButton>
                            <Modal.Title>Create and Link Account</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className=''>
                            <Form>
                                <Form.Group className="mb-3" controlId="formBasicNameModal">
                                    <Form.Control
                                        className='borderless border-radius text-dark custom-border'
                                        required
                                        type="text"
                                        placeholder="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={handleBlur('name')}
                                        isInvalid={touched.name && name.length === 0}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Enter a name
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicEmailModal">
                                    <Form.Control
                                        className='borderless border-radius text-dark custom-border'
                                        required
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailExistsInAccounts(e.target.value)) {
                                                setEmailError('This email is already taken.');
                                            } else {
                                                setEmailError('');
                                            }
                                        }}
                                        onBlur={handleBlur('email')}
                                        isInvalid={touched.email && (!emailRegex.test(email) || emailError)}
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {emailError || 'Enter a valid email'}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPasswordModal">
                                    <Form.Control
                                        className='borderless border-radius text-dark custom-border'
                                        required
                                        type="password"
                                        placeholder="Password"
                                        minLength="8"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={handleBlur('password')}
                                        isInvalid={touched.password && password.length < 8}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Password must have at least 8 characters
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicConfirmPasswordModal">
                                    <Form.Control
                                        className='borderless border-radius text-dark custom-border'
                                        required
                                        type="password"
                                        placeholder="Confirm Password"
                                        minLength="8"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onBlur={handleBlur('confirmPassword')}
                                        isInvalid={password !== confirmPassword && confirmPassword.length > 0}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Passwords do not match
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Button className='col-12 align-self-center border-radius' variant="primary" onClick={handleCreateAndLinkAccount} disabled={!validateForm()}>
                                    Create and Link Account
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                    <Modal className='mt-5 border-radius' show={showLoginConfirmation} onHide={() => setShowLoginConfirmation(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Login Confirmation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>You are about to login to {selectedAccount?.email}</div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button className='border-radius' variant="secondary" onClick={() => setShowLoginConfirmation(false)}>
                                Cancel
                            </Button>
                            <Button className='border-radius' variant="primary" onClick={() => {
                                setShowLoginConfirmation(false);
                                handleConfirmLogin();
                            }}>
                                Confirm Login
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Row>
            </div>
        </div>
    );
}

export default Accounts;
