import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../../utils/api.js';
import { format, subYears } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    IconButton,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material';
import { Edit, Save, Cancel, Delete as DeleteIcon } from '@mui/icons-material';
import { levelOptions } from '../hooks/selectOptions.js';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import '../../styles/styles.css';

const TitleHistoryTable = ({ personId, currentTitle }) => {
    const [titleHistory, setTitleHistory] = useState([]);
    const [isCreatingNewRecord, setIsCreatingNewRecord] = useState(false);
    const [editableRecord, setEditableRecord] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);

    useEffect(() => {
        if (personId) {
            fetchTitleHistory(personId);
        }
    }, [personId]);

    const fetchTitleHistory = async (personId) => {
        try {
            const response = await apiWithAuth.get(`people/${personId}/titleHistory`);
            const sortedHistory = response.data.$values.sort((a, b) => new Date(a.dateChanged) - new Date(b.dateChanged));
            setTitleHistory(sortedHistory);
        } catch (error) {
            console.error('Error fetching title history!', error);
            setTitleHistory([
                {
                    dateChanged: subYears(new Date(), 1).toISOString().split('T')[0],
                    oldTitle: '',
                    newTitle: currentTitle,
                    justification: 'Initial title',
                },
            ]);
        }
    };

    const startCreatingNewRecord = () => {
        setIsCreatingNewRecord(true);
        setEditableRecord({
            dateChanged: '',
            oldTitle: '',
            newTitle: '',
            justification: '',
        });
    };

    const saveRecord = async () => {
        try {
            if (isCreatingNewRecord) {
                const response = await apiWithAuth.post(`people/${personId}/titleHistory`, editableRecord);
                const newRecord = { ...editableRecord, id: response.data.id };
                const updatedHistory = [newRecord, ...titleHistory].sort((a, b) => new Date(b.dateChanged) - new Date(a.dateChanged));
                setTitleHistory(updatedHistory);
                setIsCreatingNewRecord(false);
            } else if (isEditing) {
                await apiWithAuth.put(`people/${personId}/titleHistory/${editableRecord.id}`, editableRecord);
                const updatedHistory = [...titleHistory];
                updatedHistory[editingIndex] = editableRecord;
                updatedHistory.sort((a, b) => new Date(b.dateChanged) - new Date(a.dateChanged));
                setTitleHistory(updatedHistory);
                setIsEditing(false);
            }
            setEditableRecord({});
            setEditingIndex(-1);
        } catch (error) {
            console.error('Error saving record!', error);
        }
    };

    const cancelEdit = () => {
        setIsCreatingNewRecord(false);
        setIsEditing(false);
        setEditableRecord({});
        setEditingIndex(-1);
    };

    const editRecord = (index) => {
        const recordToEdit = titleHistory[index];
        setIsEditing(true);
        setEditingIndex(index);
        setEditableRecord(recordToEdit);
    };

    const deleteRecord = async (index) => {
        try {
            const recordToDelete = titleHistory[index];
            await apiWithAuth.delete(`people/${personId}/titleHistory/${recordToDelete.id}`);
            const updatedHistory = titleHistory.filter((_, i) => i !== index);
            setTitleHistory(updatedHistory);
        } catch (error) {
            console.error('Error deleting record!', error);
        }
    };

    return (
        <TableContainer component={Paper} sx={{ mt: 4, mb: 4, border: '1px solid #e0e0e0', boxShadow: 3 }}>
            <Button variant="contained" onClick={startCreatingNewRecord} sx={{ mb: 2 }}>Create Title Record</Button>
            <Table sx={{ minWidth: 650 }} aria-label="title history table">
                <TableHead sx={{ backgroundColor: '#1976d2' }}>
                    <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Old Title</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>New Title</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Justification</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isCreatingNewRecord && (
                        <TableRow>
                            <TableCell>
                                <TextField
                                    type="date"
                                    value={editableRecord.dateChanged}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, dateChanged: e.target.value })}
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    value={editableRecord.oldTitle}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, oldTitle: e.target.value })}
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <FormControl fullWidth>
                                    <InputLabel>New Title</InputLabel>
                                    <Select
                                        value={editableRecord.newTitle}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, newTitle: e.target.value })}
                                    >
                                        {levelOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <TextField
                                    value={editableRecord.justification}
                                    onChange={(e) => setEditableRecord({ ...editableRecord, justification: e.target.value })}
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <IconButton onClick={saveRecord}><Save /></IconButton>
                                <IconButton onClick={cancelEdit}><Cancel /></IconButton>
                            </TableCell>
                        </TableRow>
                    )}

                    {titleHistory.map((row, index) => (
                        <TableRow key={row.id || index}>
                            {isEditing && editingIndex === index ? (
                                <>
                                    <TableCell>
                                        <TextField
                                            type="date"
                                            value={editableRecord.dateChanged}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, dateChanged: e.target.value })}
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={editableRecord.oldTitle}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, oldTitle: e.target.value })}
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormControl fullWidth>
                                            <InputLabel>New Title</InputLabel>
                                            <Select
                                                value={editableRecord.newTitle}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, newTitle: e.target.value })}
                                            >
                                                {levelOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            value={editableRecord.justification}
                                            onChange={(e) => setEditableRecord({ ...editableRecord, justification: e.target.value })}
                                            fullWidth
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={saveRecord}><Save /></IconButton>
                                        <IconButton onClick={cancelEdit}><Cancel /></IconButton>
                                    </TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell>{format(new Date(row.dateChanged), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{row.oldTitle}</TableCell>
                                    <TableCell>{row.newTitle}</TableCell>
                                    <TableCell>{row.justification}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => editRecord(index)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => deleteRecord(index)} color="secondary">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TitleHistoryTable;
