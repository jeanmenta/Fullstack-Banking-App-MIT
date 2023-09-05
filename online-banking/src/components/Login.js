import React, { useContext, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { AccountContext } from '../AccountContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CustomCard from './CustomCard';

function Login() {
    const { setUser } = useContext(AccountContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [emailFormatError, setEmailFormatError] = useState(false);
    const navigate = useNavigate();

    const [touched, setTouched] = useState({
        email: false,
        password: false
    });

    const handleBlur = (field) => () => {
        setTouched({ ...touched, [field]: true });

        if (field === 'email' && !validateEmailFormat(email)) {
            setEmailFormatError(true);
        }
    }

    const validateEmailFormat = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const handleLogin = (event) => {
        event.preventDefault();

        const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const accountExists = accounts.find(account => account.email === email);
        const user = accountExists && accountExists.password === password ? accountExists : null;

        if (!validateEmailFormat(email)) {
            setEmailFormatError(true);
            return;
        }

        if (accountExists && user) {
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/home');
        } else if (accountExists && !user) {
            setPasswordError(true);
            setEmailError(false);
        } else {
            setEmailError(true);
            setPasswordError(false);
        }
    };

    const handleEmailChange = (event) => {
        const value = event.target.value;
        setEmail(value);
        if (touched.email) {
            setEmailFormatError(!validateEmailFormat(value));
        }
    }
    return (
        <div className='full-height col-12 d-flex flex-column align-items-center justify-content-center'>
            <div className='logo'>Pro Bank</div>
            <div className='col-lg-3 col-md-6 col-sm-10'>
                <CustomCard >
                    <CustomCard.Body>
                        <h2 className="text-center mb-4">Log In</h2>
                        <Form onSubmit={handleLogin}>
                            <Form.Group id="email">
                                <Form.Control
                                    className='borderless border-radius bg-dark text-white custom-border'
                                    type="email"
                                    required
                                    placeholder='Email'
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={handleBlur('email')}
                                    isInvalid={(emailError && touched.email) || (touched.email && email.length === 0) || (touched.email && emailFormatError)}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {email.length === 0 ? "Enter an email" : emailFormatError ? "Enter a valid email" : "Email does not exist"}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className='mt-3' id="password">
                                <Form.Control
                                    className='borderless border-radius bg-dark text-white custom-border'
                                    type="password"
                                    required
                                    placeholder='Password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={handleBlur('password')}
                                    isInvalid={(passwordError && touched.password) || (touched.password && password.length === 0)}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {password.length === 0 ? "Enter a password" : "Incorrect password"}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Button
                                className="mt-3 border-radius w-100"
                                type="submit"
                                disabled={
                                    !(email && password) ||
                                    emailError ||
                                    passwordError ||
                                    emailFormatError ||
                                    (email.length === 0) ||
                                    (password.length === 0)
                                }
                            >
                                Log In
                            </Button>
                            <div className='mt-3 col-12 text-center color-lightgray'>Or</div>
                            <Link to="/create-account" className="mt-1 fs-5 btn btn-link w-100">Create Account</Link>
                        </Form>
                    </CustomCard.Body>
                </CustomCard>
            </div>
        </div >
    );
}

export default Login;
