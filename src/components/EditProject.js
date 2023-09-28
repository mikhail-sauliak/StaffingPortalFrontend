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

    const [candidates, setCandidates] = useState([]); // state to store candidates
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    useEffect(() => {
        axios.get(`https://localhost:7047/api/projects/${projectId}`)
            .then(response => {
                setProjectData(response.data);
                setSelectedCandidates(response.data.candidates.map(c => c.id));
            })
            .catch(error => {
                console.error('There was an error fetching project data!', error);
            });
    
        axios.get('https://localhost:7047/api/people')
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

    const handleToggleCandidate = (candidateId) => {
        if (selectedCandidates.includes(candidateId)) {
            setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
        } else {
            setSelectedCandidates([...selectedCandidates, candidateId]);
        }
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

    const getCompatibilityStatus = (projectTechStack, candidateTechStack) => {
        const projectStack = projectTechStack.split(',').map(s => s.trim().toLowerCase());
        const candidateStack = candidateTechStack.split(',').map(s => s.trim().toLowerCase());
    
        const intersection = projectStack.filter(stack => candidateStack.includes(stack));
    
        if (intersection.length === projectStack.length) return 'green';
        if (intersection.length > 0) return 'yellow';
        return 'transparent';
    };

    const getClosestAvailableCandidateId = () => {
        let closestDateDiff = Infinity; // init dates difference
        let closestCandidateId = null; // init ID of the candidate
        
        const startDate = new Date(projectData.startDate);
        
        candidates.forEach(candidate => {
            const availableFromDate = new Date(candidate.availableFrom);
            const dateDiff = Math.abs(startDate - availableFromDate);
            
            if (dateDiff < closestDateDiff) {
                closestDateDiff = dateDiff;
                closestCandidateId = candidate.id;
            }
        });
        
        return closestCandidateId;
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
                    <Form.Control 
                        as="div" 
                        style={{ maxHeight: '125px', overflowY: 'auto', resize: 'vertical', border: '1px solid #ced4da', borderRadius: '4px', padding: '5px' }}
                    >
                        {candidates.map(candidate => {
                        const isClosestAvailable = candidate.id === getClosestAvailableCandidateId();
                        const compatibilityStatus = getCompatibilityStatus(projectData.techStack, candidate.techStack);

                        return (
                            <div 
                                key={candidate.id} 
                                style={{ 
                                    backgroundColor: selectedCandidates.includes(candidate.id) ? 'lightblue' : compatibilityStatus,
                                    color: isClosestAvailable ? 'red' : 'black',
                                    padding: '5px' 
                                }}
                            >
                                <input 
                                    type="checkbox" 
                                    value={candidate.id}
                                    checked={selectedCandidates.includes(candidate.id)}
                                    onChange={() => handleToggleCandidate(candidate.id)}
                                />
                                {candidate.firstName} {candidate.lastName}
                            </div>
                        );
                    })}
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
