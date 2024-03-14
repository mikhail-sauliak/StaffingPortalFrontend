import React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Измените MonthYearPicker, чтобы принимать value и onChange от родительского компонента
const MonthYearPicker = ({ value, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        views={['year', 'month']}
        label="Year and Month"
        minDate={new Date('2012-03-01')}
        maxDate={new Date('2030-01-01')}
        value={value}
        onChange={onChange}
        inputFormat="dd/MM/yyyy"
        renderInput={(params) => <TextField {...params} helperText={null} />}
      />
    </LocalizationProvider>
  );
};

export default MonthYearPicker;
