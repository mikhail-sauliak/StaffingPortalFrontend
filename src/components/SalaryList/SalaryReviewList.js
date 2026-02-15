import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../../utils/api';
import UpdateLevelDialog from './UpdateLevelDialog';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import { StyledHeaderCell, StyledTableCell } from '../../styles/Styles';
import { format } from 'date-fns';

const SalaryReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [people, setPeople] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [justification, setJustification] = useState('');
    const [newSalaryStartDate, setNewSalaryStartDate] = useState('');
    const [salaryReceivedDate, setSalaryReceivedDate] = useState('');
    const [talentManagerComments, setTalentManagerComments] = useState('');
    const [currency, setCurrency] = useState('');
    const [contractType, setContractType] = useState('');
    const [showUpdateLevelDialog, setShowUpdateLevelDialog] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState(null);

    const fetchReviews = async () => {
        try {
            const responsePeople = await apiWithAuth.get('people');
            const response = await apiWithAuth.get('salaryreview');
            setPeople(responsePeople.data.$values);
            setReviews(response.data.$values);
            
        } catch (error) {
            console.error("Error fetching the salary reviews", error);
        }
    };
    
    const [loading, setLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);

    useEffect(() => {
        fetchReviews();
        setLoading(false);
    }, [refreshData]);

    const getPersonName = (personId) => {
        const person = people.find(p => p.id === personId);
        return person ? `${person.firstName} ${person.lastName}` : 'Unknown';
    };

    const handleSendReview = async () => {
        if (!selectedReview) {
            console.error('selectedReview is null');
            return;
        }
        const data = {
            personId: selectedReview.personId,
            justification,
            newSalaryStartDate,
            salaryReceivedDate,
            talentManagerComments,
            currency,
            contractType,
            status: "Pending"
        };
        try {
            await apiWithAuth.post('salaryreviewrequests', data);
            alert('Review request sent successfully');
            setShowReviewModal(false);
            setRefreshData(!refreshData);
        } catch (error) {
            console.error('Error sending review request:', error);
            alert('Failed to send review request');
        }
    };

    const handleShowReviewModal = (review) => {
        setSelectedReview(review);
        setJustification('');
        setNewSalaryStartDate('');
        setSalaryReceivedDate('');
        setTalentManagerComments('');
        setCurrency('');
        setContractType('');
        setShowReviewModal(true);
    };

    const handleShowUpdateLevelDialog = (personId) => {
        setSelectedPersonId(personId);
        setShowUpdateLevelDialog(true);
    };

    const handleLevelUpdate = () => {
        setRefreshData(!refreshData);
    };

    const currencies = ['USD', 'PLN', 'EUR', 'BGN', 'AED'];
    const contractTypes = ['B2B', 'EC'];

    return (
        <Container maxWidth={false}>
            <TableContainer component={Paper}>
                <Table aria-label="salary review table">
                    <TableHead>
                        <TableRow>
                            <StyledHeaderCell>Person Id</StyledHeaderCell>
                            <StyledHeaderCell>Person Name</StyledHeaderCell>
                            <StyledHeaderCell>Review Date</StyledHeaderCell>
                            <StyledHeaderCell>Justification</StyledHeaderCell>
                            <StyledHeaderCell>Old Salary</StyledHeaderCell>
                            <StyledHeaderCell>Proposed Salary</StyledHeaderCell>
                            <StyledHeaderCell>Currency</StyledHeaderCell>
                            <StyledHeaderCell>Contract Type</StyledHeaderCell>
                            <StyledHeaderCell>New Salary Start Date</StyledHeaderCell>
                            <StyledHeaderCell>Salary Received Date</StyledHeaderCell>
                            <StyledHeaderCell>DM Comments</StyledHeaderCell>
                            <StyledHeaderCell>TM Comments</StyledHeaderCell>
                            <StyledHeaderCell>Is Approved</StyledHeaderCell>
                            <StyledHeaderCell>Action</StyledHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review.id}>
                                <StyledTableCell>{review.personId}</StyledTableCell>
                                <StyledTableCell>{getPersonName(review.personId)}</StyledTableCell>
                                <StyledTableCell>{format(new Date(review.reviewDate), 'dd/MM/yyyy')}</StyledTableCell>
                                <StyledTableCell>{review.justification}</StyledTableCell>
                                <StyledTableCell>{review.oldSalary}</StyledTableCell>
                                <StyledTableCell>{review.proposedSalary}</StyledTableCell>
                                <StyledTableCell>{review.currency}</StyledTableCell>
                                <StyledTableCell>{review.contractType}</StyledTableCell>
                                <StyledTableCell>{format(new Date(review.newSalaryStartDate), 'dd/MM/yyyy')}</StyledTableCell>
                                <StyledTableCell>{format(new Date(review.salaryReceivedDate), 'dd/MM/yyyy')}</StyledTableCell>
                                <StyledTableCell>{review.divisionManagerComments}</StyledTableCell>
                                <StyledTableCell>{review.talentManagerComments}</StyledTableCell>
                                <StyledTableCell>{review.reviewResult}</StyledTableCell>
                                <TableCell>
                                    <Button variant={"contained"} color={"primary"} onClick={() => handleShowReviewModal(review)}>SR</Button>
                                    <Button variant={"contained"} color={"secondary"} onClick={() => handleShowUpdateLevelDialog(review.personId)}>Update Level</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)}>
                <DialogTitle>Start Salary Review</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        id="justification"
                        label="Justification"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="newSalaryStartDate"
                        label="New Salary Start Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={newSalaryStartDate}
                        onChange={(e) => setNewSalaryStartDate(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="salaryReceivedDate"
                        label="Salary Received Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={salaryReceivedDate}
                        onChange={(e) => setSalaryReceivedDate(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="talentManagerComments"
                        label="Talent Manager Comments"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={talentManagerComments}
                        onChange={(e) => setTalentManagerComments(e.target.value)}
                    />                    
                    <TextField
                        select
                        label="Currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        fullWidth
                    >
                        {currencies.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Contract Type"
                        value={contractType}
                        onChange={(e) => setContractType(e.target.value)}
                        fullWidth
                    >
                        {contractTypes.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowReviewModal(false)}>Cancel</Button>
                    <Button onClick={handleSendReview}>Send</Button>
                </DialogActions>
            </Dialog>

            <UpdateLevelDialog
                open={showUpdateLevelDialog}
                onClose={() => setShowUpdateLevelDialog(false)}
                personId={selectedPersonId}
                onLevelUpdate={handleLevelUpdate}
            />
        </Container>
    );
}

export default SalaryReviewList;
