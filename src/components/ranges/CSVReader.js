import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { StyledHeaderCell, StyledTableCell, StyledTableRow } from '../../styles/Styles';
import {
  Button,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  Typography,
  Container
} from '@mui/material';

const CSVReader = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const filePath = process.env.PUBLIC_URL + '/sr.csv';

    fetch(filePath)
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          complete: (result) => {
            setData(result.data);
          },
          header: true,
          skipEmptyLines: true,
        });
      })
      .catch(error => console.error('Error loading the CSV file', error));
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      complete: (result) => {
        setData(result.data);
        saveToJsonFile(result.data);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const saveToJsonFile = (data) => {
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // cоздание ссылки для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sr.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="false" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h6" gutterBottom component="div">
        CSV Data
      </Typography>
      <Button
        variant="contained"
        component="label"
        sx={{ mb: 2 }}
      >
        Update Salary Ranges Data
        <input
          type="file"
          accept=".csv"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {data.length > 0 && (
        <TableContainer component={Paper} sx={{ width: '100%' }}>
        <Table sx={{ width: '100%' }} aria-label="simple table" stickyHeader>
          <TableHead>
            <StyledTableRow sx={{ backgroundColor: 'primary.main', '& .MuiTableCell-head': { color: 'white', fontWeight: 'bold' } }}>
              {Object.keys(data[0]).map((header, index) => (
                <StyledHeaderCell key={index}>{header}</StyledHeaderCell>
              ))}
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <StyledTableRow
                key={index}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }}}
              >
                {Object.values(row).map((value, cellIndex) => (
                  <StyledTableCell key={cellIndex}>{value}</StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      )}
    </Container>
  );
};

export default CSVReader;
