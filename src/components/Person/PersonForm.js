// PersonForm.js
import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import {
  techStackOptions,
  streamOptions,
  levelOptions,
  userRoleOptions
} from '../hooks/selectOptions';

const PersonForm = ({
  formData,
  setFormData,
  divisionManagers,
  talentManagers,
  updateTalentManagersList,
  handleSubmit,
  handleInputChange,
  handleSelectChange,
  handleTechStackChange,
  projects,
  peopleOptions
}) => {
  const handleDivisionManagerChange = (selectedOption) => {
    if (!selectedOption) {
      setFormData((prev) => ({ ...prev, divisionManagerId: null, talentManagerId: null }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      divisionManagerId: selectedOption.value,
      talentManagerId: null
    }));

    updateTalentManagersList(selectedOption.value);
  };

  const selectedTalentAssignments = (formData.talentManagerAssignments || [])
    .map((value) => peopleOptions.find((option) => option.value === value))
    .filter(Boolean);

  const selectedDivisionAssignments = (formData.divisionManagerAssignments || [])
    .map((value) => peopleOptions.find((option) => option.value === value))
    .filter(Boolean);

  const plannedAssignments = projects.filter((project) =>
    (formData.plannedAssignment || []).includes(project.value)
  );

  const techStackSelected = techStackOptions.filter((option) =>
    (formData.techStack || []).includes(option.value)
  );

  const assignmentExistsInGCPChecked = Boolean(
    formData.assignmentExistsInGCP === 'Yes' || formData.assignmentExistsInGCP === true
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formFirstName" className="mb-3">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          name="firstName"
          value={formData.firstName || ''}
          onChange={handleInputChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="lastName" className="mb-3">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          name="lastName"
          value={formData.lastName || ''}
          onChange={handleInputChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="stream" className="mb-3">
        <Form.Label>Stream</Form.Label>
        <Select
          options={streamOptions}
          name="stream"
          value={streamOptions.find((option) => option.value === formData.stream) || null}
          onChange={(selectedOption) => handleSelectChange('stream', selectedOption)}
          placeholder="Select stream"
        />
      </Form.Group>

      <Form.Group controlId="location" className="mb-3">
        <Form.Label>Location</Form.Label>
        <Form.Control
          type="text"
          name="location"
          value={formData.location || ''}
          onChange={handleInputChange}
        />
      </Form.Group>

      <Form.Group controlId="divisionManager" className="mb-3">
        <Form.Label>Division Manager</Form.Label>
        <Select
          options={divisionManagers}
          value={divisionManagers.find((manager) => manager.value === formData.divisionManagerId) || null}
          onChange={handleDivisionManagerChange}
          placeholder="Select division manager"
        />
      </Form.Group>

      <Form.Group controlId="talentManager" className="mb-3">
        <Form.Label>Talent Manager</Form.Label>
        <Select
          options={talentManagers}
          value={talentManagers.find((manager) => manager.value === formData.talentManagerId) || null}
          onChange={(selectedOption) => handleSelectChange('talentManager', selectedOption)}
          placeholder="Select talent manager"
        />
      </Form.Group>

      <Form.Group controlId="availableFrom" className="mb-3">
        <Form.Label>Available From</Form.Label>
        <Form.Control
          type="date"
          name="availableFrom"
          value={formData.availableFrom || ''}
          onChange={handleInputChange}
        />
      </Form.Group>

      <Form.Group controlId="tmAware" className="mb-3">
        <Form.Label>TM Aware</Form.Label>
        <div>
          {['Not', 'Notified', 'Approves'].map((value) => (
            <Form.Check
              inline
              key={value}
              type="radio"
              label={value}
              name="tmAware"
              value={value}
              checked={formData.tmAware === value}
              onChange={handleInputChange}
            />
          ))}
        </div>
      </Form.Group>

      <Form.Group controlId="level" className="mb-3">
        <Form.Label>Level</Form.Label>
        <Select
          options={levelOptions}
          name="level"
          value={levelOptions.find((option) => option.value === formData.level) || null}
          onChange={(selectedOption) => handleSelectChange('level', selectedOption)}
          placeholder="Select level"
        />
      </Form.Group>

      <Form.Group controlId="assignmentExistsInGCP" className="mb-3">
        <Form.Check
          type="checkbox"
          label="Assignment exists in GCP"
          name="assignmentExistsInGCP"
          checked={assignmentExistsInGCPChecked}
          onChange={(event) =>
            handleInputChange({
              target: {
                name: 'assignmentExistsInGCP',
                value: event.target.checked ? 'Yes' : 'No'
              }
            })
          }
        />
      </Form.Group>

      <Form.Group controlId="techStack" className="mb-3">
        <Form.Label>Tech Stack</Form.Label>
        <Select
          isMulti
          options={techStackOptions}
          name="techStack"
          value={techStackSelected}
          onChange={handleTechStackChange}
          placeholder="Select technologies"
        />
      </Form.Group>

      <Form.Group controlId="plannedAssignment" className="mb-3">
        <Form.Label>Planned Assignment</Form.Label>
        <Select
          isMulti
          options={projects}
          name="plannedAssignment"
          value={plannedAssignments}
          onChange={(selectedOption) => handleSelectChange('plannedAssignment', selectedOption || [])}
          placeholder="Select planned assignments"
        />
      </Form.Group>

      <Form.Group controlId="comments" className="mb-3">
        <Form.Label>Comments</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="comments"
          value={formData.comments || ''}
          onChange={handleInputChange}
        />
      </Form.Group>

      <hr />

      <Form.Group controlId="createUser" className="mb-3">
        <Form.Check
          type="checkbox"
          label="Create user account"
          name="createUser"
          checked={Boolean(formData.createUser)}
          onChange={handleInputChange}
        />
      </Form.Group>

      {formData.createUser && (
        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Form.Group controlId="userUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="userUsername"
                value={formData.userUsername || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="userPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="userPassword"
                value={formData.userPassword || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="userRole">
              <Form.Label>Role</Form.Label>
              <Select
                options={userRoleOptions}
                name="userRole"
                value={userRoleOptions.find((option) => option.value === formData.userRole) || null}
                onChange={(selectedOption) => handleSelectChange('userRole', selectedOption)}
                placeholder="Select role"
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="userStream">
              <Form.Label>User Stream</Form.Label>
              <Select
                options={streamOptions}
                name="userStream"
                value={streamOptions.find((option) => option.value === (formData.userStream || formData.stream)) || null}
                onChange={(selectedOption) => handleSelectChange('userStream', selectedOption)}
                placeholder="Select stream"
              />
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group controlId="userManager">
              <Form.Label>Manager (optional)</Form.Label>
              <Select
                isClearable
                options={peopleOptions}
                name="userManager"
                value={peopleOptions.find((option) => option.value === formData.userManagerPersonId) || null}
                onChange={(selectedOption) => handleSelectChange('userManager', selectedOption)}
                placeholder="Select manager"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <hr />

      <Form.Group controlId="createSalaryReview" className="mb-3">
        <Form.Check
          type="checkbox"
          label="Add initial salary review"
          name="createSalaryReview"
          checked={Boolean(formData.createSalaryReview)}
          onChange={handleInputChange}
        />
      </Form.Group>

      {formData.createSalaryReview && (
        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewReviewDate">
              <Form.Label>Review Date</Form.Label>
              <Form.Control
                type="date"
                name="salaryReviewReviewDate"
                value={formData.salaryReviewReviewDate || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewNewSalaryStartDate">
              <Form.Label>New Salary Start Date</Form.Label>
              <Form.Control
                type="date"
                name="salaryReviewNewSalaryStartDate"
                value={formData.salaryReviewNewSalaryStartDate || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewOldSalary">
              <Form.Label>Current Salary</Form.Label>
              <Form.Control
                type="number"
                name="salaryReviewOldSalary"
                value={formData.salaryReviewOldSalary || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewProposedSalary">
              <Form.Label>Proposed Salary</Form.Label>
              <Form.Control
                type="number"
                name="salaryReviewProposedSalary"
                value={formData.salaryReviewProposedSalary || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewCurrency">
              <Form.Label>Currency</Form.Label>
              <Form.Control
                type="text"
                name="salaryReviewCurrency"
                value={formData.salaryReviewCurrency || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewContractType">
              <Form.Label>Contract Type</Form.Label>
              <Form.Control
                type="text"
                name="salaryReviewContractType"
                value={formData.salaryReviewContractType || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={12} className="mb-3">
            <Form.Group controlId="salaryReviewJustification">
              <Form.Label>Justification</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="salaryReviewJustification"
                value={formData.salaryReviewJustification || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={12} className="mb-3">
            <Form.Group controlId="salaryReviewDivisionManagerComments">
              <Form.Label>Division Manager Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="salaryReviewDivisionManagerComments"
                value={formData.salaryReviewDivisionManagerComments || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={12} className="mb-3">
            <Form.Group controlId="salaryReviewTalentManagerComments">
              <Form.Label>Talent Manager Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="salaryReviewTalentManagerComments"
                value={formData.salaryReviewTalentManagerComments || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewSalaryReceivedDate">
              <Form.Label>Salary Received Date</Form.Label>
              <Form.Control
                type="date"
                name="salaryReviewSalaryReceivedDate"
                value={formData.salaryReviewSalaryReceivedDate || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewReviewResult">
              <Form.Label>Review Result</Form.Label>
              <Form.Control
                type="text"
                name="salaryReviewReviewResult"
                value={formData.salaryReviewReviewResult || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewIsApproved">
              <Form.Check
                type="checkbox"
                label="Approved"
                name="salaryReviewIsApproved"
                checked={Boolean(formData.salaryReviewIsApproved)}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group controlId="salaryReviewApprovedByDivisionManager">
              <Form.Check
                type="checkbox"
                label="Approved by Division Manager"
                name="salaryReviewApprovedByDivisionManager"
                checked={Boolean(formData.salaryReviewApprovedByDivisionManager)}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <hr />

      <Form.Group controlId="talentManagerAssignments" className="mb-3">
        <Form.Label>Assign people as Talent Manager</Form.Label>
        <Select
          isMulti
          options={peopleOptions}
          name="talentManagerAssignments"
          value={selectedTalentAssignments}
          onChange={(selectedOption) => handleSelectChange('talentManagerAssignments', selectedOption)}
          placeholder="Select people"
        />
      </Form.Group>

      <Form.Group controlId="divisionManagerAssignments" className="mb-4">
        <Form.Label>Assign people as Division Manager</Form.Label>
        <Select
          isMulti
          options={peopleOptions}
          name="divisionManagerAssignments"
          value={selectedDivisionAssignments}
          onChange={(selectedOption) => handleSelectChange('divisionManagerAssignments', selectedOption)}
          placeholder="Select people"
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Save Changes
      </Button>
    </Form>
  );
};

export default PersonForm;