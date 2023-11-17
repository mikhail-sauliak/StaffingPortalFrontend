import React from 'react';
import ProjectForm from './Project/ProjectForm';
import useProjectForm from './hooks/useProjectForm';
import { apiWithAuth } from '../utils/api';

const EditProject = ({ projectId, onProjectUpdated }) => {
    const initialState = {
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
    };

    const onSave = async (projectData) => {
        try {
            const response = await apiWithAuth.put(`projects/${projectId}`, projectData);
            onProjectUpdated(response.data);
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const {
        projectData,
        handleInputChange,
        handleCheckboxChange,
        handleFileChange,
        handleSubmit,
        handleTechStackChange
    } = useProjectForm(initialState, projectId, onSave);

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

export default EditProject;
