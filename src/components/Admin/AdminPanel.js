import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiWithAuth } from '../../utils/api.js';
import { Container, Box, Button, FormControlLabel, Switch, Stack } from '@mui/material';
import CSVReader from '../ranges/CSVReader.js';
import EditableTable from './EditableTable.js';
import CreateManager from './CreateManager.js';
import getUserRoleFromToken from '../hooks/getUserRole.js';
import SalaryStatistics from './SalaryStatistics.js';
import SalaryReviewsHistory from '../PersonalPage/SalaryReviewsHistory.js';
import SalaryReviewTab from './SalaryReviewTab.js';
import SalaryPlanningComponentTest from '../Planning/SalaryPlanningComponentTest.js';
import FileUpload from '../../utils/FileUpload.js';
import FileUploader from '../../utils/FileUploader.js';
import { TabsTwitter } from '../../mui-treasury/tabs-twitter/TabsTwitter.tsx';
import { AdjustmentSettingsProvider } from '../SalaryReview/AdjustmentSettingsContext.js';

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

const buildEmptyFormState = (seed = {}) => ({
    ...seed,
    id: '',
    firstName: '',
    lastName: '',
    location: '',
    divisionManagerId: '',
    talentManagerId: '',
    availableFrom: '',
    tMAware: 'Yes',
    techStack: [],
    plannedAssignment: '',
    stream: '',
    level: '',
    role: '',
    assignmentExistsInGCP: false,
    comments: '',
    userId: null,
});

const AdminPanel = (initialState = {}) => {
    const [activeTab, setActiveTab] = useState('People');
    const [people, setPeople] = useState([]);
    const [editablePersonId, setEditablePersonId] = useState(null);
    const userRole = getUserRoleFromToken();
    const hasAccess = userRole === 'Head' || userRole === 'DeputyHead' || userRole === 'DivisionManager';
    const [isCreatingNewPerson, setIsCreatingNewPerson] = useState(false);
    const [formData, setFormData] = useState(() => buildEmptyFormState(initialState));
    const [deletingPersonId, setDeletingPersonId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [dismissDate, setDismissDate] = useState('');
    const [openDismissDialog, setOpenDismissDialog] = useState(false);
    const [showActiveOnlyPeople, setShowActiveOnlyPeople] = useState(true);

    const fetchPeople = useCallback(async () => {
        if (!hasAccess) {
            setPeople([]);
            return;
        }

        try {
            const response = await apiWithAuth.get('administration');
            const collection = normalizeCollection(response.data);
            const updatedPeople = collection.map((person) => ({
                ...person,
                divisionManagerId: person.divisionManagerId ?? person.divisionManager?.id ?? null,
                divisionManagerName: person.divisionManager?.fullName ?? '',
                talentManagerId: person.talentManagerId ?? person.talentManager?.id ?? null,
                talentManagerName: person.talentManager?.fullName ?? '',
                techStack: person.techStack ?? '',
                isDismissed: person.isDismissed ?? false,
                endDate: person.endDate ?? null,
            }));

            setPeople(updatedPeople);
        } catch (error) {
            console.error('There was an error fetching administration data!', error);
        }
    }, [hasAccess]);

    useEffect(() => {
        fetchPeople();
    }, [fetchPeople]);

    const handleDeleteClick = (personId) => {
        setDeletingPersonId(personId);
        setOpenDeleteDialog(true);
    };

    const handleDismiss = async () => {
        if (!deletingPersonId || !dismissDate) {
            return;
        }

        const dismissPayload = {
            endDate: dismissDate,
        };

        try {
            await apiWithAuth.put(`administration/${deletingPersonId}/dismiss`, dismissPayload);
            setOpenDismissDialog(false);
            setDismissDate('');
            setDeletingPersonId(null);
            await fetchPeople();
        } catch (error) {
            console.error('Error during the dismissal process:', error);
            throw error;
        }
    };

    const handleTechStackChange = (event) => {
        const {
            target: { value },
        } = event;
        const techStackArray = typeof value === 'string'
            ? value.split(',').map((item) => item.trim()).filter(Boolean)
            : value;
        setFormData((prev) => ({ ...prev, techStack: techStackArray }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        if (name.toLowerCase().endsWith('id')) {
            setFormData((prev) => ({
                ...prev,
                [name]: value === '' ? '' : Number(value),
            }));
            return;
        }

        if (name === 'assignmentExistsInGCP') {
            setFormData((prev) => ({
                ...prev,
                assignmentExistsInGCP: value === 'Yes' || value === true,
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData(buildEmptyFormState(initialState));
    };

    const saveNewPerson = async () => {
        const divisionManagerId = formData.divisionManagerId ? Number(formData.divisionManagerId) : null;
        const talentManagerId = formData.talentManagerId ? Number(formData.talentManagerId) : null;

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            location: formData.location,
            divisionManagerId,
            talentManagerId,
            availableFrom: formData.availableFrom,
            techStack: Array.isArray(formData.techStack) ? formData.techStack.join(', ') : formData.techStack,
            comments: formData.comments ?? '',
            stream: formData.stream,
            tMAware: formData.tMAware ?? 'Yes',
            level: formData.level,
            userId: formData.userId,
            plannedAssignment: formData.plannedAssignment ?? '',
            assignmentExistsInGCP: Boolean(formData.assignmentExistsInGCP),
        };

        try {
            await apiWithAuth.post('administration', payload);
            await fetchPeople();
            setIsCreatingNewPerson(false);
            resetForm();
        } catch (error) {
            console.error('Ошибка при сохранении новой записи', error);
            throw error;
        }
    };

    const cancelCreatingNewPerson = () => {
        setIsCreatingNewPerson(false);
        resetForm();
    };

    const handlePersonChange = (field, id, event) => {
        const newValue = event.target.value;

        setPeople((prev) => prev.map((person) => (
            person.id === id
                ? { ...person, [field]: newValue }
                : person
        )));

        if (id === editablePersonId) {
            setFormData((prev) => ({
                ...prev,
                [field]: field.toLowerCase().includes('id')
                    ? (newValue === '' ? '' : Number(newValue))
                    : newValue,
            }));
        }
    };

    const handleSaveChanges = async (personId) => {
        const payload = {
            id: personId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            location: formData.location,
            divisionManagerId: formData.divisionManagerId ? Number(formData.divisionManagerId) : null,
            talentManagerId: formData.talentManagerId ? Number(formData.talentManagerId) : null,
            availableFrom: formData.availableFrom,
            techStack: Array.isArray(formData.techStack) ? formData.techStack.join(', ') : formData.techStack,
            comments: formData.comments,
            stream: formData.stream,
            tMAware: formData.tMAware ?? 'Yes',
            level: formData.level,
            userId: formData.userId,
            plannedAssignment: formData.plannedAssignment ?? '',
            assignmentExistsInGCP: Boolean(formData.assignmentExistsInGCP),
        };

        try {
            await apiWithAuth.put(`administration/${personId}`, payload);
            setEditablePersonId(null);
            await fetchPeople();
            resetForm();
        } catch (error) {
            console.error('Error updating person:', error);
            throw error;
        }
    };

    const toggleEdit = (personId) => {
        if (editablePersonId === personId) {
            setEditablePersonId(null);
            resetForm();
            return;
        }

        const person = people.find((p) => p.id === personId);
        if (!person) {
            return;
        }

        setEditablePersonId(personId);
        setFormData({
            ...person,
            techStack: typeof person.techStack === 'string' && person.techStack.length > 0
                ? person.techStack.split(',').map((item) => item.trim()).filter(Boolean)
                : [],
            tMAware: person.tMAware ?? 'Yes',
            plannedAssignment: person.plannedAssignment ?? '',
            assignmentExistsInGCP: Boolean(person.assignmentExistsInGCP),
        });
    };

    const tabIndexMap = {
        CreateManager: 0,
        People: 1,
        SalaryReviewTab: 2,
        SalaryStatistics: 3,
        SalaryPlanningComponent: 4,
        SalaryReviewsHistory: 5,
        CSVReader: 6,
        FileUpload: 7,
        FileUploader: 8,
    };

    const tabIndexMapReverse = Object.keys(tabIndexMap).reduce((acc, key) => {
        const index = tabIndexMap[key];
        acc[index] = key;
        return acc;
    }, {});

    const isPersonActive = useCallback((person) => {
        if (!person) {
            return false;
        }

        if (person.isDismissed) {
            return false;
        }

        if (person.endDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endDate = new Date(person.endDate);
            endDate.setHours(0, 0, 0, 0);
            if (endDate < today) {
                return false;
            }
        }

        return true;
    }, []);

    const displayedPeople = useMemo(() => {
        if (!showActiveOnlyPeople) {
            return people;
        }

        return people.filter((person) => isPersonActive(person));
    }, [isPersonActive, people, showActiveOnlyPeople]);

    if (!hasAccess) {
        return <div>Access Denied</div>;
    }

    return (
        <AdjustmentSettingsProvider>
            <Container maxWidth="false" sx={{ overflowX: 'auto', mt: 4, mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabsTwitter
                        value={tabIndexMap[activeTab]}
                        onChange={(event, newIndex) => setActiveTab(tabIndexMapReverse[newIndex])}
                    />
                </Box>
                {activeTab === 'CreateManager' && (
                    <Box sx={{ p: 3 }}>
                        <CreateManager />
                    </Box>
                )}
                {activeTab === 'People' && (
                    <Box sx={{ p: 3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setIsCreatingNewPerson(true);
                                    resetForm();
                                }}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                                Add New Person
                            </Button>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showActiveOnlyPeople}
                                        onChange={(event) => setShowActiveOnlyPeople(event.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Show active employees only"
                            />
                        </Stack>
                        <EditableTable
                            people={displayedPeople}
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
                            deletingPersonId={deletingPersonId}
                            openDeleteDialog={openDeleteDialog}
                            dismissDate={dismissDate}
                            openDismissDialog={openDismissDialog}
                            setDeletingPersonId={setDeletingPersonId}
                            setOpenDeleteDialog={setOpenDeleteDialog}
                            setDismissDate={setDismissDate}
                            setOpenDismissDialog={setOpenDismissDialog}
                            handleDismiss={handleDismiss}
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
                        <SalaryPlanningComponentTest />
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
