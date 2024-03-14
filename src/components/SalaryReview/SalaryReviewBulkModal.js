import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { apiWithAuth } from '../../utils/api';

const SalaryReviewBulkModal = ({ show, onHide, selectedEmployees, onSubmit }) => {
    const [reviews, setReviews] = useState(selectedEmployees.map(emp => ({
      ...emp,
      justification: '',
      newSalaryStartDate: '',
      salaryReceivedDate: '',
      talentManagerComments: '',
      currency: '',
      contractType: '',
    })));
  
    const handleChange = (index, field, value) => {
      const updatedReviews = [...reviews];
      updatedReviews[index][field] = value;
      setReviews(updatedReviews);
    };
  
    const handleSubmit = async () => {
      let successCount = 0;
      const totalCount = reviews.length;
  
      for (const review of reviews) {
        const data = {
          personId: review.personId,
          justification: review.justification,
          newSalaryStartDate: review.newSalaryStartDate,
          salaryReceivedDate: review.salaryReceivedDate,
          talentManagerComments: review.talentManagerComments,
          currency: review.currency,
          contractType: review.contractType,
          status: "Pending",
        };
  
        try {
          await apiWithAuth.post('salaryreviewrequests', data);
          successCount += 1;
        } catch (error) {
          console.error('Error sending review request:', error);
        }
      }
  
      if (successCount === totalCount) {
        alert('All review requests sent successfully');
        onHide(); // Assuming onHide is meant to close the modal
      } else {
        alert(`Sent ${successCount} of ${totalCount} review requests. Some requests failed.`);
      }
  
      // Assuming onSubmit might be intended for after successful submission
      if(typeof onSubmit === 'function'){
          onSubmit(reviews.filter((_, index) => successCount.includes(index)));
      }
    };
  
  

  return (
    <Dialog open={show} onClose={onHide} maxWidth="lg" fullWidth>
      <DialogTitle>Send Salary Review Requests</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Justification</TableCell>
              <TableCell>New Salary Start Date</TableCell>
              <TableCell>Salary Received Date</TableCell>
              <TableCell>Talent Manager Comments</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Contract Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.map((review, index) => (
              <TableRow key={review.id}>
                <TableCell>{review.name}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={review.justification}
                    onChange={(e) => handleChange(index, 'justification', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    fullWidth
                    variant="outlined"
                    value={review.newSalaryStartDate}
                    onChange={(e) => handleChange(index, 'newSalaryStartDate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    fullWidth
                    variant="outlined"
                    value={review.salaryReceivedDate}
                    onChange={(e) => handleChange(index, 'salaryReceivedDate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={review.talentManagerComments}
                    onChange={(e) => handleChange(index, 'talentManagerComments', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={review.currency}
                      onChange={(e) => handleChange(index, 'currency', e.target.value)}
                      label="Currency"
                    >
                      {['USD', 'PLN', 'EUR', 'BGN', 'AED'].map(currency => (
                        <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel>Contract Type</InputLabel>
                    <Select
                      value={review.contractType}
                      onChange={(e) => handleChange(index, 'contractType', e.target.value)}
                      label="Contract Type"
                    >
                      {['B2B', 'EC'].map(contractType => (
                        <MenuItem key={contractType} value={contractType}>{contractType}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onHide}>Cancel</Button>
        <Button onClick={handleSubmit}>Send Salary Review Requests</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SalaryReviewBulkModal;
