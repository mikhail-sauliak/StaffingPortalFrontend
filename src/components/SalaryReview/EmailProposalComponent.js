import React from 'react';
import { Modal, Button, Box, Typography, TableRow, TableContainer, Paper, Table, TableHead, TableBody } from '@mui/material';
import { StyledTableCell } from '../../styles/Styles';

function copyToClipboard(elementId) {
    const table = document.getElementById(elementId);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(table);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    alert('Table is copied'); 
  }

function EmailProposalComponent({ proposals, selectedProposals, isModalOpen, onCloseModal }) {
 
      const renderModalContent = () => {
        
        const selectedData = Array.isArray(proposals)
        ? proposals.filter(proposal => selectedProposals.includes(proposal.id))
        : [];
    
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    Copy and Paste the following table into your email:
                </Typography>
                <Button onClick={() => copyToClipboard('table-1')}>Copy Table</Button>
                <TableContainer component={Paper} id="table-1">
                    <Table aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>№</StyledTableCell>
                                <StyledTableCell>Name</StyledTableCell>
                                <StyledTableCell>Location</StyledTableCell>
                                <StyledTableCell>Job Title</StyledTableCell>
                                <StyledTableCell>Last Review Date</StyledTableCell>
                                <StyledTableCell>Type of Contract</StyledTableCell>
                                <StyledTableCell>Current Salary</StyledTableCell>
                                <StyledTableCell>Salary Change</StyledTableCell>
                                <StyledTableCell>DM</StyledTableCell>
                                <StyledTableCell>TM</StyledTableCell>
                                <StyledTableCell>Effective From</StyledTableCell>
                                <StyledTableCell>When Received</StyledTableCell>
                                <StyledTableCell>Reason for Review</StyledTableCell>
                                <StyledTableCell>Comments</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedData.map((proposal, index) => (
                                <TableRow key={index}>
                                    <StyledTableCell component="th" scope="row">
                                        {index + 1}
                                    </StyledTableCell>
                                    <StyledTableCell>{proposal.name || 'N/A'}</StyledTableCell>
                                    <StyledTableCell>{proposal.location || 'N/A'}</StyledTableCell>
                                    <StyledTableCell>{proposal.jobTitle || 'N/A'}</StyledTableCell>
                                    <StyledTableCell>{proposal.lastReviewDate}</StyledTableCell>
                                    <StyledTableCell>{proposal.typeOfContract || 'N/A'}</StyledTableCell>
                                    <StyledTableCell>{proposal.currentSalary}</StyledTableCell>
                                    <StyledTableCell>{proposal.salaryChange}</StyledTableCell>
                                    <StyledTableCell>{proposal.dm}</StyledTableCell>
                                    <StyledTableCell>{proposal.tm}</StyledTableCell>
                                    <StyledTableCell>{proposal.effectiveFrom}</StyledTableCell>
                                    <StyledTableCell>{proposal.whenReceived}</StyledTableCell>
                                    <StyledTableCell>{proposal.reasonForReview}</StyledTableCell>
                                    <StyledTableCell>{proposal.comments}</StyledTableCell> 
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button onClick={onCloseModal} sx={{ marginTop: 2 }}>Close</Button>
            </Box>
        );
    };

    return (
        <div>
            <Modal open={isModalOpen} onClose={onCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box
                    sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'auto', 
                    maxWidth: 'calc(100% - 64px)', 
                    maxHeight: 'calc(100% - 64px)', 
                    overflow: 'scroll', 
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    }}
                >
                    {renderModalContent()}
                </Box>
            </Modal>
        </div>
    );
}

export default EmailProposalComponent;
