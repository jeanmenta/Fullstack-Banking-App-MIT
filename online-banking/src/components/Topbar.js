import React, { useContext } from 'react';
import { Nav, Navbar, Dropdown } from 'react-bootstrap';
import { AccountContext } from '../AccountContext';
import { Link, useLocation } from 'react-router-dom';

const Topbar = React.memo(({ links }) => {
    const { user, setUser } = useContext(AccountContext);
    const location = useLocation();

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    }

    return (
        <Navbar className="col-12 d-flex justify-content-around" bg="dark" variant="dark" expand="lg">
            <Navbar.Brand as={Link} to="/home">Pro Bank</Navbar.Brand>
            <div>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        {links.map((link, index) => (
                            <Nav.Link as={Link} to={link.url} key={index} active={location.pathname === link.url}>{link.name}</Nav.Link>
                        ))}
                        {user && (
                            <Dropdown className='bg-dark' style={{ marginTop: "1px" }}>
                                <Dropdown.Toggle className='bg-dark' variant="dark" id="user-dropdown">
                                    <i className="fas fa-user"></i> {user.email}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className='bg-dark text-white dropdown-menu-dark'>
                                    <Dropdown.Item as={Link} to="/accounts">Accounts</Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </div>
        </Navbar>
    );
});

export default Topbar;
