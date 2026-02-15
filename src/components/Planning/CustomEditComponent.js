import { useState } from 'react';
import { useGridApiContext } from '@mui/x-data-grid';

export function CustomMonthEditComponent(props) {
    const { id, value, field, editedCells, onCellEdit } = props;
    const apiRef = useGridApiContext();

    const handleValueChange = (event) => {
        const newValue = event.target.value;
        onCellEdit({ id, field, newValue });
        const monthIndex = parseInt(field.split('_')[1], 10);

        apiRef.current.setEditCellValue({ id, field, value: newValue });

        for (let i = monthIndex; i <= 12; i++) {
            const monthField = `month_${i}`;
            apiRef.current.setEditCellValue({ id, field: monthField, value: newValue });
        }

        apiRef.current.stopCellEditMode({ id, field });
    };

    return <input type="number" value={value} onChange={handleValueChange} />;
}