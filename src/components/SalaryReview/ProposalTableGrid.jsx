import React from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Checkbox, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAdjustmentSettings } from './AdjustmentSettingsContext';
import { DataGrid } from '@mui/x-data-grid';

const ProposalTable = ({
    isAccordionOpen,
    sortedAndFilteredItems,
    onSelectionModelChange,
    getLastSRTimerange,
    selectionModel
}) => {
    const { adjustmentSettings } = useAdjustmentSettings();

    const dataForGrid = sortedAndFilteredItems.map((item) => ({
        id: item.id,
        name: `${item.firstName} ${item.lastName}`,
        level: item.level,
        stream: item.stream,
        currentSalary: item.currentSalary,
        proposedNewSalary: item.proposedNewSalary,
        lastReviewDate: getLastSRTimerange(item.lastReviewDate),
        adjustment: item.adjustment,
        currency: item.currency,
        overflow: item.overflow,
    }));

    const columns = [
        { field: 'id', headerName: 'Person ID', width: 150 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'level', headerName: 'Title', width: 150 },
        { field: 'stream', headerName: 'Stream', width: 150 },
        { field: 'currentSalary', headerName: 'Current Salary', width: 150 },
        { field: 'lastReviewDate', headerName: 'Last SR Timerange', width: 200 },
        { field: 'proposedNewSalary', headerName: 'Proposed New Salary', width: 200 },
        {
            field: 'adjustment',
            headerName: 'Proposed Adjustment',
            width: 200,
            renderCell: (params) => {
                if (params.row.overflow) {
                    return <span style={{ color: 'red' }}>Overflow: {params.row.overflow}</span>;
                }
                return <span style={{ color: params.value > 0 ? 'green' : 'black' }}>{params.value}</span>;
            }
            
        },
        { field: 'currency', headerName: 'Currency', width: 150 },
    ];

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            {isAccordionOpen && (
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                        <Typography>Possible Proposals</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={dataForGrid}
                                columns={columns}
                                pageSize={5}
                                rowsPerPageOptions={[5]}
                                checkboxSelection
                                disableSelectionOnClick
                                onRowSelectionModelChange={onSelectionModelChange}
                                selectionModel={selectionModel}
                                logLevel='info'
                            />

                        </div>
                    </AccordionDetails>
                </Accordion>
            )}
        </Box>
    );
};

export default ProposalTable;
