import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordAsync } from '../utils/slice';
import { Container, Form, Button, Alert, Col, Row } from 'react-bootstrap';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    dispatch(changePasswordAsync({ oldPassword, newPassword }));
  };

  return (
    <Container className="mt-5">
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row className="justify-content-md-center">
            <Form.Group controlId="formOldPassword" className="col-md-6 mx-auto">
              <Form.Label>Old Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Form.Group>
        </Row>
        <Row className="justify-content-md-center">
            <Form.Group controlId="formNewPassword" className="col-md-6 mx-auto">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
        </Row>
        <Row className="justify-content-md-center">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formConfirmNewPassword">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md={6} className="text-center">
            <Button variant="primary" type="submit">Change Password</Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default ChangePassword;
