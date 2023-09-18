import React, { useContext, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { AccountContext } from '../AccountContext';
import { Link, useNavigate } from 'react-router-dom';
import CustomCard from './CustomCard';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { provider } from '../firebaseConfig';

function CreateAccount() {
    const { setUser } = useContext(AccountContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const navigate = useNavigate();
    const auth = getAuth();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const handleBlur = (field) => () => {
        setTouched({ ...touched, [field]: true });
    }

    const validateForm = () => {
        return name.length > 0 &&
            email.length > 0 &&
            password.length >= 8 &&
            password === confirmPassword &&
            emailRegex.test(email) &&
            emailError === "";
    };

    const handleCreateAccount = async (event) => {
        event.preventDefault();

        try {
            // Create account in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create account in MongoDB
            await fetch('http://localhost:3001/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            setUser(user);
            navigate('/home');
        } catch (error) {
            console.error("Account creation failed:", error);
            setEmailError("Account creation failed. Please try again.");
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const name = user.displayName;
            const email = user.email;

            await fetch('http://localhost:3001/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            setUser(user);
            navigate('/home');
        } catch (error) {
            console.error("Google Sign-In Error", error);
        }
    };


    return (
        <div className='full-height col-12 d-flex flex-column align-items-center justify-content-center'>
            <div className='logo'>Pro Bank</div>
            <div className='col-lg-3 col-md-6 col-sm-10'>
                <CustomCard>
                    <CustomCard.Body>
                        <h2 className="text-center mb-4">Create Account</h2>
                        <Form onSubmit={handleCreateAccount}>
                            <Form.Group id="name">
                                <Form.Control
                                    className='borderless border-radius bg-dark text-white custom-border'
                                    placeholder='Name'
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={handleBlur('name')}
                                    isInvalid={touched.name && name.length === 0}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Enter a name
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className='mt-3' id="email">
                                <Form.Control
                                    className='borderless border-radius bg-dark text-white custom-border'
                                    placeholder='Email'
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);

                                    }}
                                    isInvalid={touched.email && (!emailRegex.test(email) || emailError)}
                                    onBlur={handleBlur('email')}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {emailError || "Enter a valid email"}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className='mt-3' id="password">
                                <Form.Control
                                    className='borderless border-radius bg-dark text-white custom-border'
                                    placeholder='Password'
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={handleBlur('password')}
                                    isInvalid={touched.password && password.length < 8}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Password must have at least 8 characters
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className='mt-3' id="confirmPassword">
                                <Form.Control
                                    className='borderless border-radius bg-dark text-white custom-border'
                                    placeholder='Confirm Password'
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    isInvalid={password !== confirmPassword && confirmPassword.length > 0}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Passwords do not match
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Button className="border-radius mt-3 w-100" type="submit" disabled={!validateForm()}>
                                Create Account
                            </Button>
                            <Button onClick={signInWithGoogle}>Sign in with Google</Button>

                            <div className='mt-3 col-12 text-center color-lightgray'>Or</div>
                            <Link to="/login" className="mt-1 fs-5 btn btn-link w-100">Log In</Link>
                        </Form>
                    </CustomCard.Body>
                </CustomCard>
            </div>
        </div>
    );
}

export default CreateAccount;
