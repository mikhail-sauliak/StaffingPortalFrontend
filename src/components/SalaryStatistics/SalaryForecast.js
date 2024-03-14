import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableHead, TextField, Button, Paper } from '@mui/material';
import {
    StyledTableContainer,
    StyledHeaderCell,
    StyledTableCell,
    StyledTableRow
} from '../../styles/Styles';

const SalaryForecastComponent = ({ monthlyForecasts, currentMonth, yearlyMultiplier }) => {
  const [multiplier, setMultiplier] = useState(yearlyMultiplier);
  const [forecastedSalaries, setForecastedSalaries] = useState([]);
  const [realMonthlyMultipliers, setRealMonthlyMultipliers] = useState([]);
  const [averageSalaries, setAverageSalaries] = useState([]);
  const [monthlySalaryDifferences, setMonthlySalaryDifferences] = useState([]);

  useEffect(() => {
    let monthlyTotals = Array(12).fill(0);
    monthlyForecasts.forEach(salaries => {
      salaries.forEach((salary, index) => {
        monthlyTotals[index] += parseFloat(salary) || 0;
      });
    });
  
    let realChanges = [];
    if (currentMonth > 0) {
      let previousMonthSalary = monthlyTotals[0];
      for (let month = 0; month <= currentMonth; month++) {
        let change = (monthlyTotals[month] - previousMonthSalary) / previousMonthSalary;
        realChanges.push(change);
        previousMonthSalary = monthlyTotals[month];
      }
    }
  
    let accumulatedIncrease = realChanges.reduce((acc, change) => acc + change, 0);
    let remainingMonths = 11 - currentMonth;
    let remainingIncrease = multiplier - accumulatedIncrease; 
    let monthlyMultiplierForForecast = remainingMonths > 0 ? remainingIncrease / remainingMonths : 0;   
    
    if (remainingMonths > 0) {
      for (let month = currentMonth + 1; month < 12; month++) {
        monthlyTotals[month] = monthlyTotals[month - 1] * (1 + monthlyMultiplierForForecast);
      }
    }

    let salaryDifferences = forecastedSalaries.map((salary, index, arr) => {
        if (index === 0) return 0; // для первого месяца нет предыдущего значения, возвращаем 0 или null
        return salary - arr[index - 1];
      });
    setMonthlySalaryDifferences(salaryDifferences);

    setForecastedSalaries(monthlyTotals);
    let adjustedMultipliers = realChanges.concat(Array(12 - realChanges.length).fill(monthlyMultiplierForForecast));
    setRealMonthlyMultipliers(adjustedMultipliers);

    const averages = monthlyTotals.map((total, index) => total / monthlyForecasts.length);
    setAverageSalaries(averages);
  }, [monthlyForecasts, currentMonth, multiplier, forecastedSalaries]);

  const handleChangeMultiplier = (event) => {
    setMultiplier(parseFloat(event.target.value) || 0);
  };

  return (
    <Box>
      <TextField
        label="Annual Increase Multiplier"
        type="number"
        variant="outlined"
        value={multiplier}
        onChange={handleChangeMultiplier}
        inputProps={{ step: "0.01", min: "0", max: "1" }}
      />
      <Button onClick={() => setMultiplier(0.03)}>Set to Default Multiplier</Button>
      <StyledTableContainer component={Paper}>
        <Table>
        <TableHead>
            <StyledTableRow>
              <StyledHeaderCell>Description</StyledHeaderCell>
              {Array.from({ length: 12 }, (_, index) => (
                <StyledHeaderCell key={index}>{new Date(2020, index).toLocaleString('default', { month: 'short' })}</StyledHeaderCell>
              ))}
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow>
            <StyledTableCell>Forecasted Salary</StyledTableCell>
              {forecastedSalaries.map((salary, index) => (
                <StyledTableCell key={index}>{salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StyledTableCell>
              ))}
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCell>Salary Difference</StyledTableCell>
              {monthlySalaryDifferences.map((difference, index) => (
                <StyledTableCell key={index}>
                  {difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </StyledTableCell>
              ))}
            </StyledTableRow>
            <StyledTableRow>
            <StyledTableCell>Real Multiplier</StyledTableCell>
              {realMonthlyMultipliers.map((multiplier, index) => (
                <StyledTableCell key={index}>{(multiplier * 100).toFixed(2) + '%'}</StyledTableCell>
              ))}
            </StyledTableRow>
            <StyledTableRow>
            <StyledTableCell>Average Salary</StyledTableCell>
              {averageSalaries.map((avgSalary, index) => (
                <StyledTableCell key={index}>{avgSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StyledTableCell>
              ))}
            </StyledTableRow>
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Box>
  );
};

export default SalaryForecastComponent;


