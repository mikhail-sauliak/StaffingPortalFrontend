import React, { useState } from 'react';
import { apiWithAuth } from '../utils/api.js'
import useFetchManagers from './hooks/useFetchManagers.js';
import PersonForm from './Person/PersonForm.js';

const CreatePerson = ({ onPersonCreated }) => {
  const [personData, setPersonData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    divisionManagerId: '',
    talentManagerId: '',
    availableFrom: '',
    techStack: [],
    comments: '',
    stream: 'QA',
    tmAware: 'Not',
    level: 'Intern',
    assignmentExistsInGCP: 'No',
  });

  const [divisionManagers, talentManagers, updateTalentManagersList] = useFetchManagers();

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === 'radio' && name === 'assignmentExistsInGCP') {
        setPersonData({ ...personData, [name]: checked ? 'Yes' : 'No' });
    } else {
        setPersonData({ ...personData, [name]: value });
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setPersonData({
        ...personData,
        [name]: selectedOption ? selectedOption.value : ''
    });
    if (name === 'divisionManagerId') {
        updateTalentManagersList(selectedOption ? selectedOption.value : '');
        setPersonData({ ...personData, talentManagerId: '' });
    }
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    apiWithAuth.post('people', {
      ...personData,
      techStack: personData.techStack.map(tech => tech.value) // Handle multi-select conversion
    })
    .then(response => {
      onPersonCreated(response.data);
      setPersonData({
        firstName: '',
        lastName: '',
        location: '',
        divisionManagerId: '',
        talentManagerId: '',
        availableFrom: '',
        techStack: personData.techStack.join(', '),
        comments: '',
        stream: 'QA',
        tmAware: 'Not',
        level: '',
        assignmentExistsInGCP: 'No',
      });
    })
    .catch(error => {
      console.error('There was an error creating the person!', error);
    });
  };

  return (
    <PersonForm 
      formData={personData} 
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      divisionManagers={divisionManagers}
      talentManagers={talentManagers}
      onUpdateTalentManagers={updateTalentManagersList}
      handleSelectChange={handleSelectChange}
    />
  );
};

export default CreatePerson;