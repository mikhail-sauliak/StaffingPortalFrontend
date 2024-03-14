import React, { useEffect, useState } from 'react';
import { apiWithAuth } from '../utils/api.js';
import getUserRoleFromToken from './hooks/getUserRole.js';
import { format } from 'date-fns';
import { Container, Box, TableCell, Paper, Table, TableBody, Checkbox, TableHead, Button, TextField, MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import { StyledTableCell, StyledHeaderCell, StyledTableContainer, StyledTableRow } from '../styles/Styles.js';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Snackbar, Alert } from '@mui/material';
import MonthYearPicker from '../utils/MonthYearPicker.js';

const SalaryReviewApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState([]);
  const [editedFields, setEditedFields] = useState({});
  const [selected, setSelected] = useState([]);
  const userRole = getUserRoleFromToken();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'

  const fetchRequests = async () => {
    try {
      console.log('Fetching salary review requests');
      const response = await apiWithAuth.get('salaryreviewrequests');
      const responsePeople = await apiWithAuth.get('people');
      const requestData = response.data.$values;
      setRequests(requestData);
      setPeople(responsePeople.data.$values);
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
      console.log('Fetched salary review requests successfully');
    } catch (error) {
      console.error("Error fetching the salary review requests", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (userRole === 'TalentManager') {
    return <div>Access Denied</div>;
  }

  const handleFieldChange = (requestId, field, value) => {
    setEditedFields({
      ...editedFields,
      [requestId]: {
        ...editedFields[requestId],
        [field]: value
      }
    });
  };

  const handleSave = async (requestId) => {
    const updatedFields = editedFields[requestId];
    for (let id of selected) {
    try {
        const foundRequest = requests.find(r => r.id === id);
        if (!foundRequest) {
            console.error('Request not found');
            handleSnackbarOpen('Request not found', 'error');
            return;
        }

        const payload = {
            Currency: updatedFields.currency || foundRequest.currency,
            ContractType: updatedFields.contractType || foundRequest.contractType,
            NewSalaryStartDate: updatedFields.newSalaryStartDate || foundRequest.newSalaryStartDate,
            SalaryReceivedDate: updatedFields.salaryReceivedDate || foundRequest.salaryReceivedDate,
            ProposedSalary: updatedFields.proposedSalary || foundRequest.proposedSalary,
            OldSalary: updatedFields.oldSalary || foundRequest.oldSalary,
            DivisionManagerComments: updatedFields.divisionManagerComments ? foundRequest.divisionManagerComments : "Saved changes in salary request",
        };

        await apiWithAuth.patch(`salaryreviewrequests/${requestId}/updateFields`, payload);
        fetchRequests();  // refresh the list after save
        handleSnackbarOpen('Successfully saved the updated fields', 'success');
    } catch (error) {
        console.error('Error saving the updated fields:', error);
        handleSnackbarOpen('Error saving the updated fields', 'error');
    }
  }
};


  const handleBulkAction = async (actionType) => {
    let successCount = 0;
    for (let id of selected) {
      try {
        const requestToApprove = requests.find(r => r.id === id);
        const editedRequest = editedFields[id];
        const formattedDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx");

        let payload = {};
        if (actionType === 'approve' || actionType === 'approveByDM') {          
          // для approve и approveByDM формируем одинаковый payload
          payload = {
            Currency: editedRequest.currency,
            ContractType: editedRequest.contractType,
            ReviewDate: formattedDate,
            NewSalary: editedRequest.proposedSalary,
            OldSalary: editedRequest.oldSalary,
            NewSalaryStartDate: requestToApprove.newSalaryStartDate,
            SalaryReceivedDate: requestToApprove.salaryReceivedDate,
            TalentManagerComments: requestToApprove.talentManagerComments,
            DivisionManagerComments: editedRequest.divisionManagerComments,
            Status: "Approved",
            Justification: requestToApprove.justification
          };
        } else if (actionType === 'decline') {
          payload = {
              ManagerComments: editedRequest.divisionManagerComments ? editedRequest.divisionManagerComments : 'Declined'
          };
      }
        console.log(`Sending ${actionType} request for ID: ${id}`);
        await apiWithAuth.patch(`salaryreviewrequests/${id}/${actionType}`, payload);
        successCount++;
      } catch (error) {
        console.error(`Error processing ${actionType} action for ID ${id}:`, error);
        handleSnackbarOpen(`Error processing ${actionType} action for ID ${id}`, 'error');
        return; // Прерываем цикл после первой же ошибки
      }
    }
    if (successCount === selected.length) {
      handleSnackbarOpen(`Successfully processed ${actionType} action for selected items.`, 'success');
    }
    fetchRequests(); // обновляем данные после обработки действий
  };

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const renderEditableField = (requestId, field, value, type) => {
    switch (type) {
      case 'dropdown-currency':
        return (
          <FormControl fullWidth>
            <InputLabel id={`dropdown-${field}-${requestId}-label`}>Currency</InputLabel>
            <Select
              labelId={`dropdown-${field}-${requestId}-label`}
              id={`dropdown-${field}-${requestId}`}
              value={editedFields[requestId]?.[field] ?? value}
              label="Currency"
              onChange={(e) => handleFieldChange(requestId, field, e.target.value)}
            >
              {['USD', 'PLN', 'EUR', 'BGN', 'AED'].map(currency => (
                <MenuItem key={currency} value={currency}>{currency}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'dropdown-contract':
        return (
          <FormControl fullWidth>
            <InputLabel id={`dropdown-${field}-${requestId}-label`}>Contract Type</InputLabel>
            <Select
              labelId={`dropdown-${field}-${requestId}-label`}
              id={`dropdown-${field}-${requestId}`}
              value={editedFields[requestId]?.[field] ?? value}
              label="Contract Type"
              onChange={(e) => handleFieldChange(requestId, field, e.target.value)}
            >
              {['B2B', 'EC'].map(contractType => (
                <MenuItem key={contractType} value={contractType}>{contractType}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={editedFields[requestId]?.[field] ? new Date(editedFields[requestId][field]) : new Date(value)}
              onChange={(date) => handleFieldChange(requestId, field, date)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        );
      case 'textarea':
        return (
          <Box component="div" sx={{ width: '100%', overflow: 'hidden' }}>
            <TextField
              multiline
              minRows={1}
              maxRows={10}
              value={editedFields[requestId]?.[field] ?? value}
              onChange={(e) => handleFieldChange(requestId, field, e.target.value)}
              style={{ width: '100%' }}
            />
          </Box>
        );

      case 'month-year':
        return (
          <MonthYearPickerWrapper
            requestId={requestId}
            field={field}
            value={editedFields[requestId]?.[field] ? new Date(editedFields[requestId][field]) : new Date(value)}
            handleFieldChange={handleFieldChange}
          />
        );
      default:
        return (
          <TextField
            type="text"
            value={editedFields[requestId]?.[field] ?? value}
            onChange={(e) => handleFieldChange(requestId, field, e.target.value)}
            variant="outlined"
            fullWidth
          />
        );
    }
  };

  const MonthYearPickerWrapper = ({ requestId, field, value, handleFieldChange }) => {
    const dateValue = value ? new Date(value) : null;

    const handleChange = (newValue) => {
      handleFieldChange(requestId, field, newValue.toISOString());
    };

    return (
      <MonthYearPicker
        value={dateValue}
        onChange={handleChange}
      />
    );
  };

  const handleSnackbarOpen = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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
    <Container maxWidth={false}>
      <h2>Salary Review Approvals</h2>
      <div>
        <Button
          variant="outlined"
          color="success"
          onClick={() => handleBulkAction('approve')}
          disabled={selected.length === 0}
        >
          Approve
        </Button>
        <Button
          variant="outlined" color="error"
          onClick={() => handleBulkAction('decline')}
          disabled={selected.length === 0}
        >
          Decline
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleSave(selected)}
          disabled={selected.length === 0}
        >
          Save Changes in Request
        </Button>
        <Button color="warning" variant="outlined" onClick={() => handleBulkAction('approveByDM')} disabled={selected.length === 0}>Approve by DM</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <StyledTableRow>
                <StyledHeaderCell>PersonId</StyledHeaderCell>
                <StyledHeaderCell>Person Name</StyledHeaderCell>
                <StyledHeaderCell>ReviewDate</StyledHeaderCell>
                <StyledHeaderCell>Justification</StyledHeaderCell>
                <StyledHeaderCell>OldSalary</StyledHeaderCell>
                <StyledHeaderCell>ProposedSalary</StyledHeaderCell>
                <StyledHeaderCell>Currency</StyledHeaderCell>
                <StyledHeaderCell>ContractType</StyledHeaderCell>
                <StyledHeaderCell>NewSalaryStartDate</StyledHeaderCell>
                <StyledHeaderCell>SalaryReceivedDate</StyledHeaderCell>
                <StyledHeaderCell>DivisionManagerComments</StyledHeaderCell>
                <StyledHeaderCell>TalentManagerComments</StyledHeaderCell>
                <StyledHeaderCell>IsApproved</StyledHeaderCell>
                <StyledHeaderCell>Check</StyledHeaderCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {requests.map(request => (
                <StyledTableRow key={request.id} selected={selected.indexOf(request.id) !== -1}>
                  <StyledTableCell>{request.personId}</StyledTableCell>
                  <StyledTableCell>{getPersonName(request.personId)}</StyledTableCell>
                  <StyledTableCell>{formatDateString(request.reviewDate)}</StyledTableCell>
                  <StyledTableCell>{request.justification}</StyledTableCell>
                  <StyledTableCell>{renderEditableField(request.id, 'oldSalary', request.oldSalary)}</StyledTableCell>
                  <StyledTableCell>{renderEditableField(request.id, 'proposedSalary', request.newSalary)}</StyledTableCell>
                  <StyledTableCell>{renderEditableField(request.id, 'currency', request.currency, 'dropdown-currency')}</StyledTableCell>
                  <StyledTableCell>{renderEditableField(request.id, 'contractType', request.contractType, 'dropdown-contract')}</StyledTableCell>
                  <StyledTableCell>{renderEditableField(request.id, 'newSalaryStartDate', request.newSalaryStartDate, 'month-year')}</StyledTableCell>
                  <StyledTableCell>{renderEditableField(request.id, 'salaryReceivedDate', request.salaryReceivedDate, 'month-year')}</StyledTableCell>
                  <StyledTableCell>{renderEditableField(request.id, 'divisionManagerComments', request.divisionManagerComments, 'textarea')}</StyledTableCell>
                  <StyledTableCell>{request.talentManagerComments}</StyledTableCell>
                  <StyledTableCell>{request.isApproved ? "Yes" : "No"}</StyledTableCell>
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={selected.indexOf(request.id) !== -1}
                      onChange={() => handleSelect(request.id)}
                    />
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
        
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
    
  );
};

export default SalaryReviewApproval;
