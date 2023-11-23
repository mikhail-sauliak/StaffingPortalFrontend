// CreatePerson.js
import React, { useState, useEffect } from 'react';
import usePersonForm from './hooks/usePersonForm';
import PersonForm from './Person/PersonForm';
import { ToastContainer } from 'react-toastify';
import { apiWithAuth } from '../utils/api.js';

const CreatePerson = ({ onPersonCreated }) => {
  const [projects, setProjects] = useState([]);
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
        plannedAssignment: [],
        comments: '',
        stream: 'QA',
        tmAware: 'Not',
        level: 'Intern', 
        assignmentExistsInGCP: false,
      },
      null, () => {
        onPersonCreated();
    });

    useEffect(() => {
      const fetchProjects = async () => {
        try {
          const response = await apiWithAuth.get('projects');
          const formattedProjects = response.data.$values.map(project => ({
            value: project.id, 
            label: project.name
          }));
          setProjects(formattedProjects);
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      };
    
      fetchProjects();
    }, []);

  return (
    <>
      <ToastContainer position="top-center" />
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
        projects={projects}
      />
    </>
  );
};

export default CreatePerson;
