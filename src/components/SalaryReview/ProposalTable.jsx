// ProposalTable.jsx
import React from 'react';
import {
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    Typography,
    Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAdjustmentSettings } from './AdjustmentSettingsContext';
import { StyledHeaderCell, StyledTableCell } from '../../styles/Styles';

const ProposalTable = ({
    isAccordionOpen,
    sortedAndFilteredItems,
    handleSelectProposal,
    requestSort,
    getLastSRTimerange,
}) => {
    const { adjustmentSettings } = useAdjustmentSettings();    
    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
                {isAccordionOpen && (
                    <Accordion sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                                borderRadius: '4px', 
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                margin: '8px 0', 
                                width: 'auto', 
                                maxWidth: '250', 
                            }}
                        >
                            <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                                Possible Proposals
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ backgroundColor: 'background.paper' }}>
                            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                                <Table sx={{ minWidth: 650 }} aria-label="salary review table">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'primary.light', '& th': { fontWeight: 'bold', color: 'white' } }}>
                                            <StyledHeaderCell>Person ID</StyledHeaderCell>
                                            <StyledHeaderCell><Button onClick={() => requestSort('firstName')}>Name</Button></StyledHeaderCell>
                                            <StyledHeaderCell>Title</StyledHeaderCell>
                                            <StyledHeaderCell>Stream</StyledHeaderCell>
                                            <StyledHeaderCell>Current Salary</StyledHeaderCell>
                                            <StyledHeaderCell><Button onClick={() => requestSort('lastReviewDate')}>Last SR Timerange</Button></StyledHeaderCell>
                                            <StyledHeaderCell>Proposed New Salary</StyledHeaderCell>
                                            <StyledHeaderCell>Proposed Adjustment</StyledHeaderCell>
                                            <StyledHeaderCell>Currency</StyledHeaderCell>
                                            <StyledHeaderCell>Check</StyledHeaderCell> 
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {sortedAndFilteredItems.map((proposal, index) => (
                                        <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                                        <TableCell>{proposal.id}</TableCell>
                                        <TableCell>{proposal.firstName} {proposal.lastName}</TableCell>
                                        <TableCell>{proposal.level}</TableCell>
                                        <TableCell>{proposal.stream}</TableCell>
                                        <TableCell>{proposal.currentSalary}</TableCell>
                                        <TableCell>{getLastSRTimerange(proposal.lastReviewDate)}</TableCell> 
                                        <TableCell>{proposal.proposedNewSalary}</TableCell>
                                        <TableCell style={{
                                            color: proposal.overflow ? 'red' : (proposal.adjustment > 0 ? 'green' : 'black')
                                        }}>
                                            {proposal.overflow ? `Overflow: ${proposal.overflow}` : proposal.adjustment}
                                        </TableCell>
                                        <TableCell>{proposal.currency}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={proposal.isSelected} // чекбокс, связанный с каждым предложением
                                                onChange={() => handleSelectProposal(proposal.id)} // для выбора/снятия выбора предложения
                                            />
                                        </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                )}
            </Box>
            );
        };
        
        export default ProposalTable;