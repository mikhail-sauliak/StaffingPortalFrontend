// CreatePerson.js
import React from 'react';
import usePersonForm from './hooks/usePersonForm';
import PersonForm from './Person/PersonForm';

const CreatePerson = ({ onPersonCreated }) => {
    const {
        formData,
        setFormData,
        divisionManagers,
        talentManagers,
        updateTalentManagersList,
        handleSubmit,
        handleInputChange,
        handleSelectChange,
        handleTechStackChange
      } = usePersonForm(
    {
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
        assignmentExistsInGCP: false,
      },
      null, () => {
        onPersonCreated();
    });

  return (
    <PersonForm
      formData={formData}
      setFormData={setFormData}
      divisionManagers={divisionManagers}
      talentManagers={talentManagers}
      updateTalentManagersList={updateTalentManagersList}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      handleSelectChange={handleSelectChange}
      handleTechStackChange={handleTechStackChange}
    />
  );
};

export default CreatePerson;
