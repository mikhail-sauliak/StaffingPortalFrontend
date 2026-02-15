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
    Autocomplete,
    Typography,
    Menu,
} from '@mui/material';
import { Edit, Save, Cancel, Delete as DeleteIcon } from '@mui/icons-material';
import 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import '../../styles/styles.css';
import SalaryHistoryTable from './SalaryHistoryTable';
import TitleHistoryTable from './TitleHistoryTable';
import SalaryChart from './SalaryChart';
import { levelOptions } from '../hooks/selectOptions';
import { updateChartData } from './chartDataUtils';

const SalaryReviewsHistory = () => {
    const [people, setPeople] = useState([]);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [chartData, setChartData] = useState({});
    const [currentSalary, setCurrentSalary] = useState(null);
    const [titleHistory, setTitleHistory] = useState([]);
    const [currentTitle, setCurrentTitle] = useState('');
    const [salaryRanges, setSalaryRanges] = useState({});
    const [chartMode, setChartMode] = useState('absolute');
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        fetchSalaryRanges();
        fetchPeople();
    }, []);

    useEffect(() => {
        if (selectedPersonId) {
            setChartData({});
            setCurrentSalary(null);
            setTitleHistory([]);
            setCurrentTitle('');
            fetchCurrentSalary(selectedPersonId);
            fetchHistory(selectedPersonId);
            fetchTitleHistory(selectedPersonId);
        }
    }, [selectedPersonId, chartMode]);

    const fetchSalaryRanges = async () => {
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/sr.json`);
            const data = await response.json();
            setSalaryRanges(data);
        } catch (error) {
            console.error('Error fetching salary ranges!', error);
        }
    };

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
            updateChartData([], response.data, titleHistory, people, selectedPersonId, salaryRanges, chartMode, currentTitle, setChartData);
        } catch (error) {
            console.error('Error fetching current salary!', error);
            setCurrentSalary(null);
        }
    };

    const fetchHistory = async (personId) => {
        try {
            const response = await apiWithAuth.get(`salaryreview/history/${personId}`);
            let fetchedHistory = response.data.$values || [];
            fetchedHistory = fetchedHistory.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
            if (fetchedHistory.length === 0) {
                console.warn('No salary review history found.');
                fetchedHistory = [];
            }
            updateChartData(fetchedHistory, currentSalary, titleHistory, people, selectedPersonId, salaryRanges, chartMode, currentTitle, setChartData);
        } catch (error) {
            console.error('Error fetching salary review history!', error);
            updateChartData([], currentSalary, titleHistory, people, selectedPersonId, salaryRanges, chartMode, currentTitle, setChartData);
        }
    };

    const fetchTitleHistory = async (personId) => {
        try {
            const response = await apiWithAuth.get(`people/${personId}/titleHistory`);
            const sortedHistory = response.data.$values.sort((a, b) => new Date(b.dateChanged) - new Date(a.dateChanged));
            setTitleHistory(sortedHistory);
            updateChartData([], currentSalary, sortedHistory, people, selectedPersonId, salaryRanges, chartMode, currentTitle, setChartData);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn('No title history found, using current title from people data');
                const person = people.find((p) => p.id === personId);
                if (person) {
                    setCurrentTitle(person.level);
                    const oneYearAgo = subYears(new Date(), 1).toISOString().split('T')[0];
                    setTitleHistory([
                        {
                            dateChanged: oneYearAgo,
                            oldTitle: 'N/A',
                            newTitle: person.level,
                            justification: 'Initial title',
                        },
                    ]);
                    updateChartData([], currentSalary, [
                        {
                            dateChanged: oneYearAgo,
                            oldTitle: 'N/A',
                            newTitle: person.level,
                            justification: 'Initial title',
                        },
                    ], people, selectedPersonId, salaryRanges, chartMode, currentTitle, setChartData);
                }
            } else {
                console.error('Error fetching title history!', error);
            }
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
            fetchTitleHistory(selectedPersonId);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Salary Reviews History
            </Typography>
            <Autocomplete
                id="combo-box-people"
                options={people}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                style={{ width: '50%', maxWidth: 250 }}
                onChange={handlePersonChange}
                value={selectedPersonId ? people.find((person) => person.id === selectedPersonId) : null}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                    <TextField {...params} label="Select a Person" variant="outlined" fullWidth />
                )}
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
                <Button variant="contained" onClick={refreshChart}>
                    Refresh
                </Button>
            </div>

            {selectedPersonId && chartData.datasets && (
                <SalaryChart
                    chartData={chartData}
                    chartMode={chartMode}
                    refreshChart={refreshChart}
                />
            )}

            {selectedPersonId && (
                <>
                    <SalaryHistoryTable
                        personId={selectedPersonId}
                        currentSalary={currentSalary}
                        onRefresh={refreshChart}
                    />
                    <TitleHistoryTable personId={selectedPersonId} currentTitle={currentTitle} />
                </>
            )}
        </Paper>
    );
};

export default SalaryReviewsHistory;
