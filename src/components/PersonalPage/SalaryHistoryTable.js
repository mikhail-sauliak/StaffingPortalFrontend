import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../../utils/api.js';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    IconButton,
    Checkbox,
} from '@mui/material';
import { StyledHeaderCell, StyledTableCell, StyledTableRow } from '../../styles/Styles';
import { Edit, Save, Cancel, Delete as DeleteIcon } from '@mui/icons-material';

const SalaryHistoryTable = ({ personId, currentSalary, onRefresh }) => {
    const [history, setHistory] = useState([]);
    const [isCreatingNewRecord, setIsCreatingNewRecord] = useState(false);
    const [editableRecord, setEditableRecord] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);

    useEffect(() => {
        if (personId) {
            fetchHistory(personId);
        }
    }, [personId]);

    const fetchHistory = async (personId) => {
        const response = await apiWithAuth.get(`salaryreview/history/${personId}`);
        const sortedHistory = response.data.$values.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate));
        setHistory(sortedHistory);
    };

    const startCreatingNewRecord = () => {
        setIsCreatingNewRecord(true);
        setEditableRecord({
            reviewDate: '',
            justification: '',
            newSalaryStartDate: '',
            salaryReceivedDate: '',
            oldSalary: '',
            proposedSalary: '',
            currency: '',
            contractType: '',
            isApproved: true,
        });
    };

    const saveRecord = async () => {
        await apiWithAuth.post('SalaryReviewHistory', editableRecord);

        if (isCreatingNewRecord) {
            setHistory([{ ...editableRecord, historyId: Date.now() }, ...history]);
            setIsCreatingNewRecord(false);
        } else if (isEditing) {
            const updatedHistory = [...history];
            updatedHistory[editingIndex] = editableRecord;
            setHistory(updatedHistory);
            setIsEditing(false);
        }
        setEditableRecord({});
        setEditingIndex(-1);
        onRefresh();
    };

    const cancelEdit = () => {
        setIsCreatingNewRecord(false);
        setIsEditing(false);
        setEditableRecord({});
        setEditingIndex(-1);
    };

    const editRecord = (index) => {
        const recordToEdit = history[index];
        setIsEditing(true);
        setEditingIndex(index);
        setEditableRecord(recordToEdit);
    };

    const deleteRecord = async (index) => {
        const recordToDelete = history[index];
        await apiWithAuth.delete(`salaryreview/history/${recordToDelete.historyId}`);
        const updatedHistory = history.filter((_, i) => i !== index);
        setHistory(updatedHistory);
        onRefresh();
    };

    return (
        <TableContainer component={Paper} sx={{ mt: 4, mb: 4, border: '1px solid #e0e0e0', boxShadow: 3 }}>
            <Button variant="contained" onClick={startCreatingNewRecord} sx={{ mb: 2 }}>Create Salary Record</Button>
            <Table sx={{ minWidth: 650 }} aria-label="salary history table">
                <TableHead sx={{ backgroundColor: '#1976d2' }}>
                    <TableRow>
                        <StyledHeaderCell>ID</StyledHeaderCell>
                        <StyledHeaderCell>Date</StyledHeaderCell>
                        <StyledHeaderCell>Justification</StyledHeaderCell>
                        <StyledHeaderCell>New Salary Start Date</StyledHeaderCell>
                        <StyledHeaderCell>Salary Received Date</StyledHeaderCell>
                        <StyledHeaderCell>Old Salary</StyledHeaderCell>
                        <StyledHeaderCell>Proposed Salary</StyledHeaderCell>
                        <StyledHeaderCell>Currency</StyledHeaderCell>
                        <StyledHeaderCell>Contract Type</StyledHeaderCell>
                        <StyledHeaderCell>Status</StyledHeaderCell>
                        <StyledHeaderCell>Actions</StyledHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((row, index) => (
                        <StyledTableRow key={row.historyId || `history-${index}`}>
                            <StyledTableCell>{row.historyId || index}</StyledTableCell>
                            {isEditing && editingIndex === index ? (
                                <>
                                    <StyledTableCell>
                                        <TextField
                                            type="date"
                                            value={editableRecord.reviewDate}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, reviewDate: e.target.value })}
                                            fullWidth
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            value={editableRecord.justification}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, justification: e.target.value })}
                                            fullWidth
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            type="date"
                                            value={editableRecord.newSalaryStartDate}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, newSalaryStartDate: e.target.value })}
                                            fullWidth
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            type="date"
                                            value={editableRecord.salaryReceivedDate}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, salaryReceivedDate: e.target.value })}
                                            fullWidth
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            type="number"
                                            value={editableRecord.oldSalary}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, oldSalary: e.target.value })}
                                            fullWidth
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            type="number"
                                            value={editableRecord.proposedSalary}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, proposedSalary: e.target.value })}
                                            fullWidth
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            value={editableRecord.currency}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, currency: e.target.value })}
                                            fullWidth
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <TextField
                                            value={editableRecord.contractType}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, contractType: e.target.value })}
                                            fullWidth
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <Checkbox
                                            checked={editableRecord.isApproved || false}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, isApproved: e.target.checked })}
                                        />
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        <IconButton onClick={saveRecord}>
                                            <Save />
                                        </IconButton>
                                        <IconButton onClick={cancelEdit}>
                                            <Cancel />
                                        </IconButton>
                                    </StyledTableCell>
                                </>
                            ) : (
                                <>
                                    <StyledTableCell>{format(new Date(row.reviewDate), 'dd/MM/yyyy')}</StyledTableCell>
                                    <StyledTableCell>{row.justification}</StyledTableCell>
                                    <StyledTableCell>{format(new Date(row.newSalaryStartDate), 'dd/MM/yyyy')}</StyledTableCell>
                                    <StyledTableCell>{format(new Date(row.salaryReceivedDate), 'dd/MM/yyyy')}</StyledTableCell>
                                    <StyledTableCell>{row.oldSalary}</StyledTableCell>
                                    <StyledTableCell>{row.proposedSalary}</StyledTableCell>
                                    <StyledTableCell>{row.currency}</StyledTableCell>
                                    <StyledTableCell>{row.contractType}</StyledTableCell>
                                    <StyledTableCell>{row.isApproved ? 'Approved' : 'Pending'}</StyledTableCell>
                                    <StyledTableCell>
                                        <IconButton onClick={() => editRecord(index)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => deleteRecord(index)} color="secondary">
                                            <DeleteIcon />
                                        </IconButton>
                                    </StyledTableCell>
                                </>
                            )}
                        </StyledTableRow>
                    ))}

                    {isCreatingNewRecord && (
                        <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                                New
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    type="date"
                                    value={editableRecord.reviewDate}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, reviewDate: e.target.value })}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    value={editableRecord.justification}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, justification: e.target.value })}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    type="date"
                                    value={editableRecord.newSalaryStartDate}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, newSalaryStartDate: e.target.value })}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    type="date"
                                    value={editableRecord.salaryReceivedDate}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, salaryReceivedDate: e.target.value })}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    type="number"
                                    value={editableRecord.oldSalary}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, oldSalary: e.target.value })}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    type="number"
                                    value={editableRecord.proposedSalary}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, proposedSalary: e.target.value })}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    value={editableRecord.currency}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, currency: e.target.value })}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    value={editableRecord.contractType}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, contractType: e.target.value })}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <Checkbox
                                    checked={editableRecord.isApproved}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, isApproved: e.target.checked })}
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <IconButton onClick={saveRecord}>
                                    <Save />
                                </IconButton>
                                <IconButton onClick={cancelEdit}>
                                    <Cancel />
                                </IconButton>
                            </StyledTableCell>
                        </StyledTableRow>
                    )}
                    {currentSalary && (
                        <StyledTableRow key="current-salary">
                            <StyledTableCell>{currentSalary.id}</StyledTableCell>
                            <StyledTableCell>{format(new Date(currentSalary.reviewDate), 'dd/MM/yyyy')}</StyledTableCell>
                            <StyledTableCell>{currentSalary.justification}</StyledTableCell>
                            <StyledTableCell>{format(new Date(currentSalary.newSalaryStartDate), 'dd/MM/yyyy')}</StyledTableCell>
                            <StyledTableCell>{format(new Date(currentSalary.salaryReceivedDate), 'dd/MM/yyyy')}</StyledTableCell>
                            <StyledTableCell>{currentSalary.oldSalary}</StyledTableCell>
                            <StyledTableCell>{currentSalary.proposedSalary}</StyledTableCell>
                            <StyledTableCell>{currentSalary.currency}</StyledTableCell>
                            <StyledTableCell>{currentSalary.contractType}</StyledTableCell>
                            <StyledTableCell>Current</StyledTableCell>
                            <StyledTableCell />
                        </StyledTableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SalaryHistoryTable;
