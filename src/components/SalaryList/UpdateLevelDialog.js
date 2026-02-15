import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Button } from '@mui/material';
import { apiWithAuth } from '../../utils/api';

const levelOptions = [
    { value: 'Intern', label: 'Intern' },
    { value: 'Junior-', label: 'Junior-' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Junior+', label: 'Junior+' },
    { value: 'Middle-', label: 'Middle-' },
    { value: 'Middle', label: 'Middle' },
    { value: 'Middle+', label: 'Middle+' },
    { value: 'Senior-', label: 'Senior-' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Senior+', label: 'Senior+' },
    { value: 'Lead-', label: 'Lead-' },
    { value: 'Lead', label: 'Lead' },
    { value: 'Lead+', label: 'Lead+' },
    { value: 'Principal', label: 'Principal' },
];

const UpdateLevelDialog = ({ open, onClose, personId, onLevelUpdate }) => {
    const [newLevel, setNewLevel] = useState('');
    const [justification, setJustification] = useState('');

    const handleUpdateLevel = async () => {
        try {
            const data = {
                newLevel,
                justification,
            };
            await apiWithAuth.put(`/people/${personId}/updateLevel`, data);
            alert('Level updated successfully');
            onLevelUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating level:', error);
            alert('Failed to update level');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Update Level</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    label="New Level"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    fullWidth
                >
                    {levelOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    margin="dense"
                    id="justification"
                    label="Justification"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdateLevel}>Update</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateLevelDialog;
