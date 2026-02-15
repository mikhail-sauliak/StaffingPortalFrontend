import { useState, useEffect } from 'react';
import useFetchManagers from './useFetchManagers';
import formatDate from './formatDate';
import { apiWithAuth } from '../../utils/api.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const usePersonForm = (initialState, personId, onSave, onPersonUpdated) => {
  const [formData, setFormData] = useState({
    ...initialState,
    plannedAssignment: []
  });
  const [divisionManagers, talentManagers, updateTalentManagersList] = useFetchManagers();
  const [projects, setProjects] = useState([]);
  const [peopleOptions, setPeopleOptions] = useState([]);

  useEffect(() => {
    if (personId) {
      apiWithAuth.get(`people/${personId}`)
        .then(response => {
          const personData = response.data;
          setFormData({
            ...personData, 
            id: personId,
            availableFrom: formatDate(personData.availableFrom),
            techStack: personData.techStack ? personData.techStack.split(', ') : [],
            divisionManagerId: personData.divisionManagerId,
            talentManagerId: personData.talentManagerId
          });
          if (personData.divisionManagerId) {
            updateTalentManagersList(personData.divisionManagerId);
          }
        })
        .catch(error => console.error('Error fetching the person data:', error));
    }
  }, [personId]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await apiWithAuth.get('people');
        const rawPeople = response.data?.$values ?? response.data ?? [];
        const options = Array.isArray(rawPeople)
          ? rawPeople.map(person => ({
              value: person.id,
              label: `${person.firstName} ${person.lastName}`.trim()
            }))
          : [];
        setPeopleOptions(options);
      } catch (error) {
        console.error('Error fetching people for assignments:', error);
      }
    };

    fetchPeople();
  }, []);
  
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === 'talentManager') {
      const talentManagerId = selectedOption ? selectedOption.value : null;
      setFormData({ ...formData, talentManagerId });
    } else if (name === 'divisionManager') {
      const divisionManagerId = selectedOption ? selectedOption.value : null;
      setFormData({ ...formData, divisionManagerId });
      if (selectedOption) {
        updateTalentManagersList(selectedOption.value);
        setFormData({ ...formData, talentManagerId: null });
      }
    } else if (name === 'plannedAssignment') {
      const projectIds = selectedOption.map(option => option.value);
      setFormData({ ...formData, plannedAssignment: projectIds });
    } else if (name === 'userRole' || name === 'userStream') {
      setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });
    } else if (name === 'userManager') {
      setFormData({ ...formData, userManagerPersonId: selectedOption ? selectedOption.value : null });
    } else if (name === 'talentManagerAssignments') {
      const ids = selectedOption ? selectedOption.map(option => option.value) : [];
      setFormData({ ...formData, talentManagerAssignments: ids });
    } else if (name === 'divisionManagerAssignments') {
      const ids = selectedOption ? selectedOption.map(option => option.value) : [];
      setFormData({ ...formData, divisionManagerAssignments: ids });
    } else {
      setFormData({
        ...formData,
        [name]: selectedOption ? selectedOption.value : ''
      });
    }
  };

  const handleTechStackChange = (selectedOptions) => {
    const techStackArray = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData({ ...formData, techStack: techStackArray });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const personPayload = {
      Id: formData.id,
      FirstName: formData.firstName,
      LastName: formData.lastName,
      Location: formData.location,
      DivisionManagerId: formData.divisionManagerId ? parseInt(formData.divisionManagerId, 10) : null,
      TalentManagerId: formData.talentManagerId ? parseInt(formData.talentManagerId, 10) : null,
      AvailableFrom: formData.availableFrom,
      TechStack: formData.techStack.join(', '),
      Comments: formData.comments,
      Stream: formData.stream,
      TMAware: formData.tmAware,
      Level: formData.level,
      UserId: formData.userId,
      AssignmentExistsInGCP: formData.assignmentExistsInGCP === 'Yes' || formData.assignmentExistsInGCP === true,
      PlannedAssignment: formData.plannedAssignment.join(', ')
    };

    const shouldCreateUser = formData.createUser && formData.userUsername && formData.userPassword;
    const shouldCreateSalaryReview = formData.createSalaryReview && formData.salaryReviewReviewDate && formData.salaryReviewCurrency && formData.salaryReviewContractType;
    const hasAssignments = (formData.talentManagerAssignments?.length ?? 0) > 0 || (formData.divisionManagerAssignments?.length ?? 0) > 0;

    const onboardingPayload = {
      Person: personPayload,
      User: shouldCreateUser
        ? {
            Username: formData.userUsername,
            Password: formData.userPassword,
            Role: formData.userRole,
            Stream: formData.userStream || formData.stream,
            ManagerPersonId: formData.userManagerPersonId ? parseInt(formData.userManagerPersonId, 10) : null
          }
        : null,
      SalaryReview: shouldCreateSalaryReview
        ? {
            ReviewDate: formData.salaryReviewReviewDate,
            Justification: formData.salaryReviewJustification,
            OldSalary: formData.salaryReviewOldSalary ? Number(formData.salaryReviewOldSalary) : 0,
            ProposedSalary: formData.salaryReviewProposedSalary ? Number(formData.salaryReviewProposedSalary) : 0,
            Currency: formData.salaryReviewCurrency,
            ContractType: formData.salaryReviewContractType,
            NewSalaryStartDate: formData.salaryReviewNewSalaryStartDate || null,
            SalaryReceivedDate: formData.salaryReviewSalaryReceivedDate || null,
            DivisionManagerComments: formData.salaryReviewDivisionManagerComments,
            TalentManagerComments: formData.salaryReviewTalentManagerComments,
            ReviewResult: formData.salaryReviewReviewResult || 'Approved',
            IsApproved: formData.salaryReviewIsApproved,
            ApprovedByDivisionManager: formData.salaryReviewApprovedByDivisionManager
          }
        : null,
      ManagerAssignments: hasAssignments
        ? {
            TalentManagerPersonIds: (formData.talentManagerAssignments || []).map(id => parseInt(id, 10)),
            DivisionManagerPersonIds: (formData.divisionManagerAssignments || []).map(id => parseInt(id, 10))
          }
        : null
    };

    try {
      if (formData.id) {
        await apiWithAuth.put(`people/${formData.id}`, personPayload);
        toast.success('Person updated successfully!');
        onSave({ ...personPayload, id: formData.id });
      } else {
        const response = await apiWithAuth.post('people/onboard', onboardingPayload);
        if (response && response.data) {
          const createdPerson = response.data?.person ?? response.data?.Person ?? null;
          toast.success('Person onboarded successfully!');
          onSave(createdPerson || response.data);
        } else {
          throw new Error('No data returned from server');
        }
      }
    } catch (error) {
      console.error('Error processing the person form:', error);
      toast.error(`Failed to ${formData.id ? 'update' : 'create'} person.`);
    }
  };
  

  return {
    formData,
    setFormData,
    divisionManagers,
    talentManagers,
    updateTalentManagersList,
    handleInputChange,
    handleSelectChange,
    handleTechStackChange,
    projects,
    handleSubmit,
    peopleOptions
  };
};

export default usePersonForm;