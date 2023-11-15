import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col  } from 'react-bootstrap';
import Select from 'react-select';
import { apiWithAuth } from '../utils/api.js';
import '../styles/styles.css'; 

const techStackOptions = [
    { value: 'C#', label: 'C#' },
    { value: 'Java', label: 'Java' },
    { value: 'Python', label: 'Python' },
    { value: 'PHP', label: 'PHP' },
    { value: 'JS', label: 'JS' },
];

const streamOptions = [
    { value: 'QA', label: 'QA' },
    { value: 'SDET', label: 'SDET' },
];

const levelOptions = [
    { value: 'Junior', label: 'Junior' },
    { value: 'Middle', label: 'Middle' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Lead', label: 'Lead' },
    { value: 'Principle', label: 'Principle' },
];

const CreateManager = () => {
    const [newManager, setNewManager] = useState({
        firstName: '',
        lastName: '',
        location: '',
        divisionManagerId: null,
        talentManagerId: null,
        availableFrom: '',
        techStack: '',
        stream: '',
        level: '',
        role: ''
    });

    const [divisionManagers, setDivisionManagers] = useState([]);
    const [talentManagers, setTalentManagers] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            const divisionManagersResponse = await apiWithAuth.get('administration/division-managers');
            setDivisionManagers(divisionManagersResponse.data.$values); 
        
            const talentManagersResponse = await apiWithAuth.get('administration/talent-managers');
            setTalentManagers(talentManagersResponse.data.$values);
        } catch (error) {
            console.error('There was an error fetching managers!', error);
            setError('Failed to fetch managers.');
        }
    };

    const updateTalentManagersList = (divisionManagerId) => {
        console.log('Updating talent managers for division manager ID:', divisionManagerId); 
        apiWithAuth.get(`administration/division-manager/${divisionManagerId}/talent-managers`)
            .then(response => {
                setTalentManagers(response.data.$values); 
            })
            .catch(error => {
                console.error('Error fetching managed talent managers:', error);
                setError('Failed to fetch talent managers for the selected division manager.');
            });        
    };

    function splitUsername(username) {
        const splitName = username.replace(/([A-Z])/g, ' $1').trim();
        const nameParts = splitName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        return { firstName, lastName };
      }

    const handleTechStackChange = (selectedOptions) => {
        const techStackString = selectedOptions.map(option => option.value).join(',');
        setNewManager({ ...newManager, techStack: techStackString });
    };

    const handleStreamChange = (selectedOption) => {
        setNewManager({ ...newManager, stream: selectedOption.value });
    };

    const handleLevelChange = (selectedOption) => {
        setNewManager({ ...newManager, level: selectedOption.value });
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        console.log(`Handling form change for ${name} with value ${value}`);
        console.log('Current manager state before update:', newManager);
    
        setNewManager(prevState => {
            const updatedManager = { ...prevState, [name]: value };
            console.log('Updated manager state:', updatedManager);
            return updatedManager;
        });

        if (name === 'divisionManagerId') {
            console.log('Updating talent managers list for division manager ID:', value);
            updateTalentManagersList(value);
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setSubmitted(true);
        console.log('Submitting form with data:', newManager);

        if (!isFormValid()) {
            setError('Please fill in all required fields.');
            return;
        }

        setError(null);
        try {
            // Create a new Person
            const personData = {
                ...newManager,
                TMAware: 'Not',
                Division: newManager.stream,
            };
            const response = await apiWithAuth.post('people', personData);
            const createdPerson = response.data;

            // Create a new User
            const username = `${newManager.firstName}${newManager.lastName}`;
            const userDto = {
                Username: username,
                Role: newManager.role,
                Stream: newManager.stream,
                PersonId: createdPerson.id,
                Password: 'Test1234',  // Default password
                Division: createdPerson.stream,
                ManagedBy: newManager.talentManagerId,

            };
            await apiWithAuth.post('User/create', userDto);
            setSuccessMessage('User created successfully!');
            setNewManager(initialManagerState);
            setSubmitted(false);
        } catch (error) {
            setError('There was an error creating the user!');
        }
    };

    const isFormValid = () => {
        return Object.values(newManager).every(value => value);
    };

    const customStyles = {
        control: (base, state) => ({
            ...base,
            border: state.isFocused ? '1px solid #007BFF' : '1px solid #ced4da',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : 'none',
            '&:hover': {
                border: '1px solid #007BFF'
            }
        })
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <div className="form-section">
                        <h2>Create Manager</h2>
                        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                        {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}
                        <Form onSubmit={handleFormSubmit}>
                            <Form.Group className="mb-3" controlId="formFirstName">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter first name" name="firstName" onChange={handleFormChange} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formLastName">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter last name" name="lastName" onChange={handleFormChange} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formLocation">
                                <Form.Label>Location</Form.Label>
                                <Form.Control type="text" placeholder="Enter location" name="location" onChange={handleFormChange} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formDivisionManagerId">
                                <Form.Label>Division Manager</Form.Label>
                                <Form.Control as="select" name="divisionManagerId" onChange={handleFormChange}>
                                    <option value="">Select Division Manager</option>
                                        {divisionManagers && divisionManagers.map(manager => {
                                        const { firstName, lastName } = splitUsername(manager.username);
                                        return (
                                            <option key={manager.id} value={manager.id}>
                                                {`${firstName} ${lastName}`}
                                            </option>
                                        );                            
                                    })}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formTalentManagerId">
                                <Form.Label>Talent Manager</Form.Label>
                                <Form.Control as="select" name="talentManagerId" onChange={handleFormChange}>
                                    <option value="">Select Talent Manager</option>
                                    {talentManagers && talentManagers.map(manager => {
                                        const { firstName, lastName } = splitUsername(manager.username);
                                        return (
                                            <option key={manager.id} value={manager.id}>
                                                {`${firstName} ${lastName}`}
                                            </option>
                                        );
                                    })}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formAvailableFrom">
                                <Form.Label>Available From</Form.Label>
                                <Form.Control type="date" name="availableFrom" onChange={handleFormChange} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formTechStack">
                                <Form.Label>Tech Stack</Form.Label>
                                <Select 
                                    isMulti 
                                    options={techStackOptions} 
                                    onChange={handleTechStackChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formStream">
                                <Form.Label>Stream</Form.Label>
                                <Select 
                                    options={streamOptions} 
                                    onChange={handleStreamChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formLevel">
                                <Form.Label>Level</Form.Label>
                                <Select 
                                    options={levelOptions} 
                                    onChange={handleLevelChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formRole">
                                <Form.Label>Role</Form.Label>
                                <Form.Control as="select" name="role" onChange={handleFormChange}>
                                    <option value="">Select role</option>
                                    <option value="Talent Manager">Talent Manager</option>
                                    <option value="Division Manager">Division Manager</option>
                                </Form.Control>
                            </Form.Group>
                            <Button variant="primary" type="submit" className="mt-3">
                                        Submit
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

const initialManagerState = {
    firstName: '',
    lastName: '',
    location: '',
    divisionManagerId: null,
    talentManagerId: null,
    availableFrom: '',
    techStack: '',
    stream: '',
    level: '',
    role: ''
};

export default CreateManager;
