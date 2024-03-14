import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import EmailProposalComponent from '../SalaryReview/EmailProposalComponent';
import { useFetchPeople, useFetchReviews, useFetchSalaryRanges, useMergePeopleAndReviews, useCalculateAdjustments } from '../hooks/useSalaryReviewData';
import { formatDataForEmailTable } from '../../utils/dataEmailutils';
import ProposalTable from '../SalaryReview/ProposalTable';
import MainTable from '../SalaryReview/MainTable';
import SalaryReviewBulkModal from '../SalaryReview/SalaryReviewBulkModal';
import { getLastSRTimerange } from '../../utils/dateUtils';
import AdjustmentSlider from '../SalaryReview/AdjustmentSlider';
import {
    Box,
    Grid,
    Paper,
    Button,
    Snackbar,
    FormControlLabel,
    Alert,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Checkbox,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@mui/material';

import { apiWithAuth } from '../../utils/api';
import { format } from 'date-fns';

const SalaryReviewTab = () => {
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [formData, setFormData] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isCreatingNewReview, setIsCreatingNewReview] = useState(false);
    const [salaryProposals, setSalaryProposals] = useState([]);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteReviewId, setDeleteReviewId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [selectedProposals, setSelectedProposals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formattedDataForEmail, setFormattedDataForEmail] = useState([]);
    const [removeOverflowed, setRemoveOverflowed] = useState(false);
    const [selectedStream, setSelectedStream] = useState('All');
    const [isActualOnly, setIsActualOnly] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [adjustmentSettings, setAdjustmentSettings] = useState({
        PLN: [500, 1000],
        USD: [300, 500],
        EUR: [300, 500],
        // ... other currencies
    });

    const reviews = useFetchReviews();
    const people = useFetchPeople();
    const salaryRanges = useFetchSalaryRanges();
    const mergedData = useMergePeopleAndReviews(people, reviews);
    const adjustments = useCalculateAdjustments(mergedData, salaryRanges, adjustmentSettings);

    useEffect(() => {
        const selectedProposalsData = salaryProposals.filter(proposal =>
            selectedProposals.includes(proposal.id)
        );
        const formattedData = formatDataForEmailTable(selectedProposalsData);
        setFormattedDataForEmail(formattedData);
    }, [people, reviews]);

    const getPersonName = (personId) => {
        const person = people.find(p => p.id === personId);
        return person ? `${person.firstName} ${person.lastName}` : 'Unknown';
    };

    const getPersonTitle = (personId) => {
        const person = people.find(p => p.id === personId);
        return person ? person.level : 'Unknown';
    };

    const handleEdit = (review) => {
        setEditingReviewId(review.id);
        setFormData({ ...review });
    };

    const handleCancel = () => {
        setEditingReviewId(null);
    };

    const handleSave = async () => {
        if (!editingReviewId) {
            console.error('No review is being edited');
            return;
        }

        try {
            const response = await apiWithAuth.patch(`/salaryreview/${editingReviewId}`, formData);

            if (response.status === 204) {
                // reviews;
                setSnackbarMessage('Review saved successfully');
                setSnackbarOpen(true);
                setEditingReviewId(null);
            } else {
                setSnackbarMessage('Failed to save changes');
                setSnackbarOpen(true);
                console.error(`Failed to save changes: ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    //----------------CREATE NEW SALARY REVIEW------------------------------------------------------------------------------
    const handleCreateNew = () => {
        setIsCreatingNewReview(true);
        setFormData({
            personId: '',
            reviewDate: format(new Date(), 'yyyy-MM-dd'), // текущая дата
            justification: '',
            oldSalary: '',
            proposedSalary: '',
            currency: 'USD',
            contractType: 'EC',
            newSalaryStartDate: format(new Date(), 'yyyy-MM-dd'),
            salaryReceivedDate: format(new Date(), 'yyyy-MM-dd'),
            divisionManagerComments: '',
            talentManagerComments: '',
            isApproved: true,
            reviewResult: 'Approved'
        });
    };

    const handleCreateSave = async () => {
        try {
            const response = await apiWithAuth.post('/salaryreview', formData);
            if (response.status === 201) {
                // useFetchReviews();
                setSnackbarMessage('New review created successfully');
                setSnackbarOpen(true);
                setIsCreatingNewReview(false);
            } else {
                setSnackbarMessage('Failed to create new review');
                setSnackbarOpen(true);
                console.error(`Failed to create new review: ${response.status}`);
            }
        } catch (error) {
            console.error('Error creating new review:', error);
        }
    };

    const handleCreateCancel = () => {
        setIsCreatingNewReview(false);
    };

    const handleDeleteClick = (reviewId) => {
        setOpenDialog(true);
        setDeleteReviewId(reviewId);
    };

    const handleDelete = async () => {
        if (!deleteReviewId) return;

        try {
            const response = await apiWithAuth.delete(`/salaryreview/${deleteReviewId}`);
            if (response.status === 200 || response.status === 204) {
                setSnackbarMessage('Review deleted successfully');
                setSnackbarOpen(true);
                // useFetchReviews();
            } else {
                setSnackbarMessage('Failed to delete review');
                setSnackbarOpen(true);
                console.error(`Failed to delete review: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            setSnackbarMessage('Error deleting review');
            setSnackbarOpen(true);
        } finally {
            setOpenDialog(false);
            setDeleteReviewId(null);
        }
    };
    //---------------------Propose SR----------------------------------------------------------------------------------

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredItems = useMemo(() => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Устанавливаем дату на один год назад от текущего момента

        let sortableItems = [...salaryProposals]
            .filter(proposal => {
                // Фильтрация по overflow и потоку (stream)
                const overflowCondition = !removeOverflowed || proposal.overflow == null;
                const streamCondition = selectedStream === 'All' || proposal.stream === selectedStream;

                // Фильтрация для отображения только "Actual" пересмотров зарплаты (год и старше)
                let actualCondition = true;
                if (isActualOnly && proposal.lastReviewDate) {
                    const lastReviewDate = new Date(proposal.lastReviewDate);
                    actualCondition = lastReviewDate <= oneYearAgo; // Проверяем, был ли пересмотр более года назад
                }

                return (proposal.adjustment !== 0 || proposal.overflow != null) && overflowCondition && streamCondition && actualCondition;
            });

        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return sortableItems;
    }, [salaryProposals, sortConfig, removeOverflowed, selectedStream, isActualOnly]);

    const handleRemoveOverflowedChange = (event) => {
        setRemoveOverflowed(event.target.checked);
    };

    const handleStreamChange = (event) => {
        setSelectedStream(event.target.value);
    };

    const handleActualChange = (event) => {
        setIsActualOnly(event.target.checked);
    };

    const handleSelectProposal = (proposalId) => {
        setSelectedProposals(prevSelected => {
            const isSelected = prevSelected.includes(proposalId);
            if (isSelected) {
                return prevSelected.filter(id => id !== proposalId);
            } else {
                return [...prevSelected, proposalId];
            }
        });
    };

    const handleCreateEmail = () => {
        // Фильтрация только выбранных предложений
        const selectedProposalsData = salaryProposals.filter(proposal =>
            selectedProposals.includes(proposal.id)
        );

        // Передаем отфильтрованные данные в formatDataForEmailTable
        const emailData = formatDataForEmailTable(selectedProposalsData, people, reviews);

        setFormattedDataForEmail(emailData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleProposeSalaryReviews = async () => {
        setSalaryProposals(adjustments);
    };

    const getHighlightClass = (startDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const oneYear = 365 * 24 * 60 * 60 * 1000; // миллисекунды в одном году
        const oneYearAndThreeMonths = oneYear + 90 * 24 * 60 * 60 * 1000; // плюс три месяца

        const diff = now - start;

        if (diff > oneYearAndThreeMonths) {
            return 'highlight-red';
        } else if (diff > oneYear) {
            return 'highlight-yellow';
        } else {
            return '';
        }
    };

    const handleRangeChange = (currency, newRange) => {
        setAdjustmentSettings(prevSettings => ({
            ...prevSettings,
            [currency]: newRange,
        }));
    };

    const toggleAccordion = () => {
        setIsAccordionOpen(!isAccordionOpen);
    };

    return (
        <Box sx={{ flexGrow: 1, overflowX: 'auto', mb: 2 }}>
            <Grid container spacing={2} justifyContent="flex-start" alignItems="flex-start">

                {/* Блок для Adjustment Settings */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={3} sx={{ p: 1 }}>
                        {Object.entries(adjustmentSettings).map(([currency, range]) => (
                            <AdjustmentSlider
                                key={currency}
                                currency={currency}
                                range={adjustmentSettings[currency]}
                                onChange={handleRangeChange}
                            />
                        ))}
                    </Paper>
                </Grid>

                {/* Блок для кнопок */}
                {/* Блок для кнопок и элементов управления */}
                <Grid item xs={12} md={2} container spacing={2} direction="column">
                    {/* Кнопка "Calculate Proposals" */}
                    <Grid item>
                        <Button variant="contained" color="secondary" onClick={handleProposeSalaryReviews} fullWidth>
                            Calculate Proposals
                        </Button>
                    </Grid>

                    {/* Кнопка "Open Proposals Table" */}
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={toggleAccordion} fullWidth>
                            Open Proposals Table
                        </Button>
                    </Grid>

                    {/* Кнопка "Create Review Email" */}
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={handleCreateEmail} fullWidth>
                            Create Review Email
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="secondary" onClick={() => setShowBulkModal(true)} fullWidth>
                            Bulk Send Salary Reviews
                        </Button>
                    </Grid>

                    {/* Чекбокс "Remove overflowed" */}
                    <Grid item>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={removeOverflowed}
                                    onChange={handleRemoveOverflowedChange}
                                    name="removeOverflowed"
                                />
                            }
                            label="Remove overflowed"
                        />
                    </Grid>

                    {/* Выпадающий список "Stream" */}
                    <Grid item>
                        <FormControl fullWidth>
                            <InputLabel id="role-select-label">Stream</InputLabel>
                            <Select
                                labelId="role-select-label"
                                id="role-select"
                                value={selectedStream}
                                onChange={handleStreamChange}
                                label="Stream"
                            >
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="QA">QA</MenuItem>
                                <MenuItem value="SDET">SDET</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Чекбокс "Actual" */}
                    <Grid item>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isActualOnly}
                                    onChange={handleActualChange}
                                    name="actualOnly"
                                />
                            }
                            label="Actual"
                        />
                    </Grid>
                </Grid>

                {/* Отдельная колонка для кнопки "Create New Review" */}
                <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" onClick={handleCreateNew}>
                        Create New Review
                    </Button>
                </Grid>
            </Grid>
            <SalaryReviewBulkModal
                show={showBulkModal}
                onHide={() => setShowBulkModal(false)}
                selectedEmployees={selectedProposals.map(id => mergedData.find(data => data.id === id))}
                onSubmit={(data) => {
                    // You can handle the bulk send logic or API calls here or pass this function down from another component
                    console.log(data); // For now, just logging the data
                    setShowBulkModal(false); // Close modal after submission
                    // Update your state as needed here (e.g., refresh data)
                }}
            /> 

            {/* Средний ряд для Accordion Proposal Table */}
            <Grid item xs={12}>
                <ProposalTable
                    isAccordionOpen={isAccordionOpen}
                    sortedAndFilteredItems={sortedAndFilteredItems}
                    handleSelectProposal={handleSelectProposal}
                    requestSort={requestSort}
                    getLastSRTimerange={getLastSRTimerange}
                />
            </Grid>

            {/* Нижний ряд для Main Table */}
            <Grid item xs={12}>
                <EmailProposalComponent
                    proposals={formattedDataForEmail}
                    selectedProposals={selectedProposals}
                    isModalOpen={isModalOpen}
                    onCloseModal={closeModal}
                />
            </Grid>
            <MainTable
                isCreatingNewReview={isCreatingNewReview}
                formData={formData}
                handleChange={handleChange}
                people={people}
                reviews={reviews}
                handleCreateSave={handleCreateSave}
                handleCreateCancel={handleCreateCancel}
                editingReviewId={editingReviewId}
                getHighlightClass={getHighlightClass}
                getPersonName={getPersonName}
                getPersonTitle={getPersonTitle}
                handleSave={handleSave}
                handleCancel={handleCancel}
                handleEdit={handleEdit}
                handleDeleteClick={handleDeleteClick}
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure to delete this salary review?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={handleDelete} color="primary" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SalaryReviewTab;
