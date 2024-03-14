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

    useEffect(() => {
        fetchPeople();
    }, []);

    const fetchPeople = async () => {
        try {
            const response = await apiWithAuth.get('people');
            setPeople(response.data.$values);
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
        if (!selectedPerson || !role) {
            setError('Please select a person and a role.');
            return;
        }

        const divisionManager = people.find(manager => manager.id === selectedPerson.divisionManagerId);
        console.log("divisionManager = ", divisionManager);
        const managedByName = divisionManager ? `${divisionManager.firstName} ${divisionManager.lastName}` : '';
        console.log("managedByName = ", managedByName);

        try {
            // Подготовка объекта userDto с необходимыми полями
            const userDto = {
                Username: `${selectedPerson.firstName}${selectedPerson.lastName}`,
                Role: role,
                Stream: selectedPerson.stream,
                Division: selectedPerson.stream, 
                Password: 'Test1234', 
                ManagedBy: managedByName, 
                PersonId: selectedPerson.id,
            };
    
            await apiWithAuth.post('User/create', userDto);
            setSuccessMessage('Manager role assigned successfully!');
            setSelectedPerson(null);
            setRole('');
        } catch (error) {
            console.error('There was an error assigning the manager role', error);
            setError('Failed to assign the manager role.', error);
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
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Assign Role</Button>
                    </form>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AssignManagerRole;
