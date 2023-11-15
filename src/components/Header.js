//Header.js
import React, { useState } from 'react';
import { Navbar, Nav, Modal, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch } from 'react-redux';
import { logout } from '../utils/slice';
import getUserRoleFromToken from './hooks/getUserRole';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const userRole = getUserRoleFromToken();

  const handleLogoutClick = () => {
      setShowModal(true);
  };

  const handleConfirmLogout = () => {
    dispatch(logout()); 
    localStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/login');
    setShowModal(false);
  };

    const handleCancelLogout = () => {
        setShowModal(false);
    };

    return (
        <Navbar 
            bg="dark" 
            variant="dark" 
            expand="lg" 
            style={{ 
                fontSize: '16px', 
                zIndex: 1000,
                position: 'sticky',
                top: 0
            }}
        >
            <LinkContainer to="/">
                <Navbar.Brand>Staff Portal</Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <NavLink to="/" exact className="nav-link" activeClassName="active">
                        Home
                    </NavLink>
                    <NavLink to="/projects" className="nav-link" activeClassName="active">
                        Projects
                    </NavLink>
                    <NavLink to="/people" className="nav-link" activeClassName="active">
                        People
                    </NavLink>
                    <NavLink to="/salaryreviews" className="nav-link" activeClassName="active">
                        Salary Reviews
                    </NavLink>
                    {userRole === 'Head' || userRole === 'DeputyHead' || userRole === 'DivisionManager' ? (
                        <NavLink to="/salaryreviewrequests" className="nav-link" activeClassName="active">
                            Salary Reviews to Approve
                        </NavLink>
                    ) : null}
                    {userRole === 'Head' || userRole === 'DeputyHead' || userRole === 'DivisionManager' ? (
                        <NavLink to="/admin" className="nav-link" activeClassName="active">
                            Admin Panel
                        </NavLink>
                    ) : null}
                    <NavLink to="/changepassword" className="nav-link" activeClassName="active">
                        Change Password
                    </NavLink> 
                </Nav>
                <Nav>
                    <Nav.Link onClick={handleLogoutClick}>Logout</Nav.Link>
                </Nav>
            </Navbar.Collapse>

            <Modal show={showModal} onHide={handleCancelLogout}>
                <Modal.Header closeButton>
                    <Modal.Title>Log Out</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to log out?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelLogout}>
                        No
                    </Button>
                    <Button variant="primary" onClick={handleConfirmLogout}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Navbar>
    );
};

export default Header;
