import React, { useState } from 'react';
import useFetchManagers from '../hooks/useFetchManagers';
import { levelOptions, streamOptions, techStackOptions } from '../hooks/selectOptions';
import { StyledHeaderCell, StyledTableCell, StyledTableRow, DeleteButton } from '../../styles/Styles'
import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { format } from 'date-fns';

const EditableTable = ({
    people,
    editablePersonId,
    setEditablePersonId,
    handlePersonChange,
    handleSaveChanges,
    toggleEdit,
    handleDeleteClick,
    isCreatingNewPerson,
    newPerson,
    handleInputChange,
    saveNewPerson,
    cancelCreatingNewPerson,
    apiWithAuth,
    fetchPeople,
    formData,
    setFormData,
    setPeople,
    handleTechStackChange
}) => {   
    const [divisionManagers, talentManagers, updateTalentManagersList] = useFetchManagers();    

    const [openDialog, setOpenDialog] = useState(false);
    const [deletingPersonId, setDeletingPersonId] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
    const [selectedDivisionManagerId, setSelectedDivisionManagerId] = useState('');
    const [selectedTalentManagerId, setSelectedTalentManagerId] = useState('');

    const handleDivisionManagerChange = (event, personId) => {
        const divisionManagerId = event.target.value;

        const updatedPeople = people.map(person => 
                person.id === personId ? { ...person, divisionManagerId: divisionManagerId } : person
            );
        setPeople(updatedPeople);        
        updateTalentManagersList(divisionManagerId);
    };

    const handleDivisionManagerChangeNewEmployee = (event) => {
        const divisionManagerId = event.target.value;
        
        setSelectedDivisionManagerId(divisionManagerId);
        
        setFormData({ ...formData, divisionManagerId: divisionManagerId });
        console.log(`Selected DM id is:${divisionManagerId}`)
        updateTalentManagersList(divisionManagerId);
    };
    
    const handleTalentManagerChange = (event, personId) => {
        const talentManagerId = event.target.value;
        if (personId) {
            // данные в массиве people для конкретного пользователя
            const updatedPeople = people.map(person => 
                person.id === personId ? { ...person, talentManagerId: talentManagerId } : person
            );
            setPeople(updatedPeople);
        } else {
        setSelectedTalentManagerId(talentManagerId);
        setFormData({ ...formData, talentManagerId: talentManagerId });
        }
    };

    const handleTalentManagerChangeNewEmployee = (event, personId) => {
        const talentManagerId = event.target.value;
        
        setSelectedTalentManagerId(talentManagerId);
        setFormData({ ...formData, talentManagerId: talentManagerId });        
    };

    const handleConfirmDeleteClick = (personId) => {
        setDeletingPersonId(personId);
        setOpenDialog(true);
    };

    const handleDelete = async () => {
        await apiWithAuth.delete(`people/${deletingPersonId}`);
        fetchPeople();
        setSnackbar({ open: true, message: 'Deleted successfully', severity: 'error' });
        setOpenDialog(false);
    };

    const renderLevelOptions = () => {
        return levelOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ));
    };

    const renderStreamOptions = () => {
        return streamOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ));
    };
    
    const renderTechStackOptions = () => {
        return techStackOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ));
    };   

        return (
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="editable table">
                    <TableHead>
                        <StyledTableRow>
                            <StyledHeaderCell>First Name</StyledHeaderCell>
                            <StyledHeaderCell>Last Name</StyledHeaderCell>
                            <StyledHeaderCell>Location</StyledHeaderCell>
                            <StyledHeaderCell>Division Manager</StyledHeaderCell>
                            <StyledHeaderCell>Talent Manager</StyledHeaderCell>
                            <StyledHeaderCell>Available From</StyledHeaderCell>
                            <StyledHeaderCell>Tech Stack</StyledHeaderCell>
                            <StyledHeaderCell>Stream</StyledHeaderCell>
                            <StyledHeaderCell>Level</StyledHeaderCell>
                            <StyledHeaderCell>Role</StyledHeaderCell>
                            <StyledHeaderCell>Action</StyledHeaderCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {/* форма для создания новой записи */}
                        {isCreatingNewPerson && (
                            <StyledTableRow>
                                <StyledTableCell>
                                    <TextField size="small" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <TextField size="small" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <TextField size="small" name="location" value={formData.location} onChange={handleInputChange} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="new-divisionManager-select-label">Division Manager</InputLabel>
                                        <Select
                                            labelId="new-divisionManager-select-label"
                                            id="new-divisionManager-select"
                                            name="divisionManagerId"
                                            value={formData.divisionManagerId}
                                            onChange={handleDivisionManagerChangeNewEmployee}
                                            label="Division Manager"
                                        >
                                            {divisionManagers.map((manager) => (
                                                <MenuItem key={manager.value} value={manager.value}>
                                                    {manager.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Talent Manager</InputLabel>
                                        <Select
                                            value={formData.talentManagerId}
                                            onChange={handleTalentManagerChangeNewEmployee}
                                            label="Talent Manager"
                                        >
                                            {talentManagers.map(manager => (
                                                <MenuItem key={manager.value} value={manager.value}>
                                                    {manager.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <TextField size="small" type="date" name="availableFrom" value={formData.availableFrom} onChange={handleInputChange} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <InputLabel id="new-level-select-label">TechStack</InputLabel>
                                    <Select
                                        labelId="new-techstack-select-label"
                                        id="new-techstack-select"
                                        name="techstack"
                                        multiple
                                        value={formData.techStack}
                                        onChange={handleTechStackChange}
                                        label="TechStack"
                                    >
                                        {techStackOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                        ))}
                                    </Select>
                                    </StyledTableCell>
                                <StyledTableCell>
                                    <InputLabel id="new-level-select-label">Stream</InputLabel>
                                    <Select
                                        labelId="new-stream-select-label"
                                        id="new-stream-select"
                                        name="stream"
                                        value={formData.stream}
                                        onChange={handleInputChange}
                                        label="Stream"
                                    >
                                        {renderStreamOptions()}
                                    </Select>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="new-level-select-label">Level</InputLabel>
                                        <Select
                                            labelId="new-level-select-label"
                                            id="new-level-select"
                                            name="level"
                                            value={formData.level}
                                            onChange={handleInputChange}
                                            label="Level"
                                        >
                                            {renderLevelOptions()}
                                        </Select>
                                    </FormControl>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <TextField size="small" name="role" value={formData.role} onChange={handleInputChange} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Stack direction="column" spacing={1}>
                                        <Button variant="outlined" color="success" onClick={saveNewPerson} sx={{ mr: 1 }}>
                                            Save
                                        </Button>
                                        <Button variant="outlined" color="error" onClick={cancelCreatingNewPerson}>
                                            Cancel
                                        </Button>
                                    </Stack>
                                </StyledTableCell>
                            </StyledTableRow>
                        )}
                        {/* отображение существующих записей */}
                        {people.map((person) => (
                            <StyledTableRow key={person.id}>
                                {/* FirstName */}
                                <StyledTableCell component="th" scope="row">
                                    {editablePersonId === person.id ? (
                                        <TextField
                                            size="small"
                                            value={person.firstName}
                                            onChange={(e) => handlePersonChange('firstName', person.id, e)}
                                            fullWidth
                                        />
                                    ) : (
                                        person.firstName
                                    )}
                                </StyledTableCell>
                                {/* LastName */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <TextField
                                            size="small"
                                            value={person.lastName}
                                            onChange={(e) => handlePersonChange('lastName', person.id, e)}
                                            fullWidth
                                        />
                                    ) : (
                                        person.lastName
                                    )}
                                </StyledTableCell>
                                {/* Location */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <TextField
                                            size="small"
                                            value={person.location}
                                            onChange={(e) => handlePersonChange('location', person.id, e)}
                                            fullWidth
                                        />
                                    ) : (
                                        person.location
                                    )}
                                </StyledTableCell>
                                {/* DivisionManagerId */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="new-divisionManager-select-label">Division Manager</InputLabel>
                                            <Select
                                                labelId="new-divisionManager-select-label"
                                                id="new-divisionManager-select"
                                                name="divisionManagerId"
                                                value={person.divisionManagerId}
                                                onChange={(e) => handleDivisionManagerChange(e, person.id)}
                                                label="Division Manager"
                                            >
                                                {divisionManagers.map((manager) => (
                                                    <MenuItem key={manager.value} value={manager.value}>
                                                        {manager.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        // имя менеджера, если не  редактируем
                                        divisionManagers.find(manager => manager.value === person.divisionManagerId)?.label || "N/A"
                                    )}
                                </StyledTableCell>
                                {/* TalentManagerId */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Talent Manager</InputLabel>
                                            <Select
                                                value={person.talentManagerId}
                                                onChange={(e) => handleTalentManagerChange(e, person.id)}
                                                label="Talent Manager"
                                            >
                                                {talentManagers.map(manager => (
                                                    <MenuItem key={manager.value} value={manager.value}>
                                                        {manager.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        //достаточно достать из массива имя, которое приходит от родителя                                        
                                        person.talentManagerName
                                    )}
                                </StyledTableCell>
                                {/* AvailableFrom */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <TextField
                                            size="small"
                                            type="date"
                                            value={editablePersonId === person.id ? format(new Date(person.availableFrom), 'yyyy-MM-dd') : ''}
                                            onChange={(e) => handlePersonChange('availableFrom', person.id, e)}
                                            fullWidth
                                        />
                                    ) : (
                                        format(new Date(person.availableFrom), 'dd-MM-yyyy')
                                    )}
                                </StyledTableCell>
                                {/* TechStack */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <FormControl fullWidth size="small">
                                            <InputLabel id={`techstack-select-label-${person.id}`}>TechStack</InputLabel>
                                            <Select
                                                labelId="new-techstack-select-label"
                                                id="new-techstack-select"
                                                name="techstack"
                                                multiple
                                                value={formData.techStack}
                                                onChange={handleTechStackChange}
                                                label="TechStack"
                                            >
                                                {techStackOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        person.techStack
                                    )}
                                </StyledTableCell>
                                {/* Stream */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <FormControl fullWidth size="small">
                                            <InputLabel id={`stream-select-label-${person.id}`}>Stream</InputLabel>
                                            <Select
                                                labelId={`stream-select-label-${person.id}`}
                                                id={`stream-select-${person.id}`}
                                                value={person.stream}
                                                onChange={(e) => handlePersonChange('stream', person.id, e)}
                                                label="Stream"
                                            >
                                                {renderStreamOptions()}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        person.stream
                                    )}
                                </StyledTableCell>
                                {/* Level */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <FormControl fullWidth size="small">
                                            <InputLabel id={`level-select-label-${person.id}`}>Level</InputLabel>
                                            <Select
                                                labelId={`level-select-label-${person.id}`}
                                                id={`level-select-${person.id}`}
                                                value={person.level}
                                                onChange={(e) => handlePersonChange('level', person.id, e)}
                                                label="Level"
                                            >
                                                {renderLevelOptions()}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        person.level
                                    )}
                                </StyledTableCell>
                                {/* Role */}
                                <StyledTableCell>
                                    {editablePersonId === person.id ? (
                                        <TextField
                                            size="small"
                                            value={person.role}
                                            onChange={(e) => handlePersonChange('role', person.id, e)}
                                            fullWidth
                                        />
                                    ) : (
                                        person.role
                                    )}
                                </StyledTableCell>
                                {/* Actions */}
                                
                                    <StyledTableCell>
                                    <Stack direction="column" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => editablePersonId === person.id ? handleSaveChanges(person.id) : toggleEdit(person.id)}
                                            sx={{ mr: 1 }}
                                        >
                                            {editablePersonId === person.id ? 'Save' : 'Edit'}
                                        </Button>
                                        {editablePersonId === person.id ? (
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => setEditablePersonId(null)}
                                            >
                                                Cancel
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleConfirmDeleteClick(person.id)}
                                            >
                                                Delete
                                            </Button >
                                        )}
                                        </Stack>
                                    </StyledTableCell>
                                
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete this person?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} color="secondary" autoFocus>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </TableContainer>
        );
    };

    export default EditableTable;