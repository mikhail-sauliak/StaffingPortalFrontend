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
    const dataToSend = {
      Id: formData.id,
      FirstName: formData.firstName,
      LastName: formData.lastName,
      Location: formData.location,
      DivisionManagerId: formData.divisionManagerId,
      TalentManagerId: formData.talentManagerId ? parseInt(formData.talentManagerId, 10) : null,
      AvailableFrom: formData.availableFrom,
      TechStack: formData.techStack.join(', '),
      Comments: formData.comments,
      Stream: formData.stream,
      TMAware: formData.tmAware,
      Level: formData.level,
      UserId: formData.userId,
      ProjectIds: formData.plannedAssignment.join(', '),
      AssignmentExistsInGCP: formData.assignmentExistsInGCP === 'Yes' || formData.assignmentExistsInGCP === true
    };
  
    try {
      if (formData.id) {
        await apiWithAuth.put(`people/${formData.id}`, dataToSend);
        toast.success("Person updated successfully!");
        onSave({ ...dataToSend, id: formData.id }); // Передаем данные из формы
      } else {
        const response = await apiWithAuth.post('people', dataToSend);
        if (response && response.data) {
          toast.success("Person created successfully!");
          onSave(response.data); // Передаем данные с сервера для новой записи
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
    handleSubmit
  };
};

export default usePersonForm;