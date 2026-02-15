import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../../utils/api';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';

const roleMappings = {
    "Talent Manager": "TalentManager",
    "Division Manager": "DivisionManager",
};

const AssignManagerRole = () => {
    const [people, setPeople] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPeople();
    }, []);

    const fetchPeople = async () => {
        try {
            const response = await apiWithAuth.get('administration');
            const payload = response.data;
            const collection = Array.isArray(payload) ? payload : payload?.$values ?? [];
            setPeople(collection);
        } catch (error) {
            console.error('Failed to fetch people', error);
            setError('Failed to fetch people.');
        }
    };

    const handleChangeRole = (event) => {
        const readableValue = event.target.value; // Получаем читаемое значение, выбранное пользователем
        const serverValue = roleMappings[readableValue]; // Получаем соответствующее серверное значение
        setRole(serverValue); // Обновляем состояние компонента уже "техническим" значением
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');
        if (!selectedPerson || !role) {
            setError('Please select a person and a role.');
            return;
        }

        if (!selectedPerson.managerPersonId) {
            setError('Selected person does not have a manager assigned in the hierarchy.');
            return;
        }

        const managedByName = selectedPerson.managerFullName || '';

        setIsSubmitting(true);

        try {
            const userDto = {
                Username: `${selectedPerson.firstName}${selectedPerson.lastName}`.replace(/\s+/g, ''),
                Role: role,
                Stream: selectedPerson.stream,
                Division: selectedPerson.stream,
                Password: 'Test1234!',
                ManagedBy: managedByName,
                PersonId: selectedPerson.id,
                ManagerId: selectedPerson.managerPersonId,
            };

            await apiWithAuth.post('user/create', userDto);
            setSuccessMessage('Manager role assigned successfully!');
            setSelectedPerson(null);
            setRole('');
        } catch (error) {
            console.error('There was an error assigning the manager role', error);
            setError('Failed to assign the manager role.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                    <h2>Assign Manager Role</h2>
                </Grid>
                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                    </Grid>
                )}
                {successMessage && (
                    <Grid item xs={12}>
                        <Alert severity="success">{successMessage}</Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <form onSubmit={handleSubmit}>
                        <Autocomplete
                            options={people}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                            value={selectedPerson}
                            onChange={(event, newValue) => {
                                setSelectedPerson(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} label="Select Person" />}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Role"
                            value={Object.keys(roleMappings).find(key => roleMappings[key] === role)}
                            onChange={handleChangeRole}
                            SelectProps={{
                                native: true,
                            }}
                            margin="normal"
                        >
                            <option value=""></option>
                            {Object.keys(roleMappings).map((readableValue) => (
                                <option key={roleMappings[readableValue]} value={readableValue}>
                                    {readableValue}
                                </option>
                            ))}
                        </TextField>
                        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isSubmitting}>
                            {isSubmitting ? 'Assigning...' : 'Assign Role'}
                        </Button>
                    </form>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AssignManagerRole;
