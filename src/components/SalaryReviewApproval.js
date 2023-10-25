import React, { useEffect, useState } from 'react';
import { apiWithAuth } from '../utils/api.js';
import { Container, Table, Button, FormControl } from 'react-bootstrap';
import { format } from 'date-fns';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SalaryReviewApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [editedFields, setEditedFields] = useState({});

  const fetchRequests = async () => {
    try {
        const response = await apiWithAuth.get('http://localhost:5297/api/salaryreviewrequests');
        const responsePeople = await apiWithAuth.get('http://localhost:5297/api/people');
        const requestData = response.data;
        setRequests(requestData);
        setPeople(responsePeople.data);
        setLoading(false);
        // Initialize editedFields with the values from the requests
        const initialEditedFields = requestData.reduce((acc, request) => {
          acc[request.id] = {
            currency: request.currency,
            contractType: request.contractType,
            proposedSalary: request.proposedSalary,
            divisionManagerComments: request.divisionManagerComments
          };
          return acc;
        }, {});
        setEditedFields(initialEditedFields);
      } catch (error) {
        console.error("Error fetching the salary review requests", error);
      }
    };
  
  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFieldChange = (requestId, field, value) => {
    setEditedFields({
      ...editedFields,
      [requestId]: {
        ...editedFields[requestId],
        [field]: value
      }
    });
  };

  const handleSave = async (requestId, updatedFields) => {
    try {
      const payload = {
        ...updatedFields,
        currency: updatedFields.currency || requests.find(r => r.id === requestId).currency,
        contractType: updatedFields.contractType || requests.find(r => r.id === requestId).contractType,
        newSalaryStartDate: updatedFields.newSalaryStartDate || requests.find(r => r.id === requestId).newSalaryStartDate,
        salaryReceivedDate: updatedFields.salaryReceivedDate || requests.find(r => r.id === requestId).salaryReceivedDate,
        proposedSalary: updatedFields.proposedSalary || requests.find(r => r.id === requestId).proposedSalary,
        divisionManagerComments: updatedFields.divisionManagerComments || requests.find(r => r.id === requestId).divisionManagerComments,
        // ... other fields
      };
      await apiWithAuth.patch(
        `http://localhost:5297/api/salaryreviewrequests/${requestId}/updateFields`,
        payload
      );
      fetchRequests();  // Refresh the list after save
    } catch (error) {
      console.error('Error saving the updated fields:', error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await apiWithAuth.patch(`http://localhost:5297/api/salaryreviewrequests/${requestId}/approve`, { Comments: 'Approved' });
      fetchRequests();  // Refresh the list after approval
    } catch (error) {
      console.error('Error approving the request:', error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await apiWithAuth.patch(`http://localhost:5297/api/salaryreviewrequests/${requestId}/decline`, { managerComments: 'Declined' });
      fetchRequests();  // Refresh the list after decline
    } catch (error) {
      console.error('Error declining the request:', error);
    }
  };

  const handleApproveByDM = async (requestId) => {
    try {
      await apiWithAuth.patch(`http://localhost:5297/api/salaryreviewrequests/${requestId}/approveByDM`);
      fetchRequests();  // Refresh the list after approval by DM
    } catch (error) {
      console.error('Error approving by DM:', error);
    }
  };

  const renderEditableField = (requestId, field, value, type) => {
    switch (type) {
      case 'dropdown-currency':
        return (
          <DropdownButton
            id={`dropdown-${field}-${requestId}`}
            title={editedFields[requestId]?.[field] ?? value}
            onSelect={(val) => handleFieldChange(requestId, field, val)}
          >
            {['USD', 'PLN', 'EUR', 'BGN', 'AED'].map(currency => (
              <Dropdown.Item key={currency} eventKey={currency}>{currency}</Dropdown.Item>
            ))}
          </DropdownButton>
        );
      case 'dropdown-contract':
        return (
          <DropdownButton
            id={`dropdown-${field}-${requestId}`}
            title={editedFields[requestId]?.[field] ?? value}
            onSelect={(val) => handleFieldChange(requestId, field, val)}
          >
            {['B2B', 'EC'].map(contractType => (
              <Dropdown.Item key={contractType} eventKey={contractType}>{contractType}</Dropdown.Item>
            ))}
          </DropdownButton>
        );
      case 'date':
        return (
          <DatePicker
            selected={editedFields[requestId]?.[field] ? new Date(editedFields[requestId][field]) : new Date(value)}
            onChange={(date) => handleFieldChange(requestId, field, date)}
            dateFormat="dd/MM/yyyy"
          />
        );
      case 'textarea':
        return (
          <FormControl
            as="textarea"
            rows={4}
            value={editedFields[requestId]?.[field] ?? value}
            onChange={(e) => handleFieldChange(requestId, field, e.target.value)}
          />
        );
      default:
        return (
          <FormControl
            type="text"
            value={editedFields[requestId]?.[field] ?? value}
            onChange={(e) => handleFieldChange(requestId, field, e.target.value)}
          />
        );
    }
  };

  const getPersonName = (personId) => {
    const person = people.find(p => p.id === personId);
    return person ? `${person.firstName} ${person.lastName}` : 'Unknown';
  };

  const formatDateString = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      if (!isNaN(date)) {
        return format(date, 'dd/MM/yyyy');
      }
    }
    return '';
  };

  return (
    <Container fluid>
      <h2>Salary Review Approvals</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
                <tr>
                    <th>PersonId</th>
                    <th>Person Name</th>
                    <th>ReviewDate</th>
                    <th>Justification</th>
                    <th>OldSalary</th>
                    <th>ProposedSalary</th>
                    <th>Currency</th>
                    <th>ContractType</th>
                    <th>NewSalaryStartDate</th>
                    <th>SalaryReceivedDate</th>
                    <th>DivisionManagerComments</th>
                    <th>TalentManagerComments</th>
                    <th>IsApproved</th>
                </tr>
          </thead>
          <tbody>
          {requests.map(request => (
                <tr key={request.id}>
                <td>{request.personId}</td>
                <td>{getPersonName(request.personId)}</td>
                <td>{formatDateString(request.reviewDate)}</td> 
                <td>{request.justification}</td>
                <td>{renderEditableField(request.id, 'oldSalary', request.oldSalary)}</td>
                <td>{renderEditableField(request.id, 'proposedSalary', request.proposedSalary)}</td>
                <td>{renderEditableField(request.id, 'currency', request.currency, 'dropdown-currency')}</td>
                <td>{renderEditableField(request.id, 'contractType', request.contractType, 'dropdown-contract')}</td>
                <td>{renderEditableField(request.id, 'newSalaryStartDate', request.newSalaryStartDate, 'date')}</td>
                <td>{renderEditableField(request.id, 'salaryReceivedDate', request.salaryReceivedDate, 'date')}</td>
                <td>{renderEditableField(request.id, 'divisionManagerComments', request.divisionManagerComments, 'textarea')}</td>
                <td>{request.talentManagerComments}</td>
                <td>{request.isApproved ? "Yes" : "No"}</td>
                <td>
                    <Button variant="success" onClick={() => handleApprove(request.id)}>Approve</Button>
                    <Button variant="danger" onClick={() => handleDecline(request.id)}>Decline</Button>
                    <Button 
                        variant="primary" 
                        onClick={() => handleSave(request.id, editedFields[request.id])}
                    >
                        Save
                    </Button>
                    <Button variant={request.approvedByDM ? "success" : "warning"} onClick={() => handleApproveByDM(request.id)}>
                    Approved by DM
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SalaryReviewApproval;
