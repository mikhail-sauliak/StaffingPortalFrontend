import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Snackbar } from '@mui/material';
import { StyledHeaderCell, StyledTableCell, StyledTableRow, CenteredTableCell } from '../../styles/Styles';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Typography,
  Button,
  FormControl,
  InputLabel,
  Paper,
  Select,
  MenuItem,
  TableFooter,
  TableRow,
  TableHead,
  TableBody,
  TableContainer,
  Table,
  FormControlLabel,
  Switch,
  Stack
} from '@mui/material';
import { apiWithAuth } from '../../utils/api';
import axios from 'axios';
import BillingRatioTable from '../Statistics/BillingRatioTable';
import QuarterlyGrowthChart from '../SalaryStatistics/QuarterlyGrowthChart';
import SalaryForecast from '../SalaryStatistics/SalaryForecast';

const SalaryStatistics = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previousYearQ4Total, setPreviousYearQ4Total] = useState(0);
  const [monthlySalaries, setMonthlySalaries] = useState({});
  const [quarterTotals, setQuarterTotals] = useState({ Q1: 0, Q2: 0, Q3: 0, Q4: 0 });
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [recordIdToUpdate, setRecordIdToUpdate] = useState(null);
  const [currencyRates, setCurrencyRates] = useState({});
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const today = useMemo(() => {
    const normalized = new Date();
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }, []);

  const isPersonActive = useCallback((person) => {
    if (!person) {
      return false;
    }

    if (person.isDismissed) {
      return false;
    }

    if (person.endDate) {
      const endDate = new Date(person.endDate);
      endDate.setHours(0, 0, 0, 0);
      if (endDate < today) {
        return false;
      }
    }

    return true;
  }, [today]);

  const activePeopleMap = useMemo(() => {
    if (!people || people.length === 0) {
      return {};
    }

    return people.reduce((acc, person) => {
      acc[person.id] = isPersonActive(person);
      return acc;
    }, {});
  }, [isPersonActive, people]);

  useEffect(() => {
    const loadCurrencyRates = async () => {
      const rates = await fetchCurrencyRates();
      setCurrencyRates(rates);
    };

    loadCurrencyRates();
    fetchMonthlySalaries();
    fetchPreviousYearQ4Total();
  }, [selectedYear]);

  useEffect(() => {
    const loadPeople = async () => {
      setLoading(true);
      try {
        const response = await apiWithAuth.get('people');
        setPeople(response.data.$values);
      } catch (error) {
        console.error('Error fetching people data:', error);
        setError('Failed to fetch people data');
      } finally {
        setLoading(false);
      }
    };
  
    loadPeople();
  }, []);

  const fetchCurrencyRates = async () => {
    try {
      const response = await axios.get('https://v6.exchangerate-api.com/v6/c65860c12d9719d787f11ecd/latest/GBP');
      return response.data.conversion_rates;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return {};
    }
  };

  const convertToGBP = (amount, currency) => {
    const rate = currencyRates[currency] || 1;
    return Math.round(amount / rate);
  };

  const isAggregationActive = useCallback((personId, salaries) => {
    const numericId = Number(personId);
    if (!Number.isNaN(numericId)) {
      const key = String(numericId);
      if (Object.prototype.hasOwnProperty.call(activePeopleMap, key)) {
        return activePeopleMap[key];
      }
    }

    if (salaries && salaries.length > 0) {
      const headSalary = salaries[0];
      if (headSalary?.endDate) {
        const endDate = new Date(headSalary.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate >= today;
      }
    }

    return true;
  }, [activePeopleMap, today]);

  const filteredMonthlySalaries = useMemo(() => {
    if (!showActiveOnly || !monthlySalaries) {
      return monthlySalaries || {};
    }

    return Object.entries(monthlySalaries).reduce((acc, [personId, salaries]) => {
      if (isAggregationActive(personId, salaries)) {
        acc[personId] = salaries;
      }
      return acc;
    }, {});
  }, [isAggregationActive, monthlySalaries, showActiveOnly]);

  // const fetchMonthlySalaries = async () => {
  //   setLoading(true);
  //   try {
  //     const salaryResponse = await apiWithAuth.get('salaryreview');
  //     const historyResponse = await apiWithAuth.get('salaryreviewhistory');
  //     const responsePeople = await apiWithAuth.get('people');
  //     const salaries = salaryResponse.data.$values;
  //     const history = historyResponse.data.$values;
  //     setPeople(responsePeople.data.$values);

  //     const combinedData = [...salaries, ...history];
  //     combinedData.sort((a, b) => new Date(a.newSalaryStartDate || a.reviewDate) - new Date(b.newSalaryStartDate || b.reviewDate));

  //     const lastReviewedSalaries = {};

  //     combinedData.forEach(item => {
  //       const reviewYear = (item.newSalaryStartDate ? new Date(item.newSalaryStartDate) : new Date(item.reviewDate)).getFullYear();
  //       if (reviewYear < selectedYear) {
  //         lastReviewedSalaries[item.personId] = { salary: item.proposedSalary, currency: item.currency || 'PLN' };
  //       }
  //     });

  //     const initialMonthlyData = Object.fromEntries(
  //       Object.entries(lastReviewedSalaries).map(([personId, salaryObj]) => [
  //         personId,
  //         new Array(12).fill(salaryObj)
  //       ])
  //     );

  //     const monthlyData = combinedData.reduce((acc, curr) => {
  //       const startDate = curr.newSalaryStartDate ? new Date(curr.newSalaryStartDate) : new Date(curr.reviewDate);
  //       const month = startDate.getMonth();
  //       const year = startDate.getFullYear();
  //       const personId = curr.personId;
  //       const currency = curr.currency;

  //       if (year === selectedYear) {
  //         acc[personId] = acc[personId] || new Array(12).fill({ salary: lastReviewedSalaries[personId] || null, currency: currency || 'PLN' });
  //         for (let i = month; i < 12; i++) {
  //           acc[personId][i] = { salary: curr.proposedSalary, currency };
  //         }
  //       }

  //       return acc;
  //     }, initialMonthlyData);

  //     setMonthlySalaries(monthlyData);
  //     console.log("Monthly data is: ", monthlyData);
  //   } catch (error) {
  //     console.error('Error fetching or processing monthly salaries:', error);
  //     setError('Failed to fetch or process monthly salaries');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchMonthlySalaries = async () => {
    setLoading(true);
    try {      
      const response = await apiWithAuth.get(`salaryaggregation/aggregatedmonthlysalaries/${selectedYear}`);
      const data = response.data.$values;
      const processedData = processAggregatedData(data);
      setMonthlySalaries(processedData);
      console.log("Processed monthly data is: ", processedData);
    } catch (error) {
      console.error('Error fetching monthly salaries:', error);
      setError('Failed to fetch monthly salaries');
    } finally {
      setLoading(false);
    }
  };
  
  function processAggregatedData(data) {
    const processedData = {};
    data.forEach(item => {
      const { personId, fullName, salaries, availableFrom, endDate } = item;
      if (salaries && salaries.$values) {
        processedData[personId] = salaries.$values.map(salaryPeriod => ({
          month: salaryPeriod.month,
          salary: salaryPeriod.salary,
          currency: salaryPeriod.currency,
          fullName: fullName,
          availableFrom: availableFrom,
          endDate: endDate
        }));
      } else {
        processedData[personId] = [];
      }
    });
    return processedData;
  }

  const fetchPreviousYearQ4Total = async () => {
    try {
      const response = await apiWithAuth.get('/QuarterlyDepartmentSalaryChange');
      if (response.status === 200 && response.data.$values) {
        const previousYearData = response.data.$values.find(item => item.year === selectedYear - 1);
        if (previousYearData) {
          setPreviousYearQ4Total(previousYearData.q4);
        } else {
          setPreviousYearQ4Total(0);
        }
      }
    } catch (error) {
      console.error('Error fetching Q4 total of the previous year:', error);
    }
  };

  const handleCalculateTotalSalaries = async () => {
    await fetchPreviousYearQ4Total();

    const response = await apiWithAuth.get('/QuarterlyDepartmentSalaryChange');
    const existingRecord = response.data.$values.find(item => item.year === selectedYear);
    setRecordIdToUpdate(existingRecord ? existingRecord.id : null);

    const totalsGBP = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

    Object.values(filteredMonthlySalaries).forEach(salaries => {
      salaries.forEach((salaryObj, index) => {
        const month = index % 12;
        const quarterIndex = Math.floor(month / 3);
        const quarterKey = `Q${quarterIndex + 1}`;
        if (salaryObj.salary !== null) {
          const salaryInGBP = convertToGBP(salaryObj.salary, salaryObj.currency);
          totalsGBP[quarterKey] += salaryInGBP;
        }
      });
    });
    Object.keys(totalsGBP).forEach(quarter => {
      totalsGBP[quarter] = Math.round(totalsGBP[quarter]);
    });
    setQuarterTotals(totalsGBP);

    const Q1CurrentYearTotal = totalsGBP.Q1;

    if (previousYearQ4Total && Q1CurrentYearTotal) {
      const percentageChangeFromQ4ToQ1 = calculateQuarterlyChange(Q1CurrentYearTotal, previousYearQ4Total);
      console.log(`Percentage change from Q4 of previous year to Q1 of selected year: ${percentageChangeFromQ4ToQ1}`);
    }
  };

  const calculateYearlySalary = (salaries) => {

    const totalsByCurrency = salaries.reduce((acc, salaryObj) => {
      if (salaryObj.salary !== null) {
        acc[salaryObj.currency] = (acc[salaryObj.currency] || 0) + salaryObj.salary;
      }
      return acc;
    }, {});

    return Object.entries(totalsByCurrency)
      .map(([currency, total]) => `${total.toFixed(0)} ${currency}`)
      .join(', ');
  };

  const calculateQuarterlyChange = (current, previous) => {
    if (!previous || previous === 0 || !current || current === 'N/A') {
      return 0;
    }
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  };

  const quarterChanges = [
    calculateQuarterlyChange(quarterTotals.Q1, previousYearQ4Total),
    calculateQuarterlyChange(quarterTotals.Q2, quarterTotals.Q1),
    calculateQuarterlyChange(quarterTotals.Q3, quarterTotals.Q2),
    calculateQuarterlyChange(quarterTotals.Q4, quarterTotals.Q3),
  ];

  const calculateTotalYearlySalary = () => {
    return Object.values(quarterTotals).reduce((sum, value) => sum + value, 0);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  //  --------------------------Forecasts------------------------------------------------
  const currentMonth = new Date().getMonth();

  const monthlyForecasts = Object.values(filteredMonthlySalaries).map((salaries) =>
    salaries.slice(0, currentMonth + 1).map((salaryObj) =>
      salaryObj?.salary ? convertToGBP(salaryObj.salary, salaryObj.currency) : 0
    )
  );

  console.log("Monthly forecasts in GBP:", monthlyForecasts);

  const quarterlyForecasts = Object.values(filteredMonthlySalaries).map((salaries) => {
    const quarterlySums = [0, 0, 0, 0];

    for (let i = 0; i < salaries.length; i++) {
      const quarterIndex = Math.floor(i / 3);
      const salaryObj = salaries[i];
      if (salaryObj?.salary) {
        quarterlySums[quarterIndex] += convertToGBP(salaryObj.salary, salaryObj.currency);
      }
    }

    return quarterlySums;
  });

  console.log("Quarterly forecasts in GBP for each employee:", quarterlyForecasts);
  //  --------------------------Forecasts End------------------------------------------------

  const handleSaveQuarterlyTotals = async () => {
    try {
      const data = {
        year: selectedYear,
        Q1: quarterTotals.Q1,
        Q2: quarterTotals.Q2,
        Q3: quarterTotals.Q3,
        Q4: quarterTotals.Q4,
        Total: calculateTotalYearlySalary(),
        DepartmentId: 1, // ID отдела, если это требуется на будущее
      };

      const response = await apiWithAuth.post('/QuarterlyDepartmentSalaryChange', data);

      if (response.status === 201) {
        setSnackbarMessage('Data saved successfully.');
        setSnackbarOpen(true);
      } else {
        console.error('Failed to save quarterly totals:', response.status);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setSnackbarMessage('Data for the selected year already exists.');
      } else {
        setSnackbarMessage('An error occurred.');
      }
      setSnackbarOpen(true);
    }
  };

  const handleUpdateQuarterlyTotals = async () => {
    if (!recordIdToUpdate) {
      console.error('No record selected for update.');
      setSnackbarMessage('No record selected for update.');
      setSnackbarOpen(true);
      return;
    }
    try {
      const dataToUpdate = {
        id: recordIdToUpdate,
        year: selectedYear,
        Q1: quarterTotals.Q1,
        Q2: quarterTotals.Q2,
        Q3: quarterTotals.Q3,
        Q4: quarterTotals.Q4,
        Total: calculateTotalYearlySalary(),
        DepartmentId: 1, // актуальный ID отдела
      };

      const response = await apiWithAuth.put(`/QuarterlyDepartmentSalaryChange/${recordIdToUpdate}`, dataToUpdate);

      if (response.status === 204) {
        setSnackbarMessage('Data updated successfully.');
        setSnackbarOpen(true);
      } else {
        console.error('Failed to update quarterly totals:', response.status);
        setSnackbarMessage('Failed to update quarterly totals.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('An error occurred while updating the data:', error);
      setSnackbarMessage('An error occurred while updating the data.');
      setSnackbarOpen(true);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const hasMonthlyData = filteredMonthlySalaries && Object.keys(filteredMonthlySalaries).length > 0;

  return (
    <div>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button variant="contained" onClick={handleCalculateTotalSalaries} sx={{ width: { xs: '100%', sm: 240 } }}>
              Calculate Total Salaries
            </Button>
            <FormControlLabel
              control={
                <Switch
                  checked={showActiveOnly}
                  onChange={(event) => setShowActiveOnly(event.target.checked)}
                  color="primary"
                />
              }
              label="Show active employees only"
            />
          </Stack>
          <FormControl sx={{ width: 240 }}>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              id="year-select"
              value={selectedYear}
              label="Год"
              onChange={handleYearChange}
            >
              <MenuItem value={2022}>2022</MenuItem>
              <MenuItem value={2023}>2023</MenuItem>
              <MenuItem value={2024}>2024</MenuItem>
              <MenuItem value={2025}>2025</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSaveQuarterlyTotals} sx={{ width: 240, marginBottom: 2 }}>
            Save Quarterly Totals
          </Button>
          <Button variant="contained" onClick={handleUpdateQuarterlyTotals} sx={{ width: 240, marginBottom: 2 }}>
            Update Quarterly Totals
          </Button>
        </Box>

        <Box sx={{ width: '70%', height: '300px' }}>
          <QuarterlyGrowthChart quarterTotals={quarterTotals} quarterChanges={quarterChanges} />
        </Box>
      </Box>
      <Accordion sx={{ marginBottom: '30px', marginTop: '30px' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="billing-ratio-table-content"
          id="billing-ratio-table-header"
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
              transform: 'rotate(90deg)',
            },
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          <Typography>Billing Ratio Table</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BillingRatioTable
            monthlySalaries={filteredMonthlySalaries}
            currencyRates={currencyRates}
            currentMonth={currentMonth}
            year={selectedYear}
          />
        </AccordionDetails>
      </Accordion>
      <Box sx={{ width: '100%', height: 300 }}>
        <SalaryForecast
          monthlyForecasts={monthlyForecasts}
          currentMonth={new Date().getMonth()}
          yearlyMultiplier={0.08}
        />
      </Box>
      <TableContainer component={Paper} sx={{ marginBottom: 2, backgroundColor: '#f7f7f7' }}>
        <Table aria-label="quarterly totals table" size="small">
          <TableHead>
            <TableRow>
              <StyledHeaderCell>Q1</StyledHeaderCell>
              <StyledHeaderCell>Q2</StyledHeaderCell>
              <StyledHeaderCell>Q3</StyledHeaderCell>
              <StyledHeaderCell>Q4</StyledHeaderCell>
              <StyledHeaderCell>Total</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <CenteredTableCell>{quarterTotals.Q1} GBP</CenteredTableCell>
              <CenteredTableCell>{quarterTotals.Q2} GBP</CenteredTableCell>
              <CenteredTableCell>{quarterTotals.Q3} GBP</CenteredTableCell>
              <CenteredTableCell>{quarterTotals.Q4} GBP</CenteredTableCell>
              <CenteredTableCell>{calculateTotalYearlySalary()} GBP</CenteredTableCell>
            </TableRow>
            <TableRow>
              <CenteredTableCell>{quarterChanges.Q4toQ1}</CenteredTableCell>
              <CenteredTableCell>{quarterChanges.Q1toQ2}</CenteredTableCell>
              <CenteredTableCell>{quarterChanges.Q2toQ3}</CenteredTableCell>
              <CenteredTableCell>{quarterChanges.Q3toQ4}</CenteredTableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer component={Paper}>
        <Table aria-label="monthly salary table">
          <TableHead>
            <TableRow>
              <StyledHeaderCell>ID</StyledHeaderCell>
              <StyledHeaderCell>Name</StyledHeaderCell>
              {Array.from({ length: 4 }, (_, i) => (
                <StyledHeaderCell colSpan={3} key={i}>Q{i + 1}</StyledHeaderCell>
              ))}
              <StyledHeaderCell>Total Sum</StyledHeaderCell>
            </TableRow>
            <TableRow>
              <StyledHeaderCell style={{ borderBottom: 0 }} />
              <StyledHeaderCell style={{ borderBottom: 0 }} />
              {Array.from({ length: 12 }, (_, i) => (
                <StyledHeaderCell key={i}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</StyledHeaderCell>
              ))}
              {/* ячейка под общую сумму */}
              <StyledHeaderCell style={{ borderBottom: 0 }} />
            </TableRow>
          </TableHead>
          <TableBody>
  {Object.entries(filteredMonthlySalaries).map(([personId, salaries], rowIndex) => (
    <StyledTableRow key={personId}>
      <StyledTableCell component="th" scope="row">
        {rowIndex + 1}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {/* fullName is now directly available from the first salary object, if available */}
        {salaries.length > 0 ? salaries[0].fullName : 'Unknown'}
      </StyledTableCell>
      {salaries.map((salaryObj, index) => (
        <StyledTableCell key={index}>
          {salaryObj.salary ? `${salaryObj.salary} ${salaryObj.currency}` : '0'}
        </StyledTableCell>
      ))}
      <StyledTableCell className="totalColumn">
        {calculateYearlySalary(salaries)}
      </StyledTableCell>
    </StyledTableRow>
  ))}
  {!hasMonthlyData && (
    <StyledTableRow>
      <StyledTableCell colSpan={15} align="center">
        No data available for the selected filters.
      </StyledTableCell>
    </StyledTableRow>
  )}
</TableBody>
          <TableFooter>
          </TableFooter>
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

export default SalaryStatistics;