// EditPerson.js
import React from 'react';
import usePersonForm from './hooks/usePersonForm';
import PersonForm from './Person/PersonForm';

const EditPerson = ({ personId, onPersonUpdated }) => {
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
      stream: '',
      tmAware: '',
      level: '',
      assignmentExistsInGCP: false,
    },
    personId,
    onPersonUpdated 
  );

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

export default EditPerson;
