import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container } from 'react-bootstrap';

const CreatePerson = ({ onPersonCreated }) => {
  const [personData, setPersonData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    divisionManager: '',
    resourceManager: '',
    availableFrom: '',
    comments: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPersonData({ ...personData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('https://localhost:7047/api/people', personData)
      .then(response => {
        onPersonCreated(response.data);
        setPersonData({
          firstName: '',
          lastName: '',
          location: '',
          divisionManager: '',
          resourceManager: '',
          availableFrom: '',
          techStack: '',
          comments: '',
        });
      })
      .catch(error => {
        console.error('There was an error creating the person!', error);
      });
  };

  return (
    <Container>
    <h2>Create Person</h2>
      <Form onSubmit={handleSubmit}>
          <Form.Group controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" name="firstName" value={personData.firstName} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" name="lastName" value={personData.lastName} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="lastName">
            <Form.Label>Location</Form.Label>
            <Form.Control type="text" name="location" value={personData.location} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="divisionManager">
            <Form.Label>Division Manager</Form.Label>
            <Form.Control type="text" name="divisionManager" value={personData.divisionManager} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="resourceManager">
            <Form.Label>Talent Manager</Form.Label>
            <Form.Control type="text" name="resourceManager" value={personData.resourceManager} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="availableFrom">
            <Form.Label>Available From</Form.Label>
            <Form.Control type="date" name="availableFrom" value={personData.availableFrom} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="techStack">
            <Form.Label>Tech Stack</Form.Label>
            <Form.Control type="text" name="techStack" value={personData.techStack} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="comments">
            <Form.Label>Comments</Form.Label>
            <Form.Control type="text" name="comments" value={personData.comments} onChange={handleInputChange} />
          </Form.Group>

          <Button variant="primary" type="submit">Save Changes</Button>
      </Form>
  </Container>
  );
};

export default CreatePerson;
