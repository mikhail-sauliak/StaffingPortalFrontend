import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container } from 'react-bootstrap';

const EditPerson = ({ personId, onPersonUpdated }) => { 

  const [personData, setPersonData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    divisionManager: '',
    resourceManager: '',
    availableFrom: '',
    comments: '',
    projectCandidates: [], // установите значение по умолчанию как пустой массив
  });

  useEffect(() => {
      axios.get(`https://localhost:7047/api/people/${personId}`)
          .then(response => {
              const data = {
                  ...response.data,
                  projectCandidates: response.data.projectCandidates || [], // обработка null
              };
              setPersonData(data);
          })
          .catch(error => {
              console.error('There was an error fetching the person data!', error);
          });
  }, [personId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPersonData({ ...personData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.put(`https://localhost:7047/api/people/${personId}`, {
      ...personData,
      ProjectCandidateIds: personData.projectCandidates.map(pc => pc.id), // Предполагая, что у каждого projectCandidate есть id
    })
      .then(response => {
        onPersonUpdated(response.data);
      })
      .catch(error => {
        console.error('There was an error updating the person!', error);
      });
  };

  return (
    <Container>
      <h2>Edit Person</h2>
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" name="firstName" value={personData.firstName} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" name="lastName" value={personData.lastName} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group controlId="location">
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

            <Form.Group controlId="comments">
            <Form.Label>Comments</Form.Label>
            <Form.Control type="text" name="comments" value={personData.comments} onChange={handleInputChange} />
            </Form.Group>

            <Button variant="primary" type="submit">Save Changes</Button>
        </Form>
    </Container>
  );
};

export default EditPerson;
