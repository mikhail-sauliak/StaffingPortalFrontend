import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { apiWithAuth } from './api';
import { processDataForRow } from './csvParserUtils';
import {
    StyledTableContainer,
    StyledHeaderCell,
    StyledTableCell,
    StyledTableRow
} from '../styles/Styles';
import {
    Button,
    Table,
    TableBody,
    TableHead,
    TableRow,
    Container,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Paper,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';


const StyledFormGroup = styled(FormGroup)(({ theme }) => ({
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(2),
}));

const FileUploader = () => {
    const [rows, setRows] = useState([]);
    const [activeColumns, setActiveColumns] = useState([]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const fileExtension = file.name.split('.').pop();

        const reader = new FileReader();
        reader.onload = (event) => {
            let headers;
            if (fileExtension === 'csv') {
                Papa.parse(event.target.result, {
                    complete: (result) => {
                        setRows(result.data);
                        headers = result.data[0];
                    },
                    header: true,
                });
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setRows(json);
                headers = json[0];
            }
            setActiveColumns(headers.map((_, index) => index)); 
        };

        if (fileExtension === 'csv') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    const handleColumnChange = (event, index) => {
        const newActiveColumns = [...activeColumns];
        if (event.target.checked) {
            newActiveColumns.push(index);
        } else {
            const position = newActiveColumns.indexOf(index);
            newActiveColumns.splice(position, 1);
        }
        setActiveColumns(newActiveColumns.sort());
    };

    const handleSendData = async () => {
        // первая строка содержит заголовки, а данные начинаются со второй строки
        const dataToSend = rows.slice(1).map(row => processDataForRow(row));
        
        // каждый объект в API
        for (const data of dataToSend) {
          try {
            await apiWithAuth.post('people', data);
            console.log('Data sent successfully');
          } catch (error) {
            console.error('Error sending data', error);
          }
        }
      };

    return (
        <Container maxWidth="false" sx={{ mt: 4 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} display="flex" justifyContent="center">
              <Button variant="contained" component="label">
                Upload File
                <input type="file" accept=".csv, .xls, .xlsx" hidden onChange={handleFileUpload} />
              </Button>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="center">
              <Button variant="contained" color="primary" onClick={handleSendData}>
                Send Data
              </Button>
            </Grid>
            {rows.length > 0 && (
              <>
                <Grid item xs={12}>
                  <StyledFormGroup>
                    {rows[0].map((header, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={activeColumns.includes(index)}
                            onChange={(event) => handleColumnChange(event, index)}
                            name={header}
                          />
                        }
                        label={header}
                        sx={{ minWidth: 150 }}
                      />
                    ))}
                  </StyledFormGroup>
                </Grid>
                <Grid item xs={12}>
                  <StyledTableContainer component={Paper}>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          {rows[0].filter((_, index) => activeColumns.includes(index)).map((header, index) => (
                            <StyledHeaderCell key={index}>{header}</StyledHeaderCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.slice(1).map((row, rowIndex) => (
                          <StyledTableRow key={rowIndex}>
                            {row.filter((_, cellIndex) => activeColumns.includes(cellIndex)).map((cell, cellIndex) => (
                              <StyledTableCell key={cellIndex}>{cell}</StyledTableCell>
                            ))}
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                </Grid>
              </>
            )}
          </Grid>
        </Container>
      );
};

export default FileUploader;
