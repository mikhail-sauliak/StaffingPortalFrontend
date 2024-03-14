import { useState, useEffect, useCallback } from 'react';
import { Slider, Box, Typography, TextField, Grid } from '@mui/material';
import { useAdjustmentSettings } from './AdjustmentSettingsContext';
import { debounce } from 'lodash';

const AdjustmentSlider = ({ currency, range, onChange }) => {
    const { adjustmentSettings, setAdjustmentSettings } = useAdjustmentSettings();
    const [minValue, setMinValue] = useState(range[0]);
    const [maxValue, setMaxValue] = useState(range[1]);
    const debouncedOnChange = useCallback(debounce(onChange, 1000), []);

    useEffect(() => {
        debouncedOnChange(currency, [minValue, maxValue]);
    }, [currency, minValue, maxValue, debouncedOnChange]);

    return (
        <Box sx={{ mb: 2 }}>
            <Typography id={`${currency}-range-slider`} gutterBottom>
                {currency} Adjustment
            </Typography>
            <Slider
                min={0}
                max={10000}
                step={50}
                value={[minValue, maxValue]}
                onChange={(event, newValue) => {
                    setMinValue(newValue[0]);
                    setMaxValue(newValue[1]);
                }}
                valueLabelDisplay="auto"
                aria-labelledby={`${currency}-range-slider`}
                sx={{ root: { width: '85%' } }} 
            />
            <Grid container spacing={1} justifyContent="space-between" alignItems="center">
                <Grid item xs={6}>
                    <TextField
                        label="Min"
                        type="number"
                        value={minValue}
                        onChange={(e) => setMinValue(Number(e.target.value))}
                        size="small" 
                        InputProps={{ style: { fontSize: 12 } }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Max"
                        type="number"
                        value={maxValue}
                        onChange={(e) => setMaxValue(Number(e.target.value))}
                        size="small" 
                        InputProps={{ style: { fontSize: 12 } }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdjustmentSlider;
