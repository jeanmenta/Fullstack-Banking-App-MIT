import React, { useContext, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { AccountContext } from '../AccountContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CustomCard from './CustomCard';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { provider } from '../firebaseConfig';

function Login() {
    const { setUser } = useContext(AccountContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const auth = getAuth();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setUser(user);
            navigate('/home');
        } catch (error) {
            console.error("Login failed:", error);
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
                                    onChange={(e) => setEmail(e.target.value)}

                                />

                            </Form.Group>
                            <Form.Group className='mt-3' id="password">
                                <Form.Control
                                    className='borderless border-radius bg-dark text-white custom-border'
                                    type="password"
                                    required
                                    placeholder='Password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {password.length === 0 ? "Enter a password" : "Incorrect password"}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Button
                                className="mt-3 border-radius w-100"
                                type="submit"
                                disabled={!email || !password}
                            >
                                Log In
                            </Button>
                            <Button onClick={signInWithGoogle}>Sign in with Google</Button> {/* New Button */}

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
