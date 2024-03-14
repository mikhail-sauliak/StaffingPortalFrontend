import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../../utils/api.js';
import { Container, Box, Tab, Tabs, Button } from '@mui/material';
import CSVReader from '../ranges/CSVReader.js';
import EditableTable from './EditableTable.js';
import CreateManager from './CreateManager.js';
import getUserRoleFromToken from '../hooks/getUserRole.js';
import SalaryStatistics from './SalaryStatistics.js';
import SalaryReviewsHistory from './SalaryReviewsHistory.js'
import SalaryReviewTab from './SalaryReviewTab.js'
import SalaryPlanningComponent from '../Planning/SalaryPlanningComponent.js';
import FileUpload from '../../utils/FileUpload.js';
import FileUploader from '../../utils/FileUploader.js';
import { AdjustmentSettingsProvider } from '../SalaryReview/AdjustmentSettingsContext.js';

const AdminPanel = (initialState) => {
    const [activeTab, setActiveTab] = useState('People');
    const [people, setPeople] = useState([]);
    const [editablePersonId, setEditablePersonId] = useState(null);
    const userRole = getUserRoleFromToken();
    const [isCreatingNewPerson, setIsCreatingNewPerson] = useState(false);
    const [selectedDivisionManager, setSelectedDivisionManager] = useState(null);
    const [talentManagers, setTalentManagers] = useState([]);
    const [formData, setFormData] = useState({
        ...initialState,
        id: '',
        firstName: '',
        lastName: '',
        location: '',
        divisionManagerId: '',
        talentManagerId: '',
        availableFrom: '',
        tMAware: 'Yes',
        techStack: [],
        plannedAssignment: [],
        stream: '',
        level: '',
        role: '',
        talentManagerId: '',
        divisionManagerId: '',
        assignmentExistsInGCP: false
    });

    useEffect(() => {
        fetchPeople();
    }, [userRole]);

    const fetchPeople = () => {
        Promise.all([
            apiWithAuth.get('people'),
            apiWithAuth.get('user')
        ])
            .then(([peopleResponse, usersResponse]) => {
                const peopleData = peopleResponse.data.$values;
                const usersData = usersResponse.data.$values;

                const updatedPeople = peopleData.map(person => {
                    const user = usersData.find(u => u.personId === person.id);
                    const role = user ? user.role : 'Employee';

                    const divisionManager = peopleData.find(p => p.userId === person.divisionManagerId);
                    const talentManager = peopleData.find(p => p.userId === person.talentManagerId);

                    const divisionManagerName = divisionManager ? `${divisionManager.firstName} ${divisionManager.lastName}` : '';
                    const talentManagerName = talentManager ? `${talentManager.firstName} ${talentManager.lastName}` : '';

                    return {
                        ...person,
                        role,
                        divisionManagerName,
                        talentManagerName,
                    };
                });

                setPeople(updatedPeople);
                console.log('Updated people:', updatedPeople);
            })
            .catch(error => {
                console.error('There was an error fetching people or users!', error);
            });
    };

    if (userRole !== 'Head' && userRole !== 'DeputyHead' && userRole !== 'DivisionManager') {
        return <div>Access Denied</div>;
    }

    const handleTechStackChange = (event) => {
        // Получаем выбранные значения из события
        const {
            target: { value },
        } = event;
        // Необходимо проверить, является ли полученное значение массивом
        const techStackArray = typeof value === 'string' ? value.split(',') : value;
        setFormData({ ...formData, techStack: techStackArray });
    };

    // Функция для изменения состояния новой записи
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const saveNewPerson = async () => {
        const dataToSend = {
            FirstName: formData.firstName,
            LastName: formData.lastName,
            Location: formData.location,
            DivisionManagerId: formData.divisionManagerId,
            TalentManagerId: formData.talentManagerId ? parseInt(formData.talentManagerId, 10) : null,
            AvailableFrom: formData.availableFrom,
            TechStack: formData.techStack.join(', '),
            Comments: formData.comments,
            Stream: formData.stream,
            TMAware: 'Yes',
            Level: formData.level,
            UserId: formData.userId,
            ProjectIds: 1,
            AssignmentExistsInGCP: formData.assignmentExistsInGCP === 'Yes' || formData.assignmentExistsInGCP === true
        };
        try {
            await apiWithAuth.post('people', dataToSend);
            // Обработка успешного сохранения
            fetchPeople(); // Перезагрузить данные
            setIsCreatingNewPerson(false); // Сбросить состояние создания новой записи
            // Сбросить форму
            setFormData({ // Сбросить форму после сохранения
                firstName: '',
                lastName: '',
                location: '',
                divisionManagerId: null,
                talentManagerId: null,
                availableFrom: '',
                techStack: [],
                stream: '',
                level: '',
                role: ''
            });
        } catch (error) {
            console.error('Ошибка при сохранении новой записи', error);
            // Обработка ошибки
        }
    };

    // отмена создания новой записи
    const cancelCreatingNewPerson = () => {
        setIsCreatingNewPerson(false);
    };

    const handlePersonChange = (field, id, event) => {
        const updatedPeople = people.map((person) => {
            if (person.id === id) {
                return { ...person, [field]: event.target.value };
            }
            return person;
        });
        setPeople(updatedPeople);

        if (id === editablePersonId) {
            setFormData(prevFormData => ({
                ...prevFormData,
                [field]: event.target.value
            }));
        }
    };
    const handleSaveChanges = async (personId) => {
        const dataToSend = {
            Id: personId,
            FirstName: formData.firstName,
            LastName: formData.lastName,
            Location: formData.location,
            DivisionManagerId: parseInt(formData.divisionManagerId, 10),
            TalentManagerId: formData.talentManagerId ? parseInt(formData.talentManagerId, 10) : null,
            AvailableFrom: formData.availableFrom,
            TechStack: Array.isArray(formData.techStack) ? formData.techStack.join(', ') : formData.techStack,
            Comments: formData.comments,
            Stream: formData.stream,
            TMAware: 'Yes',
            Level: formData.level,
            UserId: formData.userId,
            ProjectIds: Array.isArray(formData.plannedAssignment) ? formData.plannedAssignment.join(', ') : formData.plannedAssignment,
            AssignmentExistsInGCP: formData.assignmentExistsInGCP
        };

        try {
            await apiWithAuth.put(`people/${personId}`, dataToSend);
            setEditablePersonId(null);
            await fetchPeople();
            console.log('Person updated successfully');
            setFormData({ /* начальные значения или пустые строки */ });
        } catch (error) {
            console.error('Error updating person:', error);
        }
    };

    const handleDeleteClick = async (personId) => {
        await apiWithAuth.delete(`people/${personId}`);
        fetchPeople();
    };

    const toggleEdit = (personId) => {
        const person = people.find(p => p.id === personId);
        if (person) {
            setFormData({
                ...person,
                techStack: person.techStack.split(', '),
                tmAware: 'Yes',
                plannedAssignment: [],
                assignmentExistsInGCP: false
            });
        }
        setEditablePersonId(prev => prev === personId ? null : personId);
    };

    return (
        <AdjustmentSettingsProvider>
            <Container maxWidth="false" sx={{ overflowX: 'auto', mt: 4, mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="admin tabs">
                        <Tab value="CreateManager" label="Create Manager" />
                        <Tab value="People" label="People" />
                        <Tab value="SalaryReviewTab" label="Salary Reviews" />
                        <Tab value="SalaryStatistics" label="Statistics" />
                        <Tab value="SalaryPlanningComponent" label="Salary Planning" />
                        <Tab value="SalaryReviewsHistory" label="Salary Reviews History" />
                        <Tab value="CSVReader" label="Salary Ranges" />
                        <Tab value="FileUpload" label="Upload Data" />
                        <Tab value="FileUploader" label="Upload Playground" />
                    </Tabs>
                </Box>
                {activeTab === 'CreateManager' && (
                    <Box sx={{ p: 3 }}>
                        <CreateManager />
                    </Box>
                )}
                {activeTab === 'People' && (
                    <Box sx={{ p: 3 }}>
                        <Button variant="contained" color="primary" onClick={() => setIsCreatingNewPerson(true)} sx={{ mb: 2 }}>
                            Add New Person
                        </Button>
                        <EditableTable
                            people={people}
                            editablePersonId={editablePersonId}
                            setEditablePersonId={setEditablePersonId}
                            handlePersonChange={handlePersonChange}
                            toggleEdit={toggleEdit}
                            handleDeleteClick={handleDeleteClick}
                            apiWithAuth={apiWithAuth}
                            fetchPeople={fetchPeople}
                            isCreatingNewPerson={isCreatingNewPerson}
                            formData={formData}
                            setFormData={setFormData}
                            handleInputChange={handleInputChange}
                            saveNewPerson={saveNewPerson}
                            handleSaveChanges={handleSaveChanges}
                            cancelCreatingNewPerson={cancelCreatingNewPerson}
                            handleTechStackChange={handleTechStackChange}
                            setPeople={setPeople}
                        />
                    </Box>
                )}
                {activeTab === 'SalaryReviewTab' && (
                    <Box sx={{ p: 3 }}>
                        <SalaryReviewTab people={people} />
                    </Box>
                )}
                {activeTab === 'SalaryStatistics' && (
                    <Box sx={{ p: 3 }}>
                        <SalaryStatistics />
                    </Box>
                )}   
                {activeTab === 'SalaryPlanningComponent' && (
                    <Box sx={{ p: 3 }}>
                        <SalaryPlanningComponent />
                    </Box>
                )}
                {activeTab === 'SalaryReviewsHistory' && (
                    <Box sx={{ p: 3 }}>
                        <SalaryReviewsHistory />
                    </Box>
                )}
                {activeTab === 'CSVReader' && (
                    <Box sx={{ p: 3 }}>
                        <CSVReader />
                    </Box>
                )}
                {activeTab === 'FileUpload' && (
                    <Box sx={{ p: 3 }}>
                        <FileUpload />
                    </Box>
                )}
                {activeTab === 'FileUploader' && (
                    <Box sx={{ p: 3 }}>
                        <FileUploader />
                    </Box>
                )}
            </Container>
        </AdjustmentSettingsProvider>
    );
};

export default AdminPanel;
