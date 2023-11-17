// ProjectForm.js
import React from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import Select from 'react-select';
import { techStackOptions, streamOptions, levelOptions } from '../hooks/selectOptions';

const ProjectForm = ({
    projectData,
    setProjectData,
    handleSubmit,
    handleInputChange,
    handleCheckboxChange,
    handleFileChange,
    handleTechStackChange 
}) => {

    return (
        <Container>
            <h2>{projectData.id ? 'Edit' : 'Create'} Project</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" name="name" value={projectData.name} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="techStack">
                    <Form.Label>Tech Stack</Form.Label>
                    <Select
                        isMulti
                        options={techStackOptions}
                        name="techStack"
                        value={techStackOptions.filter(option => projectData.techStack?.includes(option.value))}
                        onChange={handleTechStackChange}
                    />
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
                    <Form.Control type="date" name="positionSigned" value={projectData.positionSigned} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="positionClosed">
                    <Form.Label>Position Closed</Form.Label>
                    <Form.Control type="date" name="positionClosed" value={projectData.positionClosed} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="location">
                    <Form.Label>Location</Form.Label>
                    <Form.Control type="text" name="location" value={projectData.location} onChange={handleInputChange} />
                </Form.Group>

                <Form.Group controlId="stream">
                    <Form.Label>Stream</Form.Label>
                    <Form.Control as="select" name="stream" value={projectData.stream} onChange={handleInputChange}>
                        {streamOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="level">
                    <Form.Label>Level</Form.Label>
                    <Form.Control as="select" name="level" value={projectData.level} onChange={handleInputChange}>
                        {levelOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
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

                <Button variant="primary" type="submit">{projectData.id ? 'Save Changes' : 'Create'}</Button>
            </Form>
        </Container>
    );
};

export default ProjectForm;
