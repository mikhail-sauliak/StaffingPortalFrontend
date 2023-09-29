import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container } from 'react-bootstrap';

const EditProject = ({ projectId, onProjectUpdated }) => { 
    const [projectData, setProjectData] = useState({
        name: '',
        techStack: '',
        startDate: '',
        endDate: '',
        comments: '',
        search: 'Draft',
        signed: false,
        positionSigned: '',
        positionClosed: '',
        location: '',
        stream: '',
        level: 'Intern',
        priority: 'Low',
        attachment: null,
        candidateIds: [] // Initialize candidateIds as an empty array
    });

    useEffect(() => {
        axios.get(`https://localhost:7047/api/projects/${projectId}`)
            .then(response => {
                const data = response.data;
                // Handle possibly null or undefined fields
                data.comments = data.comments || '';
                data.attachment = data.attachment || null;
                data.candidateIds = data.candidateIds || [];
                setProjectData(data);
            })
            .catch(error => {
                console.error('There was an error fetching project data!', error);
            });
    }, [projectId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProjectData({ ...projectData, [name]: value });
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setProjectData({ ...projectData, [name]: checked });
    };

    const handleFileChange = (event) => {
        setProjectData({ ...projectData, attachment: event.target.files[0] });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const formData = new FormData();
        Object.keys(projectData).forEach(key => {
            const value = projectData[key];
            if (value != null && value !== '') { // Check for null or empty string
                if (key === 'attachment') {
                    formData.append(key, value);
                } else if (key === 'candidateIds' && Array.isArray(value)) {
                    value.forEach(id => formData.append('CandidateIds', id));
                } else {
                    formData.append(key, value);
                }
            }
        });

        axios.put(`https://localhost:7047/api/projects/${projectId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Set content type as multipart/form-data
            },
        })
        .then(response => {
            onProjectUpdated(response.data);
        })
        .catch(error => {
            console.error('There was an error updating the project!', error);
        });
    };

    return (
        <Container>
            <h2>Edit Project</h2>
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

                <Form.Group controlId="comments">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control type="text" name="comments" value={projectData.comments} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="search">
                    <Form.Label>Search</Form.Label>
                    <Form.Control as="select" name="search" value={projectData.search} onChange={handleInputChange}>
                        <option value="Active">Active</option>
                        <option value="Cold">Cold</option>
                        <option value="Draft">Draft</option>
                        <option value="Active Internal">Active Internal</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="signed">
                    <Form.Label>Signed</Form.Label>
                    <Form.Check type="checkbox" name="signed" checked={projectData.signed} onChange={handleCheckboxChange} />
                </Form.Group>

                <Form.Group controlId="positionSigned">
                    <Form.Label>Position Signed</Form.Label>
                    <Form.Control type="datetime-local" name="positionSigned" value={projectData.positionSigned} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="positionClosed">
                    <Form.Label>Position Closed</Form.Label>
                    <Form.Control type="datetime-local" name="positionClosed" value={projectData.positionClosed} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="location">
                    <Form.Label>Location</Form.Label>
                    <Form.Control type="text" name="location" value={projectData.location} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="stream">
                    <Form.Label>Stream</Form.Label>
                    <Form.Control as="select" name="stream" value={projectData.stream} onChange={handleInputChange}>
                        <option value="">Select Stream</option>
                        <option value="QA">QA</option>
                        <option value="SDET">SDET</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="level">
                    <Form.Label>Level</Form.Label>
                    <Form.Control as="select" name="level" value={projectData.level} onChange={handleInputChange}>
                        <option value="Intern">Intern</option>
                        <option value="Junior">Junior</option>
                        <option value="Middle">Middle</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Principal">Principal</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="priority">
                    <Form.Label>Priority</Form.Label>
                    <Form.Control as="select" name="priority" value={projectData.priority} onChange={handleInputChange}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="attachment">
                    <Form.Label>Attachment</Form.Label>
                    <Form.Control type="file" name="attachment" onChange={handleFileChange} />
                </Form.Group>

                <Button variant="primary" type="submit">Save Changes</Button>
            </Form>
        </Container>
    );
};

export default EditProject;
