import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container } from 'react-bootstrap';

    const CreateProject = ({ onProjectCreated }) => {
    const [projectData, setProjectData] = useState({
        name: '',
        techStack: '',
        startDate: '',
        endDate: '',
        comments: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProjectData({ ...projectData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    
        let payload = { ...projectData };
        if (!payload.CandidateIds || payload.CandidateIds.length === 0) {
        delete payload.CandidateIds; // delete field if it is empty or null
        }
    
        axios.post('https://localhost:7047/api/projects', payload)
        .then(response => {
            onProjectCreated(response.data);
            setProjectData({
            name: '',
            techStack: '',
            startDate: '',
            endDate: '',
            candidate: '',
            comments: ''
            });
        })
        .catch(error => {
            console.error('There was an error creating the project!', error);
        });
    };

    return (
        <Container>
            <h2>Create Project</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" name="name" value={projectData.name} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="techStack">
                <Form.Label>Tech Stack</Form.Label>
                <Form.Control type="text" name="techStack" value={projectData.techStack} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="startDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control type="date" name="startDate" value={projectData.startDate} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control type="date" name="endDate" value={projectData.endDate} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="candidate">
                <Form.Label>Candidate</Form.Label>
                <Form.Control type="text" name="candidate" value={projectData.candidate} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="comments">
                <Form.Label>Comments</Form.Label>
                <Form.Control type="text" name="comments" value={projectData.comments} onChange={handleInputChange} />
                </Form.Group>

                <Button variant="primary" type="submit">Create</Button>
            </Form>
        </Container>
    );
};

export default CreateProject;
