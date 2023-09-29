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
    techStack: '',
    comments: '',
    stream: 'QA', // Default value
    tmAware: 'Not', // Default value
    level: 'Intern', // Default value
    assignmentExistsInGCP: 'No', // Default value
    plannedAssignment: '',
  });

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === 'radio' && name === 'assignmentExistsInGCP') {
        setPersonData({ ...personData, [name]: checked });
    } else {
        setPersonData({ ...personData, [name]: value });
    }
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

          <Form.Group controlId="stream">
            <Form.Label>Stream</Form.Label>
            <Form.Control as="select" name="stream" value={personData.stream} onChange={handleInputChange}>
              <option value="QA">QA</option>
              <option value="SDET">SDET</option>
            </Form.Control>
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

          <Form.Group controlId="tmAware">
            <Form.Label>TM Aware</Form.Label>
            {['Not', 'Notified', 'Approves'].map(value => (
              <Form.Check 
                type="radio"
                label={value}
                name="tmAware"
                value={value}
                checked={personData.tmAware === value}
                onChange={handleInputChange}
              />
            ))}
          </Form.Group>

          <Form.Group controlId="level">
            <Form.Label>Level</Form.Label>
            {['Intern', 'Junior', 'Middle', 'Senior', 'Lead', 'Principal'].map(value => (
              <Form.Check 
                type="radio"
                label={value}
                name="level"
                value={value}
                checked={personData.level === value}
                onChange={handleInputChange}
              />
            ))}
          </Form.Group>

          <Form.Group controlId="assignmentExistsInGCP">
            <Form.Label>Assignment Exists in GCP</Form.Label>
            {['Yes', 'No'].map(value => (
                <Form.Check 
                    type="radio"
                    label={value}
                    name="assignmentExistsInGCP"
                    value={value === 'Yes'}
                    checked={personData.assignmentExistsInGCP === (value === 'Yes')}
                    onChange={handleInputChange}
                />
            ))}
        </Form.Group>

          <Form.Group controlId="availableFrom">
            <Form.Label>Available From</Form.Label>
            <Form.Control type="date" name="availableFrom" value={personData.availableFrom} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="techStack">
            <Form.Label>Tech Stack</Form.Label>
            <Form.Control type="text" name="techStack" value={personData.techStack} onChange={handleInputChange} />
          </Form.Group>

          <Form.Group controlId="plannedAssignment">
            <Form.Label>Planned Assignment</Form.Label>
            <Form.Control type="text" name="plannedAssignment" value={personData.plannedAssignment} onChange={handleInputChange} />
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
