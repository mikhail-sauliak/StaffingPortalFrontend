import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container } from 'react-bootstrap';

    const EditProject = ({ projectId, onProjectUpdated }) => {
    const [projectData, setProjectData] = useState({
        name: '',
        techStack: '',
        startDate: '',
        endDate: '',
        candidate: '',
        comments: ''
    });

    const [candidates, setCandidates] = useState([]); // состояние для хранения кандидатов
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    useEffect(() => {
        // Загрузка данных проекта
        axios.get(`https://localhost:7047/api/projects/${projectId}`)
        .then(response => {
            setProjectData(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching project data!', error);
        });

        // Загрузка списка кандидатов
        axios.get('https://localhost:7047/api/people') // Убедитесь, что URL корректен
        .then(response => {
            setCandidates(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching candidates data!', error);
        });
    }, [projectId]);

    const handleCandidateChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => parseInt(option.value));
        setSelectedCandidates(selectedOptions);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setProjectData({ ...projectData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    
        const updatedProjectData = {
        ...projectData,
        CandidateIds: selectedCandidates
        };
    
        axios.put(`https://localhost:7047/api/projects/${projectId}`, updatedProjectData)
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

                <Form.Group controlId="candidate">
                <Form.Label>Candidates</Form.Label>
                <Form.Control as="select" multiple onChange={handleCandidateChange}>
                    {candidates.map(candidate => (
                    <option key={candidate.id} value={candidate.id}>
                        {candidate.firstName} {candidate.lastName}
                    </option>
                    ))}
                </Form.Control>
                </Form.Group>

                <Form.Group controlId="comments">
                <Form.Label>Comments</Form.Label>
                <Form.Control type="text" name="comments" value={projectData.comments} onChange={handleInputChange} />
                </Form.Group>

                <Button variant="primary" type="submit">Save Changes</Button>
            </Form>
        </Container>
    );
};

export default EditProject;
