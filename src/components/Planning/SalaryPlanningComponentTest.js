import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { Button, Snackbar, Paper } from '@mui/material';
import axios from 'axios';
import { exportToCsv } from './exportToCSV';
import { apiWithAuth } from '../../utils/api';

const SalaryPlanningComponentTest = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [currencyRates, setCurrencyRates] = useState({});
    const [localData, setLocalData] = useState([]);
    const [isImportMode, setIsImportMode] = useState(false);
    const apiRef = useGridApiRef();

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
            const response = await axios.get('https://v6.exchangerate-api.com/v6/c65860c12d9719d787f11ecd/latest/GBP');            
            // const response = await axios.get('https://v6.exchangerate-api.com/v6/50d7b85664c7ecc312f6715e/latest/GBP');
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
                

                aggregatedData.forEach((item, index) => {
                    console.log(`Item ${index}:`, item);
                });
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
    const renderCell = (cellValues) => {
        console.log(`Rendering cell: id=${cellValues.id}, field=${cellValues.field}, value=${cellValues.value}`);
        return <div>{cellValues.value}</div>;
    };
    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'stream', headerName: 'Stream', width: 150 },
        { field: 'currentSalary', headerName: 'Current Salary', width: 130, editable: true },
        ...Array.from({ length: 12 }, (_, i) => ({
            field: `month_${i + 1}`,
            headerName: new Date(0, i).toLocaleString('en', { month: 'short' }),
            width: 110,
            editable: true, 
            renderCell: renderCell,
        })),
        { field: 'totalSum', headerName: 'Total Sum', width: 130 },
    ];

    const rows = localData.map((person, index) => {
        const monthlySalaries = processSalariesForYear(person.salaries.$values, selectedYear);
        let rowData = {
            id: index + 1,
            name: person.fullName,
            stream: person.stream,
            currentSalary: person.currentSalary || '-', 
            totalSum: `${calculateTotalYearlySalary(monthlySalaries)} ${person.currency}`,
        };
    
        monthlySalaries.forEach((salary, monthIndex) => {            
            rowData[`month_${monthIndex + 1}`] = salary ? `${salary}` : '-';
        });
    
        return rowData;
    });    

    const handleCellEditCommit = useCallback((params) => {
        const { id, field, value } = params;
        if (!field.startsWith('month_')) return;
    
        const newValue = parseFloat(value);
        if (isNaN(newValue)) return;
    
        const monthIndex = parseInt(field.split('_')[1], 10) - 1; // Поправка индекса на -1, так как месяцы начинаются с 1
        setLocalData(currentData =>
            currentData.map(person => {
                if (person.id === id) {
                    const newSalaries = person.salaries.$values.map((salary, index) => {
                        // Если месяц зарплаты больше или равен редактируемому месяцу, обновляем его
                        const salaryMonth = new Date(salary.startDate).getMonth();
                        if (salaryMonth >= monthIndex) {
                            return { ...salary, salary: newValue };
                        }
                        return salary;
                    });
                    return { ...person, salaries: { ...person.salaries, $values: newSalaries } };
                }
                return person;
            })
        );
    }, [selectedYear, localData]);
    

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ height: 700, width: '100%' }}>
            <Button
                variant="contained"
                color="secondary"
                onClick={fetchAggregatedSalariesForAllTime}
                style={{ marginBottom: '20px' }}
            >
                Reset Changes
            </Button>
            <Paper style={{ height: 650, width: '100%' }}>
                <DataGrid
                    apiRef={apiRef}
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    editMode="row"
                    onCellEditCommit={handleCellEditCommit}
                />
            </Paper>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </div>
    );
};

export default SalaryPlanningComponentTest;