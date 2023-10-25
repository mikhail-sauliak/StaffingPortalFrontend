import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync } from '../utils/slice';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Col, Row } from 'react-bootstrap';

const validationSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const { token } = useSelector((state) => state.auth); 

  const formik = useFormik({
      initialValues: {
          username: '',
          password: '',
      },
      validationSchema: validationSchema,
      onSubmit: (values) => {
          dispatch(loginAsync(values));
      },
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('token');
      if (newToken && newToken !== token) {
        // Update Redux state
        dispatch(/* action to update the token in Redux */);
      }
    };

    if (token) {
      navigate('/');
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token, dispatch, navigate]);

  return (
    <Container className="mt-5">
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      <Form onSubmit={formik.handleSubmit}>
        <Row className="justify-content-md-center">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                name="username"
                onChange={formik.handleChange}
                value={formik.values.username}
              />
              {formik.errors.username && <div className="text-danger">{formik.errors.username}</div>}
            </Form.Group>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
              {formik.errors.password && <div className="text-danger">{formik.errors.password}</div>}
            </Form.Group>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md={6} className="text-center">
            <Button variant="primary" type="submit">Login</Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Login;
