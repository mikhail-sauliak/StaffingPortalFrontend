import React from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { StyledHeaderCell, StyledTableCell, StyledTableRow } from '../../styles/Styles';

// const calculateBillability = (people, monthlySalaries, currencyRates, currentMonth, year) => {
//   const monthlyData = Array.from({ length: 12 }, () => ({
//     billableCount: 0,
//     nonBillableCount: 0,
//     totalSalaryBillable: 0,
//     totalSalaryNonBillable: 0,
//   }));

//   people.forEach(person => {
//     const salaries = monthlySalaries[person.id] || [];
//     const availableFrom = new Date(person.availableFrom);
//     const availableMonth = availableFrom.getMonth();
//     const availableYear = availableFrom.getFullYear();
//     const isSecondHalfOfMonth = availableFrom.getDate() > 15;

//     for (let month = 0; month < 12; month++) {
//       const salaryObj = salaries[month];
//       if (!salaryObj || !salaryObj.salary) continue;

//       const salaryInGBP = convertToGBP(salaryObj.salary, salaryObj.currency, currencyRates);
//       let isBillable;
//       if (availableYear > year || (availableYear === year && month < availableMonth)) {
//         isBillable = true;
//       } else if (availableYear === year && month === availableMonth) {
//         isBillable = isSecondHalfOfMonth ? false : true;
//       } else {
//         isBillable = false;
//       }

//       if (isBillable) {
//         monthlyData[month].billableCount++;
//         monthlyData[month].totalSalaryBillable += salaryInGBP;
//       } else {
//         monthlyData[month].nonBillableCount++;
//         monthlyData[month].totalSalaryNonBillable += salaryInGBP;
//       }

//       // console.log(`PersonID: ${person.id}, Month: ${month + 1}, IsBillable: ${isBillable}, SalaryInGBP: ${salaryInGBP}`);
//     }
//   });

//   return monthlyData;
// };
const calculateBillability = (monthlySalaries, currencyRates, currentMonth, year) => {
  const monthlyData = Array.from({ length: 12 }, () => ({
    billableCount: 0,
    nonBillableCount: 0,
    totalSalaryBillable: 0,
    totalSalaryNonBillable: 0,
  }));

  Object.entries(monthlySalaries).forEach(([personId, salaries]) => {
    salaries.forEach((salaryObj, month) => {
      if (!salaryObj || !salaryObj.salary) return;

      const availableFrom = new Date(salaryObj.availableFrom);
      const availableMonth = availableFrom.getMonth();
      const availableYear = availableFrom.getFullYear();
      const isSecondHalfOfMonth = availableFrom.getDate() > 15;

      const salaryInGBP = convertToGBP(salaryObj.salary, salaryObj.currency, currencyRates);
      let isBillable;

      if (availableYear > year || (availableYear === year && month < availableMonth)) {
        isBillable = true;
      } else if (availableYear === year && month === availableMonth) {
        isBillable = isSecondHalfOfMonth ? false : true;
      } else {
        isBillable = false;
      }

      if (isBillable) {
        monthlyData[month].billableCount++;
        monthlyData[month].totalSalaryBillable += salaryInGBP;
      } else {
        monthlyData[month].nonBillableCount++;
        monthlyData[month].totalSalaryNonBillable += salaryInGBP;
      }
    });
  });

  return monthlyData;
};


const convertToGBP = (amount, currency, currencyRates) => {
  // console.log(`Converting: amount = ${amount}, currency = ${currency}, rate = ${currencyRates[currency]}`);
  const rate = currencyRates[currency] || 1;
  const converted = amount / rate;
  // console.log(`Converted amount in GBP: £${converted}`);
  return converted;
};

const BillingRatioTable = ({ monthlySalaries, currencyRates, currentMonth, year }) => {
  const monthlyData = calculateBillability(monthlySalaries, currencyRates, currentMonth, year);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="billing ratio table">
        <TableHead>
          <TableRow>
            <StyledHeaderCell>Month</StyledHeaderCell>
            <StyledHeaderCell>Billable Count</StyledHeaderCell>
            <StyledHeaderCell>Non-Billable Count</StyledHeaderCell>
            <StyledHeaderCell>Total Salary (Billable)</StyledHeaderCell>
            <StyledHeaderCell>Total Salary (Non-Billable)</StyledHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {monthlyData.map((data, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{new Date(year, index).toLocaleString('default', { month: 'long' })}</StyledTableCell>
              <StyledTableCell>{data.billableCount}</StyledTableCell>
              <StyledTableCell>{data.nonBillableCount}</StyledTableCell>
              <StyledTableCell>£{data.totalSalaryBillable.toFixed(2)}</StyledTableCell>
              <StyledTableCell>£{data.totalSalaryNonBillable.toFixed(2)}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BillingRatioTable;
