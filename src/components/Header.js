import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

const Header = () => {
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
        </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
};

export default Header;
