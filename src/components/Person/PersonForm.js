// PersonForm.js
import React from 'react';
import { Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import { techStackOptions, streamOptions, levelOptions } from '../hooks/selectOptions';

const PersonForm = ({
    formData,
    setFormData, 
    divisionManagers,
    talentManagers,
    updateTalentManagersList,
    handleSubmit,
    handleInputChange, 
    handleSelectChange,
    handleTechStackChange
  }) => {
    
    const handleDivisionManagerChange = (selectedOption) => {
        if (selectedOption) {
          setFormData({ ...formData, divisionManagerId: selectedOption.value });
          updateTalentManagersList(selectedOption.value);
        } else {
          setFormData({ ...formData, divisionManagerId: null });
        }
      };

    return (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName}
                  onChange={handleInputChange} 
              />
          </Form.Group>
  
          <Form.Group controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
          </Form.Group>
  
          <Form.Group controlId="stream">
            <Form.Label>Stream</Form.Label>
            <Select
                options={streamOptions}
                name="stream"
                value={streamOptions.find(option => option.value === formData.stream)}
                onChange={(selectedOption) => handleSelectChange('stream', selectedOption)}
            />
          </Form.Group>
  
          <Form.Group controlId="location">
            <Form.Label>Location</Form.Label>
            <Form.Control type="text" name="location" value={formData.location} onChange={handleInputChange} />
          </Form.Group>
  
          <Form.Group controlId="divisionManager">
            <Form.Label>Division Manager</Form.Label>
            <Select
                options={divisionManagers}
                value={divisionManagers.find(manager => manager.value === formData.divisionManager)}
                onChange={handleDivisionManagerChange}
            />
            </Form.Group>

        <Form.Group controlId="talentManager">
        <Form.Label>Talent Manager</Form.Label>
        <Select
            options={talentManagers}
            value={talentManagers.find(manager => manager.value === formData.talentManager)}
            onChange={(selectedOption) => handleSelectChange( 'talentManager', selectedOption )}
        />
        </Form.Group>

        <Form.Group controlId="availableFrom">
        <Form.Label>Available From</Form.Label>
        <Form.Control type="date" name="availableFrom" value={formData.availableFrom} onChange={handleInputChange} />
        </Form.Group>

        <Form.Group controlId="tmAware">
        <Form.Label>TM Aware</Form.Label>
        {['Not', 'Notified', 'Approves'].map(value => (
            <Form.Check 
            type="radio"
            label={value}
            name="tmAware"
            value={value}
            checked={formData.tmAware === value}
            onChange={handleInputChange}
            />
        ))}
        </Form.Group>

        <Form.Group controlId="level">
            <Form.Label>Level</Form.Label>
            <Select
                options={levelOptions}
                name="level"
                value={levelOptions.find(option => option.value === formData.level)}
                onChange={(selectedOption) => handleSelectChange('level', selectedOption)}
            />
        </Form.Group>

        <Form.Group controlId="assignmentExistsInGCP">
            <Form.Label>Assignment Exists in GCP</Form.Label>
            <Form.Check 
                type="checkbox"
                label="Yes"
                name="assignmentExistsInGCP"
                checked={formData.assignmentExistsInGCP === 'Yes' || formData.assignmentExistsInGCP === true}
                onChange={(e) => handleInputChange({
                target: { 
                    name: 'assignmentExistsInGCP', 
                    value: e.target.checked ? 'Yes' : 'No'
                }
                })} 
            />
        </Form.Group>

        <Form.Group controlId="techStack">
            <Form.Label>Tech Stack</Form.Label>
            <Select
                isMulti
                options={techStackOptions}
                name="techStack"
                value={techStackOptions.filter(option => formData.techStack.includes(option.value))}
                onChange={handleTechStackChange}
            />
        </Form.Group>
        
        <Form.Group controlId="plannedAssignment">
            <Form.Label>Planned Assignment</Form.Label>
            <Form.Control type="text" name="plannedAssignment" value={formData.plannedAssignment} readOnly />
        </Form.Group>

        <Form.Group controlId="comments">
            <Form.Label>Comments</Form.Label>
            <Form.Control type="text" name="comments" value={formData.comments} onChange={handleInputChange} />
        </Form.Group>

             <Button variant="primary" type="submit">Save Changes</Button>
        </Form>
    );
  };

export default PersonForm;
