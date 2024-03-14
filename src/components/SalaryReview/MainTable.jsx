import React from 'react';
import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TextField,
    MenuItem,
    Checkbox,
    Button,
    Stack,
    IconButton
} from '@mui/material';
import { StyledHeaderCell, StyledTableCell, StyledTableRow } from '../../styles/Styles';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { format } from 'date-fns';

const MainTable = ({
    isCreatingNewReview,
    formData,
    handleChange,
    people,
    reviews,
    handleCreateSave,
    handleCreateCancel,
    editingReviewId,
    getHighlightClass,
    getPersonName,
    getPersonTitle,
    handleSave,
    handleCancel,
    handleEdit,
    handleDeleteClick
}) => {
    return (
        < TableContainer component = { Paper } >

            <Table sx={{ minWidth: 650, maxWidth: '100%' }} aria-label="salary review table">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5', '& th': { fontWeight: 'bold', color: 'white' } }}>
                        <StyledHeaderCell>Id</StyledHeaderCell>
                        <StyledHeaderCell>Person Name</StyledHeaderCell>
                        <StyledHeaderCell>Title</StyledHeaderCell>
                        <StyledHeaderCell>Review Date</StyledHeaderCell>
                        <StyledHeaderCell>Justification</StyledHeaderCell>
                        <StyledHeaderCell>Previous Salary</StyledHeaderCell>
                        <StyledHeaderCell>Proposed Salary</StyledHeaderCell>
                        <StyledHeaderCell>Currency</StyledHeaderCell>
                        <StyledHeaderCell>Contract Type</StyledHeaderCell>
                        <StyledHeaderCell>Salary Start</StyledHeaderCell>
                        <StyledHeaderCell>Salary Received</StyledHeaderCell>
                        <StyledHeaderCell>DM Comments</StyledHeaderCell>
                        <StyledHeaderCell>TM Comments</StyledHeaderCell>
                        <StyledHeaderCell>Is Approved</StyledHeaderCell>
                        <StyledHeaderCell>Actions</StyledHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isCreatingNewReview && (
                        <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                                New
                            </StyledTableCell>

                            <StyledTableCell>
                                <TextField
                                    select
                                    fullWidth
                                    label="Person"
                                    value={formData.personId}
                                    onChange={(e) => handleChange(e, 'personId')}
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    {people.map((person) => (
                                        <option key={person.id} value={person.id}>
                                            {`${person.firstName} ${person.lastName}`}
                                        </option>
                                    ))}
                                </TextField>
                            </StyledTableCell>
                            <StyledTableCell component="th" scope="row">
                                {people.level}
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    type="date"
                                    value={formData.reviewDate}
                                    onChange={(e) => handleChange(e, 'reviewDate')}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    value={formData.justification}
                                    onChange={(e) => handleChange(e, 'justification')}
                                    fullWidth
                                    multiline
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    value={formData.oldSalary}
                                    onChange={(e) => handleChange(e, 'oldSalary')}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    value={formData.proposedSalary}
                                    onChange={(e) => handleChange(e, 'proposedSalary')}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    select
                                    label="Currency"
                                    value={formData.currency}
                                    onChange={(e) => handleChange(e, 'currency')}
                                    fullWidth
                                >
                                    {['USD', 'PLN', 'EUR', 'BGN', 'AED'].map((currency) => (
                                        <MenuItem key={currency} value={currency}>
                                            {currency}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    select
                                    label="ContractType"
                                    value={formData.contractType}
                                    onChange={(e) => handleChange(e, 'contractType')}
                                    fullWidth
                                >
                                    {['B2B', 'EC'].map((contractType) => (
                                        <MenuItem key={contractType} value={contractType}>
                                            {contractType}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    type="date"
                                    value={formData.newSalaryStartDate}
                                    onChange={(e) => handleChange(e, 'newSalaryStartDate')}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    type="date"
                                    value={formData.salaryReceivedDate}
                                    onChange={(e) => handleChange(e, 'salaryReceivedDate')}
                                    fullWidth
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    value={formData.divisionManagerComments}
                                    onChange={(e) => handleChange(e, 'divisionManagerComments')}
                                    fullWidth
                                    multiline
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <TextField
                                    value={formData.talentManagerComments}
                                    onChange={(e) => handleChange(e, 'talentManagerComments')}
                                    fullWidth
                                    multiline
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <Checkbox
                                    checked={formData.isApproved}
                                    onChange={(e) => handleChange(e, 'isApproved')}
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                <Stack direction="column" spacing={1}>
                                    <Button onClick={handleCreateSave} variant="contained" color="primary">
                                        Save
                                    </Button>
                                    <Button onClick={handleCreateCancel} variant="outlined" color="secondary">
                                        Cancel
                                    </Button>
                                </Stack>
                            </StyledTableCell>
                        </StyledTableRow>
                    )}
                    {reviews.map((review) => {
                        const rowColor = getHighlightClass(review.newSalaryStartDate);
                        return (
                            <StyledTableRow key={review.id} sx={{ '& td': { borderColor: 'grey.300' }, bgcolor: rowColor }}>
                                <StyledTableCell component="th" scope="row">{review.id}</StyledTableCell>
                                <StyledTableCell className={getHighlightClass(review.newSalaryStartDate)}>
                                    {getPersonName(review.personId)}
                                </StyledTableCell>
                                <StyledTableCell>{getPersonTitle(review.personId)}</StyledTableCell>
                                {editingReviewId === review.id ? (
                                    <>
                                        <StyledTableCell>
                                            <TextField
                                                type="date"
                                                defaultValue={format(new Date(review.reviewDate), 'yyyy-MM-dd')}
                                                onChange={(e) => handleChange(e, 'reviewDate')}
                                                fullWidth
                                                style={{ minWidth: '100px', maxWidth: '120px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                multiline
                                                minRows={1} // минимальное количество строк
                                                maxRows={2} // максимальное количество строк, после которого будет прокрутка
                                                defaultValue={review.justification}
                                                onChange={(e) => handleChange(e, 'justification')}
                                                fullWidth
                                                style={{ minWidth: '100px', maxWidth: '120px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                defaultValue={review.oldSalary}
                                                onChange={(e) => handleChange(e, 'oldSalary')}
                                                fullWidth
                                                style={{ minWidth: '80px', maxWidth: '80px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                defaultValue={review.proposedSalary}
                                                onChange={(e) => handleChange(e, 'proposedSalary')}
                                                fullWidth
                                                style={{ minWidth: '80px', maxWidth: '80px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                select
                                                label="Currency"
                                                value={formData.currency}
                                                onChange={(e) => handleChange(e, 'currency')}
                                                fullWidth
                                            >
                                                {['USD', 'PLN', 'EUR', 'BGN', 'AED'].map((currency) => (
                                                    <MenuItem key={currency} value={currency}>
                                                        {currency}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                select
                                                label="СontractType"
                                                value={formData.contractType}
                                                onChange={(e) => handleChange(e, 'contractType')}
                                                fullWidth
                                            >
                                                {['B2B', 'EC'].map((contractType) => (
                                                    <MenuItem key={contractType} value={contractType}>
                                                        {contractType}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                type="date"
                                                defaultValue={format(new Date(review.newSalaryStartDate), 'yyyy-MM-dd')}
                                                onChange={(e) => handleChange(e, 'newSalaryStartDate')}
                                                fullWidth
                                                style={{ minWidth: '100px', maxWidth: '120px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                type="date"
                                                defaultValue={format(new Date(review.salaryReceivedDate), 'yyyy-MM-dd')}
                                                onChange={(e) => handleChange(e, 'salaryReceivedDate')}
                                                fullWidth
                                                style={{ minWidth: '100px', maxWidth: '120px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                multiline
                                                minRows={1}
                                                maxRows={2}
                                                defaultValue={review.divisionManagerComments}
                                                onChange={(e) => handleChange(e, 'divisionManagerComments')}
                                                fullWidth
                                                style={{ minWidth: '100px', maxWidth: '120px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <TextField
                                                multiline
                                                minRows={1}
                                                maxRows={2}
                                                defaultValue={review.talentManagerComments}
                                                onChange={(e) => handleChange(e, 'talentManagerComments')}
                                                fullWidth
                                                style={{ minWidth: '100px', maxWidth: '120px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Checkbox
                                                checked={review.isApproved}
                                                onChange={(e) => handleChange(e, 'isApproved')}
                                                style={{ minWidth: '50px', maxWidth: '60px' }}
                                            />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Stack direction="column" spacing={1}>
                                                <Button onClick={handleSave} variant="outlined" color="primary">Save</Button>
                                                <Button onClick={handleCancel} variant="outlined" color="secondary">Cancel</Button>
                                            </Stack>
                                        </StyledTableCell>
                                    </>
                                ) : (
                                    <>
                                        <StyledTableCell>{format(new Date(review.reviewDate), 'dd/MM/yyyy')}</StyledTableCell>
                                        <StyledTableCell>{review.justification}</StyledTableCell>
                                        <StyledTableCell>{review.oldSalary}</StyledTableCell>
                                        <StyledTableCell>{review.proposedSalary}</StyledTableCell>
                                        <StyledTableCell>{review.currency}</StyledTableCell>
                                        <StyledTableCell>{review.contractType}</StyledTableCell>
                                        <StyledTableCell>{format(new Date(review.newSalaryStartDate), 'dd/MM/yyyy')}</StyledTableCell>
                                        <StyledTableCell>{format(new Date(review.salaryReceivedDate), 'dd/MM/yyyy')}</StyledTableCell>
                                        <StyledTableCell>{review.divisionManagerComments}</StyledTableCell>
                                        <StyledTableCell>{review.talentManagerComments}</StyledTableCell>
                                        <StyledTableCell>
                                            <Checkbox checked={review.isApproved} disabled />
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            <Stack direction="column" spacing={1}>
                                                <IconButton onClick={() => handleEdit(review)} color="primary">
                                                    <Edit />
                                                </IconButton>
                                                <IconButton onClick={() => handleDeleteClick(review.id)} color="primary">
                                                    <Delete />
                                                </IconButton>
                                            </Stack>
                                        </StyledTableCell>
                                    </>
                                )}
                            </StyledTableRow>
                        );
                    })}
                </TableBody>
            </Table>
    </TableContainer >
  );
};

export default MainTable;