import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../../utils/api.js';
import { format, subYears } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
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
    Checkbox,
    Autocomplete,
    Typography,
    Menu,
    MenuItem,
    IconButton
} from '@mui/material';
import { Edit, Save, Cancel, Delete as DeleteIcon } from '@mui/icons-material';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import '../../styles/styles.css';

const SalaryReviewsHistory = () => {
    const [history, setHistory] = useState([]);
    const [people, setPeople] = useState([]);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [chartData, setChartData] = useState({});
    const [currentSalary, setCurrentSalary] = useState(null);
    const [chartMode, setChartMode] = useState('absolute'); // 'absolute' или 'percentage'
    const [isCreatingNewRecord, setIsCreatingNewRecord] = useState(false);
    const [editableRecord, setEditableRecord] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        fetchPeople();
    }, []);

    useEffect(() => {
        if (selectedPersonId) {
            setChartData({});
            setCurrentSalary(null);
            setHistory([]);
            fetchCurrentSalary(selectedPersonId);
            fetchHistory(selectedPersonId);
        }
    }, [selectedPersonId, chartMode]);

    const fetchPeople = async () => {
        try {
            const response = await apiWithAuth.get('people');
            setPeople(response.data.$values || []);
        } catch (error) {
            console.error('Error fetching people!', error);
        }
    };

    const fetchCurrentSalary = async (personId) => {
        try {
            const response = await apiWithAuth.get(`salaryreview/current/${personId}`);
            setCurrentSalary(response.data);
            updateChartData([], response.data);
        } catch (error) {
            console.error('Error fetching current salary!', error);
        }
    };

    const fetchHistory = async (personId) => {
        try {
            const response = await apiWithAuth.get(`salaryreview/history/${personId}`);
            let fetchedHistory = response.data.$values || [];
            fetchedHistory = fetchedHistory.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate));
            setHistory(fetchedHistory);
            updateChartData(fetchedHistory, currentSalary);
        } catch (error) {
            console.error('Error fetching salary review history!', error);
        }
    };

    const updateChartData = (fetchedHistory, currentSalary) => {
        const sortedHistory = fetchedHistory.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate));
        let percentageData = [];
        let absoluteData = [];

        if (sortedHistory.length > 0) {
            const initialDate = new Date(sortedHistory[0].reviewDate);
            initialDate.setMonth(initialDate.getMonth() - 6);
            absoluteData.push({ x: initialDate, y: sortedHistory[0].oldSalary });
        }
    
        sortedHistory.forEach((review, index) => {
            if (index === 0) {
                const percentageChange = ((review.proposedSalary - review.oldSalary) / review.oldSalary) * 100;
                percentageData.push({ x: new Date(review.reviewDate), y: Math.round(percentageChange) });
            } else {
                const previousReview = sortedHistory[index - 1];
                const percentageChange = ((review.proposedSalary - previousReview.proposedSalary) / previousReview.proposedSalary) * 100;
                percentageData.push({ x: new Date(review.reviewDate), y: Math.round(percentageChange) });
            }
            absoluteData.push({ x: new Date(review.reviewDate), y: review.proposedSalary });
        });

        if (currentSalary && sortedHistory.length > 0) {
            const lastReview = sortedHistory[sortedHistory.length - 1];
            const percentageChange = ((currentSalary.proposedSalary - lastReview.proposedSalary) / lastReview.proposedSalary) * 100;
            percentageData.push({ x: new Date(), y: Math.round(percentageChange) });
            absoluteData.push({ x: new Date(), y: currentSalary.proposedSalary });
        }

        const datasets = chartMode === 'absolute' ? [{
            label: 'Salary Over Time',
            data: absoluteData,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            pointRadius: 5,
            pointBackgroundColor: 'rgb(75, 192, 192)',
        }] : [{
            label: 'Percentage Change',
            data: percentageData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointRadius: 5,
            pointBackgroundColor: 'rgb(255, 99, 132)',
        }];

        setChartData({
            datasets,
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            parser: 'yyyy-MM-dd',
                            tooltipFormat: 'll',
                            unit: 'month',
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: chartMode === 'percentage' ? 'Change (%)' : 'Salary'
                        },
                        ticks: {
                            callback: (value) => chartMode === 'percentage' ? `${value}%` : `$${value}`,
                        }
                    }
                }
            }
        });
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
            divisionManagerComments: '',
            talentManagerComments: '',
            isApproved: true,
            ReviewResult: 'Approved',
        });
    };

    const saveRecord = async () => {
        try {
            const payload = {
                ...editableRecord,
                personId: selectedPersonId,
            };

            let response;
            if (isCreatingNewRecord) {
                response = await apiWithAuth.post('SalaryReviewHistory', payload);
                setIsCreatingNewRecord(false); 
            } else if (isEditing) {
                response = await apiWithAuth.put(`SalaryReviewHistory/${editableRecord.historyId}`, payload);
                setIsEditing(false);
            }

            if (response && response.status === 200) {
                fetchHistory(selectedPersonId);
            }
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
        setIsCreatingNewRecord(false);
        const recordToEdit = history[index];
        setIsEditing(true);
        setEditingIndex(index);
        setEditableRecord({
            ...recordToEdit,
            reviewDate: format(new Date(recordToEdit.reviewDate), 'yyyy-MM-dd'),
            newSalaryStartDate: format(new Date(recordToEdit.newSalaryStartDate), 'yyyy-MM-dd'),
            salaryReceivedDate: format(new Date(recordToEdit.salaryReceivedDate), 'yyyy-MM-dd'),
        });
    };

    const handleDeleteClick = (id) => {
        setOpenDialog(true);
        setDeleteId(id);
      };
    
    const deleteHistory = async () => {
    try {
        await apiWithAuth.delete(`SalaryReviewHistory/${deleteId}`);
        setOpenDialog(false);
        setHistory(history.filter((item) => item.historyId !== deleteId));
    } catch (error) {
        console.error('Error deleting record', error);
        setOpenDialog(false);
    }
    };
    
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (mode) => {
        setChartMode(mode);
        handleClose();
    };

    const handlePersonChange = (event, newValue) => {
        setSelectedPersonId(newValue ? newValue.id : null);
    };

    const refreshChart = () => {
        if (selectedPersonId) {
            fetchCurrentSalary(selectedPersonId);
            fetchHistory(selectedPersonId);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Salary Reviews History</Typography>
            <Autocomplete
                id="combo-box-people"
                options={people}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                style={{ width: '50%', maxWidth: 250 }}
                onChange={handlePersonChange}
                value={selectedPersonId ? people.find(person => person.id === selectedPersonId) : null} 
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                    <TextField {...params} label="Select a Person" variant="outlined" fullWidth />
                )}
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {selectedPersonId && (
                    <Button variant="contained" onClick={startCreatingNewRecord}>Create History Record</Button>
                )}
                <Button
                    variant="contained"
                    aria-controls="chart-mode-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    Chart Mode
                </Button>
                <Menu
                    id="chart-mode-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => handleMenuItemClick('absolute')}>Absolute Salary</MenuItem>
                    <MenuItem onClick={() => handleMenuItemClick('percentage')}>Percentage Change</MenuItem>
                </Menu>
            </div>

            {/* Центральный блок для графика */}
            {selectedPersonId && chartData.datasets && (
                <div style={{ position: 'relative', width: '50%' }}>
                    <button
                        onClick={refreshChart}
                        style={{
                            position: 'absolute',
                            right: 0,
                            zIndex: 1000,
                            border: 'none',
                            background: 'none',
                        }}
                    >
                        <FontAwesomeIcon icon={faSyncAlt} /> Refresh
                    </button>
                    <Line
                        data={chartData}
                        options={{
                            scales: {
                                x: {
                                    type: 'time',
                                    time: {
                                        unit: 'year',
                                        min: subYears(new Date(), 5),
                                        max: new Date(),
                                        tooltipFormat: 'dd/MM/yyyy',
                                        displayFormats: {
                                            year: 'yyyy'
                                        }
                                    },
                                    title: {
                                        display: true,
                                        text: 'Date'
                                    }
                                },
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: chartMode === 'percentage' ? 'Percentage Change' : 'Salary'
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                                if (chartMode === 'percentage') {
                                                    label += `${context.parsed.y}%`;
                                                } else {
                                                    label += `$${context.parsed.y}`;
                                                }
                                            }
                                            return label;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            )}

                <TableContainer component={Paper} sx={{ mt: 4, mb: 4, border: '1px solid #e0e0e0', boxShadow: 3 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="customized table">
                        <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Justification</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>New Salary Start Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Salary Received Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Old Salary</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Proposed Salary</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Currency</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Contract Type</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Status</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', border: 1, borderColor: 'divider' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {history.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.historyId}</TableCell>
                                {isEditing && editingIndex === index ? (
                                    // редактируемые поля
                                    <>
                                        <TableCell>
                                            <TextField
                                                type="date"
                                                defaultValue={format(new Date(row.reviewDate), 'yyyy-MM-dd')}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, reviewDate: e.target.value })}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                defaultValue={row.justification}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, justification: e.target.value })}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="date"
                                                defaultValue={format(new Date(row.newSalaryStartDate), 'yyyy-MM-dd')}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, newSalaryStartDate: e.target.value })}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="date"
                                                defaultValue={format(new Date(row.salaryReceivedDate), 'yyyy-MM-dd')}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, salaryReceivedDate: e.target.value })}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                defaultValue={row.oldSalary}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, oldSalary: e.target.value })}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                defaultValue={row.proposedSalary}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, proposedSalary: e.target.value })}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                defaultValue={row.currency}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, currency: e.target.value })}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                defaultValue={row.contractType}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, contractType: e.target.value })}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={editableRecord.isApproved || false}
                                                onChange={(e) => setEditableRecord({ ...editableRecord, isApproved: e.target.checked })}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => saveRecord(index)}><Save /></IconButton>
                                            <IconButton onClick={cancelEdit}><Cancel /></IconButton>
                                        </TableCell>
                                    </>
                                ) : (
                                    // если запись не редактируется
                                    <>
                                        <TableCell>{format(new Date(row.reviewDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{row.justification}</TableCell>
                                        <TableCell>{format(new Date(row.newSalaryStartDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{format(new Date(row.salaryReceivedDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{row.oldSalary}</TableCell>
                                        <TableCell>{row.proposedSalary}</TableCell>
                                        <TableCell>{row.currency}</TableCell>
                                        <TableCell>{row.contractType}</TableCell>
                                        <TableCell>{row.isApproved ? 'Approved' : 'Pending'}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => editRecord(index)} color="primary">
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(row.historyId)} color="secondary">
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}

                        {isCreatingNewRecord && (
                            <TableRow>
                                <TableCell component="th" scope="row">New</TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={editableRecord.reviewDate}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, reviewDate: e.target.value })}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={editableRecord.justification}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, justification: e.target.value })}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={editableRecord.newSalaryStartDate}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, newSalaryStartDate: e.target.value })}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="date"
                                        value={editableRecord.salaryReceivedDate}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, salaryReceivedDate: e.target.value })}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={editableRecord.oldSalary}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, oldSalary: e.target.value })}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={editableRecord.proposedSalary}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, proposedSalary: e.target.value })}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={editableRecord.currency}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, currency: e.target.value })}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={editableRecord.contractType}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, contractType: e.target.value })}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={editableRecord.isApproved}
                                        onChange={(e) => setEditableRecord({ ...editableRecord, isApproved: e.target.checked })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => saveRecord()}><Save /></IconButton>
                                    <IconButton onClick={cancelEdit}><Cancel /></IconButton>
                                </TableCell>
                            </TableRow>
                        )}
                        {currentSalary && (
                            <TableRow>
                                <TableCell>{currentSalary.id}</TableCell>
                                <TableCell>{format(new Date(currentSalary.reviewDate), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{currentSalary.justification}</TableCell>
                                <TableCell>{format(new Date(currentSalary.newSalaryStartDate), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{format(new Date(currentSalary.salaryReceivedDate), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{currentSalary.oldSalary}</TableCell>
                                <TableCell>{currentSalary.proposedSalary}</TableCell>
                                <TableCell>{currentSalary.currency}</TableCell>
                                <TableCell>{currentSalary.contractType}</TableCell>
                                <TableCell>Current</TableCell>
                                <TableCell />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this record?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={deleteHistory} color="primary" autoFocus>
                    Delete
                    </Button>
                </DialogActions>
                </Dialog>
        </Paper>        
    );
};

export default SalaryReviewsHistory;