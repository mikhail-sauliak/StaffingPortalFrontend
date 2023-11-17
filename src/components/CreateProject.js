import React from 'react';
import ProjectForm from './Project/ProjectForm';
import useProjectForm from './hooks/useProjectForm';
import { apiWithAuth } from '../utils/api';

const CreateProject = ({ onProjectCreated }) => {
    const onSave = async (projectData) => {
        try {
            const response = await apiWithAuth.post('projects', projectData);
            onProjectCreated(response.data);
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const {
        projectData,
        handleInputChange,
        handleCheckboxChange,
        handleFileChange,
        handleSubmit,
        handleTechStackChange
    } = useProjectForm({
        name: '',
        techStack: [],
        startDate: '',
        endDate: '',
        comments: '',
        search: 'Draft',
        signed: false,
        positionSigned: '',
        positionClosed: '',
        location: '',
        stream: '',
        level: 'Intern',
        priority: 'Low',
        attachment: null,
        candidateIds: []
    }, null, onSave);

    return (
        <ProjectForm
            projectData={projectData}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
            handleFileChange={handleFileChange}
            handleTechStackChange={handleTechStackChange}
        />
    );
};

export default CreateProject;
