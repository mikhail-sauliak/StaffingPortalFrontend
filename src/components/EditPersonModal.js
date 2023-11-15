import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Select from 'react-select';
import useFetchManagers from './hooks/useFetchManagers';
import { techStackOptions, streamOptions, levelOptions } from './hooks/selectOptions';
import useFormInput from './hooks/useFormInput';

const EditPersonModal = ({ person, onClose, onSave }) => {
  const [formData, handleInputChange, setFormData] = useFormInput(person);
  const [divisionManagers, talentManagers] = useFetchManagers();

  const handleSelectChange = (field, selectedOption) => {
    setFormData({ ...formData, [field]: selectedOption ? selectedOption.value : '' });
  };

  const handleSave = () => {
    onSave(formData);
  };

    return (
        <Modal show={true} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Person</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control 
                            type="text"
                            name="firstName" 
                            value={formData.firstName}
                            onChange={handleInputChange} 
                        />
                    </Form.Group>

                    <Form.Group controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="lastName" 
                            value={formData.lastName}
                            onChange={handleInputChange} 
                        />
                    </Form.Group>

                    <Form.Group controlId="formLocation">
                        <Form.Label>Location</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="location" 
                            value={formData.location}
                            onChange={handleInputChange} 
                        />
                    </Form.Group>

                    <Form.Group controlId="formDivisionManager">
                        <Form.Label>Division Manager</Form.Label>
                        <Select
                            options={divisionManagers}
                            value={divisionManagers.find(manager => manager.value === formData.divisionManagerId)}
                            onChange={(selectedOption) => handleSelectChange('divisionManagerId', selectedOption)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formTalentManager">
                        <Form.Label>Talent Manager</Form.Label>
                        <Select
                            options={talentManagers}
                            value={talentManagers.find(manager => manager.value === formData.talentManagerId)}
                            onChange={(selectedOption) => handleSelectChange('talentManagerId', selectedOption)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formAvailableFrom">
                        <Form.Label>Available From</Form.Label>
                        <Form.Control 
                            type="date" 
                            name="availableFrom" 
                            value={formData.availableFrom}
                            onChange={handleInputChange} 
                        />
                    </Form.Group>
                    <Form.Group controlId="formTechStack">
                        <Form.Label>Tech Stack</Form.Label>
                        <Select
                            isMulti
                            options={techStackOptions}
                            value={techStackOptions.filter(option => formData.techStack.split(',').includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange('techStack', selectedOptions.map(option => option.value).join(','))}
                        />
                    </Form.Group>
                    <Form.Group controlId="formStream">
                        <Form.Label>Stream</Form.Label>
                        <Select
                            options={streamOptions}
                            value={streamOptions.find(option => option.value === formData.stream)}
                            onChange={(selectedOption) => handleSelectChange('stream', selectedOption)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formLevel">
                        <Form.Label>Level</Form.Label>
                        <Select
                            options={levelOptions}
                            value={levelOptions.find(option => option.value === formData.level)}
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
