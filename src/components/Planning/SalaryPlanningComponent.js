import React, { useState, useEffect, useCallback } from 'react';
import { Snackbar, Button, Paper, TextField, TableHead, TableBody, TableContainer, Table } from '@mui/material';
import { StyledHeaderCell, StyledTableCell, StyledTableRow } from '../../styles/Styles';
import { exportToCsv } from './exportToCSV';
import { apiWithAuth } from '../../utils/api';
import axios from 'axios';

const SalaryPlanningComponent = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [currencyRates, setCurrencyRates] = useState({});
    const [editingCell, setEditingCell] = useState({ personId: null, monthIndex: null });
    const [tempSalary, setTempSalary] = useState("");
    const [localData, setLocalData] = useState([]);
    const [changedCells, setChangedCells] = useState({});
    const [activeTool, setActiveTool] = useState(null); // brush or eraser
    const [brushedCells, setBrushedCells] = useState({});
    const [isImportMode, setIsImportMode] = useState(false);

    useEffect(() => {
        const loadCurrencyRates = async () => {
            const rates = await fetchCurrencyRates();
            setCurrencyRates(rates);
        };

        loadCurrencyRates();
        fetchAggregatedSalariesForAllTime();
    }, [selectedYear]);

    const fetchCurrencyRates = async () => {
        try {
            // const response = await axios.get('https://v6.exchangerate-api.com/v6/c65860c12d9719d787f11ecd/latest/GBP');            
            const response = await axios.get('https://v6.exchangerate-api.com/v6/50d7b85664c7ecc312f6715e/latest/GBP');
            return response.data.conversion_rates;
        } catch (error) {
            console.error('Error fetching currency rates:', error);
            return {};
        }
    };

    const fetchAggregatedSalariesForAllTime = async () => {
        setLoading(true);
        try {
            const response = await apiWithAuth.get('/SalaryAggregation/AggregatedSalaries');
            if (response.data && Array.isArray(response.data.$values)) {
                const aggregatedData = response.data.$values;
                setLocalData(JSON.parse(JSON.stringify(aggregatedData))); 
            } else {
                setError('Data is not in the expected format');
            }
        } catch (error) {
            setError('Failed to fetch aggregated salaries');
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = useCallback((personId, monthIndex) => {
        const person = localData.find(p => p.personId === personId);
        if (person && person.salaries && person.salaries.$values) {
            const salaryRecord = person.salaries.$values
                .filter(s => new Date(s.startDate) <= new Date(selectedYear, monthIndex, 1))
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];

            if (salaryRecord) {
                const salary = salaryRecord.salary.toString();
                setTempSalary(salary);
                setEditingCell({ personId, monthIndex });
            } else {
                console.log("Salary data not found for personId:", personId, "monthIndex:", monthIndex);
            }
        }
        if (activeTool === 'brush') {            
            setBrushedCells(prev => ({
                ...prev,
                [personId]: [...(prev[personId] || []), monthIndex].filter((v, i, a) => a.indexOf(v) === i) 
            }));
        } else if (activeTool === 'eraser') {           
            setBrushedCells(prev => ({
                ...prev,
                [personId]: (prev[personId] || []).filter(index => index !== monthIndex)
            }));
        }
    }, [localData, selectedYear,activeTool]);

    const handleFinishEditing = useCallback(() => {
        const newSalary = parseFloat(tempSalary);
        if (!isNaN(newSalary) && editingCell.personId !== null && editingCell.monthIndex !== null) {            
            const editDate = new Date(selectedYear, editingCell.monthIndex, 1);

            setLocalData(currentData =>
                currentData.map(person => {
                    if (person.personId === editingCell.personId) {                        
                        const updatedSalaries = person.salaries.$values.map(salary => {
                            const salaryStartDate = new Date(salary.startDate);
                            if (salaryStartDate >= editDate) {
                                return { ...salary, salary: newSalary };
                            }
                            return salary;
                        });
                        
                        if (!updatedSalaries.some(salary => new Date(salary.startDate).getTime() === editDate.getTime())) {
                            updatedSalaries.push({
                                salary: newSalary,
                                startDate: editDate.toISOString(),
                            });
                        }

                        return {
                            ...person,
                            salaries: {
                                ...person.salaries,
                                $values: updatedSalaries,
                            },
                        };
                    }
                    return person;
                }),
            );
            setChangedCells(prev => ({
                ...prev,
                [editingCell.personId]: [...(prev[editingCell.personId] || []), editingCell.monthIndex],
            }));
            setEditingCell({ personId: null, monthIndex: null });
            setTempSalary("");
        }
    }, [editingCell, tempSalary, selectedYear, localData]);



    const resetToOriginalSalaries = useCallback(() => {
        fetchAggregatedSalariesForAllTime(); 
    }, []);

    const convertToGBP = (amount, currency) => {
        const rate = currencyRates[currency] || 1;
        return Math.round(amount / rate);
    };

    const calculateMonthlySumsInGBP = () => {
        const monthlySums = new Array(12).fill(0);

        localData.forEach(person => {
            const monthlySalaries = processSalariesForYear(person.salaries.$values, currentYear);
            monthlySalaries.forEach((salary, index) => {
                if (salary) {
                    monthlySums[index] += convertToGBP(salary, person.currency);
                }
            });
        });

        return monthlySums;
    };

    const calculateMonthlyChangesInGBP = (monthlySums) => {
        const changes = new Array(11).fill('-'); 

        for (let i = 1; i < monthlySums.length; i++) {
            if (monthlySums[i - 1] > 0) {
                const change = ((monthlySums[i] - monthlySums[i - 1]) / monthlySums[i - 1]) * 100;
                changes[i - 1] = change.toFixed(2) + '%'; 
            }
        }

        return changes;
    };

    const calculateTotalYearlySalary = (yearlySalaries) => {
        return yearlySalaries.reduce((total, salary) => {            
            if (salary) {
                return total + salary;
            }
            return total;
        }, 0);
    };

    const currentYear = new Date().getFullYear();

    const processSalariesForYear = (salaries, year) => {
        const monthlySalaries = new Array(12).fill(0);
        
        const sortedSalaries = salaries.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        
        sortedSalaries.forEach(salaryInfo => {
            const startDate = new Date(salaryInfo.startDate);
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            
            if (startYear > year) {
                return;
            }
            
            for (let month = 0; month < 12; month++) {
                if (startYear < year || month >= startMonth) {                    
                    if (monthlySalaries[month] === 0) {
                        monthlySalaries[month] = salaryInfo.salary;
                    }
                }
            }
        });

        return monthlySalaries;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <Button
                variant="contained"
                color="secondary"
                onClick={resetToOriginalSalaries}
                style={{ marginBottom: '20px' }}
            >
                Reset Changes
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => setActiveTool('brush')}
                style={{ marginBottom: '20px' }}
            >
                Brush
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => setActiveTool('eraser')}
                style={{ marginBottom: '20px' }}
            >
                Eraser
            </Button>
            <Button
                variant="contained"
                color="primary"
                style={{ marginBottom: '20px' }}
                onClick={() => exportToCsv(localData, processSalariesForYear, calculateTotalYearlySalary, currentYear)}
            >
                Export to CSV
            </Button>
            <TableContainer component={Paper}>
                <Table aria-label="monthly salary table">
                    <TableHead>
                        <StyledTableRow>
                            <StyledHeaderCell>ID</StyledHeaderCell>
                            <StyledHeaderCell>Name</StyledHeaderCell>
                            <StyledHeaderCell>Stream</StyledHeaderCell>
                            <StyledHeaderCell>Current Salary</StyledHeaderCell>
                            {Array.from({ length: 12 }, (_, i) => (
                                <StyledHeaderCell key={i}>{new Date(0, i).toLocaleString('en', { month: 'short' })}</StyledHeaderCell>
                            ))}
                            <StyledHeaderCell>Total Sum</StyledHeaderCell>
                        </StyledTableRow>
                        <StyledTableRow>
                            <StyledTableCell colSpan={3}>Total in GBP:</StyledTableCell>
                            <StyledTableCell></StyledTableCell>
                            {calculateMonthlySumsInGBP().map((sum, index) => (
                                <StyledTableCell key={index}>{sum} GBP</StyledTableCell>
                            ))}
                            <StyledTableCell></StyledTableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                            <StyledTableCell colSpan={3}>Change:</StyledTableCell>
                            <StyledTableCell></StyledTableCell>
                            {['-'].concat(calculateMonthlyChangesInGBP(calculateMonthlySumsInGBP())).map((change, index) => (
                                <StyledTableCell key={index}>{change}</StyledTableCell>
                            ))}
                            <StyledTableCell></StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {localData.map((person, index) => {
                            const monthlySalaries = processSalariesForYear(person.salaries.$values, currentYear);

                            return (
                                <StyledTableRow key={person.personId}>
                                    <StyledTableCell>{index + 1}</StyledTableCell>
                                    <StyledTableCell>{person.fullName}</StyledTableCell>
                                    <StyledTableCell>{person.stream}</StyledTableCell>
                                    <StyledTableCell></StyledTableCell>
                                    {
                                        monthlySalaries.map((salary, monthIndex) => {
                                            const isBrushed = brushedCells[person.personId]?.includes(monthIndex);
                                            return (

                                                <StyledTableCell
                                                    key={monthIndex}
                                                    onClick={() => 
                                                        handleCellClick(person.personId, monthIndex)}
                                                    style={isBrushed ? { backgroundColor: '#ccffcc' } : undefined
                                                    }>
                                                    {
                                                        editingCell.personId === person.personId && editingCell.monthIndex === monthIndex ?
                                                            <TextField
                                                                size="small"
                                                                autoFocus
                                                                value={tempSalary}
                                                                onChange={(e) => {
                                                                    setTempSalary(e.target.value);
                                                                    console.log("Текущее tempSalary:", e.target.value);
                                                                }}
                                                                onBlur={handleFinishEditing}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleFinishEditing();
                                                                    }
                                                                }}
                                                                type="number"
                                                            />
                                                            :
                                                            salary ? `${salary} ${person.currency}` : '-'
                                                    }
                                                </StyledTableCell>
                                            );
                                        })
                                    }
                                    <StyledTableCell>
                                        {`${calculateTotalYearlySalary(monthlySalaries)} ${person.currency}`}
                                    </StyledTableCell>
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </div>
    );
};

export default SalaryPlanningComponent;