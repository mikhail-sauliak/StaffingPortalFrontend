import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Autocomplete, Container, Box, Grid, Button, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { techStackOptions, streamOptions, levelOptions } from '../hooks/selectOptions.js';
import { apiWithAuth } from '../../utils/api.js';
import '../../styles/styles.css';
import AssignManagerRole from './AssignManagerRole';

const normalizeCollection = (payload) => {
    if (!payload) {
        return [];
    }

    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload.$values) {
        return payload.$values;
    }

    return [];
};

const extractManagerNameById = (managers, personId) => {
    if (!personId) {
        return '';
    }

    const manager = managers.find((item) => Number(item.personId ?? item.value) === Number(personId));
    if (!manager) {
        return '';
    }

    if (manager.username) {
        return manager.username.replace(/([A-Z])/g, ' $1').trim();
    }

    return manager.label ?? manager.fullName ?? '';
};

const isFormValid = (manager, managerIdForUser) => {
    const requiredFields = ['firstName', 'lastName', 'location', 'availableFrom', 'stream', 'level', 'role'];

    const hasRequiredStrings = requiredFields.every((field) => {
        const value = manager[field];
        return typeof value === 'string' && value.trim().length > 0;
    });

    if (!hasRequiredStrings) {
        return false;
    }

    if (!manager.divisionManagerId || !manager.talentManagerId) {
        return false;
    }

    if (!Array.isArray(manager.techStack) || manager.techStack.length === 0) {
        return false;
    }

    if (!managerIdForUser) {
        return false;
    }

    return true;
};

const CreateManager = () => {
    const [newManager, setNewManager] = useState(initialManagerState);
    const [divisionManagers, setDivisionManagers] = useState([]);
    const [talentManagers, setTalentManagers] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('create');

    const normalizedDivisionManagers = useMemo(
        () => normalizeCollection(divisionManagers),
        [divisionManagers]
    );

    const normalizedTalentManagers = useMemo(
        () => normalizeCollection(talentManagers),
        [talentManagers]
    );

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    useEffect(() => {
        const loadManagers = async () => {
            try {
                const [divisionManagersResponse, talentManagersResponse] = await Promise.all([
                    apiWithAuth.get('administration/division-managers'),
                    apiWithAuth.get('administration/talent-managers'),
                ]);

                setDivisionManagers(normalizeCollection(divisionManagersResponse.data));
                setTalentManagers(normalizeCollection(talentManagersResponse.data));
            } catch (fetchError) {
                console.error('There was an error fetching managers!', fetchError);
                setError('Failed to fetch managers.');
            }
        };

        loadManagers();
    }, []);

    const updateTalentManagersList = async (divisionManagerId) => {
        if (!divisionManagerId) {
            return;
        }

        try {
            const response = await apiWithAuth.get(`administration/division-manager/${divisionManagerId}/talent-managers`);
            const scopedTalentManagers = normalizeCollection(response.data).map((manager) => ({
                ...manager,
                value: manager.personId ?? manager.value,
            }));

            setTalentManagers(scopedTalentManagers);
        } catch (fetchError) {
            console.error('Error fetching managed talent managers:', fetchError);
            setError('Failed to fetch talent managers for the selected division manager.');
        }
    };

    const handleTechStackChange = (_, newValue) => {
        setNewManager((prevState) => ({
            ...prevState,
            techStack: newValue.map((item) => item.label ?? item.value ?? item),
        }));
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        const parsedValue = name.endsWith('Id') ? (value === '' ? null : Number(value)) : value;

        setNewManager((prevState) => ({
            ...prevState,
            [name]: parsedValue,
        }));

        if (name === 'divisionManagerId' && parsedValue) {
            updateTalentManagersList(parsedValue);
        }
    };

    const managerIdForUser = useMemo(() => {
        if (newManager.role === 'Talent Manager') {
            return Number(newManager.divisionManagerId);
        }

        if (newManager.role === 'Division Manager') {
            return Number(newManager.divisionManagerId);
        }

        if (newManager.role) {
            return Number(newManager.talentManagerId || newManager.divisionManagerId);
        }

        return null;
    }, [newManager]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setSubmitted(true);

        if (!isFormValid(newManager, managerIdForUser)) {
            setError('Please fill in all required fields.');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const personPayload = {
                firstName: newManager.firstName.trim(),
                lastName: newManager.lastName.trim(),
                location: newManager.location.trim(),
                divisionManagerId: Number(newManager.divisionManagerId),
                talentManagerId: Number(newManager.talentManagerId),
                availableFrom: newManager.availableFrom,
                techStack: Array.isArray(newManager.techStack) ? newManager.techStack.join(', ') : newManager.techStack,
                comments: newManager.comments ?? '',
                stream: newManager.stream,
                tMAware: newManager.tMAware ?? 'Not',
                level: newManager.level,
                assignmentExistsInGCP: Boolean(newManager.assignmentExistsInGCP),
                plannedAssignment: newManager.plannedAssignment ?? '',
                userId: null,
                headId: null,
                deputyHeadId: null,
            };

            const personResponse = await apiWithAuth.post('administration', personPayload);
            const createdPerson = personResponse.data;

            const username = `${newManager.firstName}${newManager.lastName}`.replace(/\s+/g, '');
            const managerName = extractManagerNameById([...normalizedDivisionManagers, ...normalizedTalentManagers], managerIdForUser);

            const userPayload = {
                Username: username,
                Role: newManager.role,
                Stream: newManager.stream,
                PersonId: createdPerson?.id ?? createdPerson?.Id,
                Password: 'Test1234!',
                Division: newManager.stream,
                ManagedBy: managerName,
                ManagerId: managerIdForUser,
            };

            await apiWithAuth.post('user/create', userPayload);
            setSuccessMessage('User created successfully!');
            setNewManager(initialManagerState);
            setSubmitted(false);
        } catch (creationError) {
            console.error('There was an error creating the user!', creationError);
            setError('There was an error creating the user!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} style={{ textAlign: 'center' }}>
                <Button variant={viewMode === 'create' ? 'contained' : 'outlined'} color="primary" onClick={() => handleViewModeChange('create')} style={{ marginRight: '10px' }}>Create Manager</Button>
                <Button variant={viewMode === 'assign' ? 'contained' : 'outlined'} color="secondary" onClick={() => handleViewModeChange('assign')}>Assign Role</Button>
            </Grid>

            {viewMode === 'create' ? (
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Create New Manager</Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    {successMessage && <Alert severity="success">{successMessage}</Alert>}

                    <Box component="form" noValidate onSubmit={handleFormSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            {/* Примеры полей формы */}
                            <Grid item xs={12}>
                                <TextField required fullWidth id="firstName" label="First Name" name="firstName" autoComplete="fname" value={newManager.firstName} onChange={handleFormChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField required fullWidth id="lastName" label="Last Name" name="lastName" autoComplete="lname" value={newManager.lastName} onChange={handleFormChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="location"
                                    label="Location"
                                    name="location"
                                    autoComplete="location"
                                    value={newManager.location}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="divisionManagerId-label">Division Manager</InputLabel>
                                    <Select
                                        labelId="divisionManagerId-label"
                                        id="divisionManagerId"
                                        value={newManager.divisionManagerId}
                                        label="Division Manager"
                                        name="divisionManagerId"
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {normalizedDivisionManagers.map((manager) => {
                                            const personId = manager.personId ?? manager.value ?? manager.id;
                                            const username = manager.username ?? manager.label ?? manager.fullName ?? '';
                                            const displayName = username.replace(/([A-Z])/g, ' $1').trim();

                                            return (
                                                <MenuItem key={personId} value={personId}>
                                                    {displayName}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="talentManagerId-label">Talent Manager</InputLabel>
                                    <Select
                                        labelId="talentManagerId-label"
                                        id="talentManagerId"
                                        value={newManager.talentManagerId}
                                        label="Talent Manager"
                                        name="talentManagerId"
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        {normalizedTalentManagers.map((manager) => {
                                            const personId = manager.personId ?? manager.value;
                                            const username = manager.username ?? manager.label ?? manager.fullName ?? '';
                                            const displayName = username.replace(/([A-Z])/g, ' $1').trim();

                                            return (
                                                <MenuItem key={personId} value={personId}>
                                                    {displayName}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="availableFrom"
                                    label="Available From"
                                    type="date"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    name="availableFrom"
                                    value={newManager.availableFrom}
                                    onChange={handleFormChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    multiple
                                    id="techStack"
                                    options={techStackOptions}
                                    getOptionLabel={(option) => option.label}
                                    value={techStackOptions.filter((option) => newManager.techStack.includes(option.label))}
                                    onChange={handleTechStackChange}
                                    renderInput={(params) => (
                                        <TextField {...params} variant="outlined" label="Tech Stack" placeholder="Tech Stack" />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="stream-label">Stream</InputLabel>
                                    <Select
                                        labelId="stream-label"
                                        id="stream"
                                        value={newManager.stream}
                                        label="Stream"
                                        name="stream"
                                        onChange={handleFormChange}
                                    >
                                        {streamOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="level-label">Level</InputLabel>
                                    <Select
                                        labelId="level-label"
                                        id="level"
                                        value={newManager.level}
                                        label="Level"
                                        name="level"
                                        onChange={handleFormChange}
                                    >
                                        {levelOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="role-label">Role</InputLabel>
                                    <Select
                                        labelId="role-label"
                                        id="role"
                                        value={newManager.role}
                                        label="Role"
                                        name="role"
                                        onChange={handleFormChange}
                                    >
                                        <MenuItem value="Talent Manager">Talent Manager</MenuItem>
                                        <MenuItem value="Division Manager">Division Manager</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Button variant="contained" color="primary" type="submit" className="mt-3" disabled={isLoading}>
                                        {isLoading ? 'Submitting...' : 'Submit'}
                            </Button>
                            </Grid>
                            </Box>
                    </Grid>
                        
                ) : (
                    <Grid item xs={12}>
                        {/* Компонент AssignManagerRole для назначения роли существующему пользователю */}
                        <AssignManagerRole />
                    </Grid>
                )}
            </Grid>
            
        </Container>
    );
};

const initialManagerState = {
    firstName: '',
    lastName: '',
    location: '',
    divisionManagerId: null,
    talentManagerId: null,
    availableFrom: '',
    techStack: [],
    stream: '',
    level: '',
    role: '',
    comments: '',
    plannedAssignment: '',
    assignmentExistsInGCP: false,
    tMAware: 'Not',
};

export default CreateManager;

// import React, { useState, useEffect } from 'react';
// import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
// import Select from 'react-select';
// import { apiWithAuth } from '../utils/api.js';
// import '../styles/styles.css';

// const techStackOptions = [
//   { value: 'C#', label: 'C#' },
//   { value: 'Java', label: 'Java' },
//   { value: 'Python', label: 'Python' },
//   { value: 'PHP', label: 'PHP' },
//   { value: 'JS', label: 'JS' },
// ];

// const streamOptions = [
//   { value: 'QA', label: 'QA' },
//   { value: 'SDET', label: 'SDET' },
// ];

// const levelOptions = [
//   { value: 'Junior', label: 'Junior' },
//   { value: 'Middle', label: 'Middle' },
//   { value: 'Senior', label: 'Senior' },
//   { value: 'Lead', label: 'Lead' },
//   { value: 'Principal', label: 'Principal' },
// ];

// const roleOptions = [
//   { value: 'Talent Manager', label: 'Talent Manager' },
//   { value: 'Division Manager', label: 'Division Manager' }
// ];

// const CreateManager = () => {
//   const [newManager, setNewManager] = useState({
//     firstName: '',
//     lastName: '',
//     location: '',
//     divisionManagerId: null,
//     talentManagerId: null,
//     availableFrom: '',
//     techStack: '',
//     stream: '',
//     level: '',
//     role: ''
//   });

//   const [divisionManagers, setDivisionManagers] = useState([]);
//   const [talentManagers, setTalentManagers] = useState([]);
//   const [existingEmployees, setExistingEmployees] = useState([]); // Для хранения существующих сотрудников
//   const [actionType, setActionType] = useState('create'); // 'create' или 'changeRole'
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [submitted, setSubmitted] = useState(false);

//   useEffect(() => {
//     fetchManagers();
//     fetchExistingEmployees(); // Загрузка списка существующих сотрудников
//   }, []);

//   const fetchManagers = async () => {
//     try {
//       const divisionManagersResponse = await apiWithAuth.get('administration/division-managers');
//       setDivisionManagers(divisionManagersResponse.data.$values);

//       const talentManagersResponse = await apiWithAuth.get('administration/talent-managers');
//       setTalentManagers(talentManagersResponse.data.$values);
//     } catch (error) {
//       console.error('There was an error fetching managers!', error);
//       setError('Failed to fetch managers.');
//     }
//   };

//   const fetchExistingEmployees = async () => {
//     try {
//       // Предполагаем, что apiWithAuth.get('people') возвращает список существующих сотрудников
//       const response = await apiWithAuth.get('people');
//       const employees = response.data.$values.map(employee => ({
//         value: employee.id,
//         label: `${employee.firstName} ${employee.lastName}`,
//       }));
//       setExistingEmployees(employees);
//     } catch (error) {
//       console.error('Error fetching existing employees:', error);
//     }
//   };

//   const updateTalentManagersList = (divisionManagerId) => {
//     console.log('Updating talent managers for division manager ID:', divisionManagerId);
//     apiWithAuth.get(`administration/division-manager/${divisionManagerId}/talent-managers`)
//       .then(response => {
//         setTalentManagers(response.data.$values);
//       })
//       .catch(error => {
//         console.error('Error fetching managed talent managers:', error);
//         setError('Failed to fetch talent managers for the selected division manager.');
//       });
//   };

//   const handleTechStackChange = (selectedOptions) => {
//     const techStackString = selectedOptions.map(option => option.value).join(',');
//     setNewManager({ ...newManager, techStack: techStackString });
//   };

//   const handleStreamChange = (selectedOption) => {
//     setNewManager({ ...newManager, stream: selectedOption.value });
//   };

//   const handleLevelChange = (selectedOption) => {
//     setNewManager({ ...newManager, level: selectedOption.value });
//   };

//   const handleFormChange = (event) => {
//     const { name, value } = event.target;
//     setNewManager(prevState => ({
//       ...prevState,
//       [name]: value
//     }));

//     if (name === 'divisionManagerId') {
//       updateTalentManagersList(value);
//     }
//   };

//   const handleFormSubmit = async (event) => {
//     event.preventDefault();
//     setSubmitted(true);
  
//     if (!isFormValid()) {
//       setError('Please fill in all required fields.');
//       return;
//     }
  
//     setError(null);
  
//     if (actionType === 'create') {
//       // Логика создания нового менеджера
//       try {
//         const newManagerData = {
//           ...newManager,
//           // Предполагаем, что в newManager уже есть все нужные данные
//         };
//         await apiWithAuth.post('path/to/your/endpoint/for/creating/manager', newManagerData);
//         setSuccessMessage('New manager created successfully!');
//         // Обнуляем форму после успешного создания
//         setNewManager({
//           firstName: '',
//           lastName: '',
//           location: '',
//           divisionManagerId: null,
//           talentManagerId: null,
//           availableFrom: '',
//           techStack: '',
//           stream: '',
//           level: '',
//           role: ''
//         });
//         setSubmitted(false);
//       } catch (error) {
//         console.error('There was an error creating the manager:', error);
//         setError('There was an error creating the manager!');
//       }
//     } else if (actionType === 'changeRole') {
//       // Логика изменения роли существующего сотрудника
//       try {
//         // Предположим, что selectedEmployee содержит выбранного сотрудника
//         // И что role содержит новую роль
//         const updateData = {
//           employeeId: newManager.selectedEmployee, // Здесь должен быть ID сотрудника
//           newRole: newManager.role
//         };
//         await apiWithAuth.put('path/to/your/endpoint/for/updating/role', updateData);
//         setSuccessMessage('Role changed successfully!');
//         // Обнуляем форму после успешного обновления
//         setNewManager({
//           ...newManager,
//           selectedEmployee: null, // Убедитесь, что вы добавили это поле в state формы для выбора сотрудника
//           role: ''
//         });
//         setSubmitted(false);
//       } catch (error) {
//         console.error('There was an error changing the role:', error);
//         setError('There was an error changing the role!');
//       }
//     }
//   };

//   const isFormValid = () => {
//     // Проверьте условия валидности формы здесь
//     return true; // Замените на реальную проверку
//   };

//   return (
//     <Container>
//       <Row className="justify-content-center">
//         <Col md={8}>
//           <div className="form-section">
//             <h2>{actionType === 'create' ? 'Create Manager' : 'Change Role for Existing Employee'}</h2>
//             {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
//             {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}

//             <Form onSubmit={handleFormSubmit}>
//               <Form.Group className="mb-3" controlId="formActionType">
//                 <Form.Label>Action Type</Form.Label>
//                 <Form.Control as="select" value={actionType} onChange={e => setActionType(e.target.value)}>
//                   <option value="create">Create New Manager</option>
//                   <option value="changeRole">Change Role for Existing Employee</option>
//                 </Form.Control>
//               </Form.Group>

//               {actionType === 'create' ? (
//                 <>
//                   {/* Форма для создания нового менеджера */}
//                   {/* Ваш код для формы создания нового менеджера здесь */}
//                 </>
//               ) : (
//                 <>
//                   {/* Форма для изменения роли существующего сотрудника */}
//                   <Form.Group className="mb-3">
//                     <Form.Label>Existing Employee</Form.Label>
//                     <Select options={existingEmployees} onChange={/* Обработчик выбора существующего сотрудника */} />
//                   </Form.Group>
//                   <Form.Group className="mb-3">
//                     <Form.Label>New Role</Form.Label>
//                     <Select options={roleOptions} onChange={/* Обработчик выбора новой роли */} />
//                   </Form.Group>
//                 </>
//               )}

//               <Button variant="primary" type="submit" className="mt-3">
//                 Submit
//               </Button>
//             </Form>
//           </div>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default CreateManager;

