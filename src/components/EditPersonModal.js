import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../utils/api.js';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';

const roleOptions = [
    { value: 'Employee', label: 'Employee' },
    { value: 'Division Manager', label: 'Division Manager' },
    { value: 'Talent Manager', label: 'Talent Manager' },
];

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

const EditPersonModal = ({ person, onClose, onSave }) => {
    const [editedPerson, setEditedPerson] = useState({ ...person });
    const [divisionManagers, setDivisionManagers] = useState([]);
    const [talentManagers, setTalentManagers] = useState([]);

    useEffect(() => {
        setEditedPerson({ ...person });
        fetchManagers();
    }, [person]);

    const fetchManagers = async () => {
        try {
            const response = await apiWithAuth.get('User');
            const managerResponses = await Promise.all(
                response.data
                    .filter(user => user.role === 'DivisionManager' || user.role === 'TalentManager')
                    .map(async manager => {
                        const personResponse = await apiWithAuth.get(`people/${manager.personId}`);
                        return {
                            ...manager,
                            ...personResponse.data,
                        };
                    })
            );
            setDivisionManagers(managerResponses.filter(manager => manager.role === 'DivisionManager'));
            setTalentManagers(managerResponses.filter(manager => manager.role === 'TalentManager' || manager.role === 'DivisionManager'));
        } catch (error) {
            console.error('There was an error fetching managers!', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setEditedPerson({ ...editedPerson, [name]: value });
    };

    const handleSelectChange = (name, selectedOption) => {
        setEditedPerson({ ...editedPerson, [name]: selectedOption ? selectedOption.value : '' });
    };

    const handleSave = () => {
        onSave(editedPerson);
    };

    

    return (
        <Modal show onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Person</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter first name"
                            name="firstName"
                            value={editedPerson.firstName}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter last name"
                            name="lastName"
                            value={editedPerson.lastName}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formRole">
                        <Form.Label>Role</Form.Label>
                        <Select 
                            options={roleOptions} 
                            value={roleOptions.find(option => option.value === editedPerson.role)}
                            onChange={(selectedOption) => handleSelectChange('role', selectedOption)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formDivisionManager">
                        <Form.Label>Division Manager</Form.Label>
                        <Select
                            options={divisionManagers.map(manager => ({ value: manager.personId, label: `${manager.firstName} ${manager.lastName}` }))}
                            value={divisionManagers.find(manager => manager.personId === editedPerson.divisionManagerId)}
                            onChange={(selectedOption) => handleSelectChange('divisionManagerId', selectedOption)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formTalentManager">
                        <Form.Label>Talent Manager</Form.Label>
                        <Select
                            options={talentManagers.map(manager => ({ value: manager.personId, label: `${manager.firstName} ${manager.lastName}` }))}
                            value={talentManagers.find(manager => manager.personId === editedPerson.talentManagerId)}
                            onChange={(selectedOption) => handleSelectChange('talentManagerId', selectedOption)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formAvailableFrom">
                        <Form.Label>Available From</Form.Label>
                        <Form.Control
                            type="date"
                            name="availableFrom"
                            value={editedPerson.availableFrom}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formTechStack">
                        <Form.Label>Tech Stack</Form.Label>
                        <Select
                            isMulti
                            options={techStackOptions}
                            value={techStackOptions.filter(option => editedPerson.techStack.split(',').includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange('techStack', selectedOptions.map(option => option.value).join(','))}
                        />
                    </Form.Group>
                    <Form.Group controlId="formStream">
                        <Form.Label>Stream</Form.Label>
                        <Select
                            options={streamOptions}
                            value={streamOptions.find(option => option.value === editedPerson.stream)}
                            onChange={(selectedOption) => handleSelectChange('stream', selectedOption)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formLevel">
                        <Form.Label>Level</Form.Label>
                        <Select
                            options={levelOptions}
                            value={levelOptions.find(option => option.value === editedPerson.level)}
                            onChange={(selectedOption) => handleSelectChange('level', selectedOption)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditPersonModal;
