import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Row, Col } from 'react-bootstrap';

const Home = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => !!state.auth.token);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Welcome to the Staffing Portal</h1>
      <Row xs={1} md={2} lg={4} className="g-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Projects</Card.Title>
              <Card.Text>
                Manage and view all projects.
              </Card.Text>
              <Link to="/projects">
                <Button variant="primary">Go to Projects</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Availability List</Card.Title>
              <Card.Text>
                Check the availability list of staff.
              </Card.Text>
              <Link to="/people">
                <Button variant="primary">Check Availability</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Salary Reviews</Card.Title>
              <Card.Text>
                Review salary information.
              </Card.Text>
              <Link to="/salaryreviews">
                <Button variant="primary">Review Salaries</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Salary Review Approvals</Card.Title>
              <Card.Text>
                Approve or decline salary reviews.
              </Card.Text>
              <Link to="/salaryreviewrequests">
                <Button variant="primary">Review Approvals</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="text-center mt-4">
        <Link to="/changepassword">
          <Button variant="secondary">Change Password</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
