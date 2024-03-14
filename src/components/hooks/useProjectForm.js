import { useState, useEffect } from 'react';
import { apiWithAuth } from '../../utils/api.js';
import { format } from 'date-fns';

const useProjectForm = (initialState = { techStack: [] }, projectId, onSave) => {
    const [projectData, setProjectData] = useState(initialState);

    useEffect(() => {
        if (projectId) {
            apiWithAuth.get(`projects/${projectId}`)
                .then(response => {
                    const project = response.data;
                    setProjectData({
                        ...project,
                        startDate: project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : '',
                        endDate: project.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : '',
                        positionSigned: project.positionSigned ? format(new Date(project.positionSigned), 'yyyy-MM-dd') : '',
                        positionClosed: project.positionClosed ? format(new Date(project.positionClosed), 'yyyy-MM-dd') : ''
                    });
                })
                .catch(error => console.error('Error fetching project data:', error));
        }
    }, [projectId]);

    const handleInputChange = event => {
        const { name, value } = event.target;
        setProjectData({ ...projectData, [name]: value });
    };

    const handleCheckboxChange = event => {
        const { name, checked } = event.target;
        setProjectData({ ...projectData, [name]: checked });
    };

    const handleFileChange = event => {
        setProjectData({ ...projectData, attachment: event.target.files[0] });
    };

    const handleTechStackChange = selectedOptions => {
        const techStackValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setProjectData({ ...projectData, techStack: techStackValues });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const dataToSend = {
            ...projectData,
            techStack: Array.isArray(projectData.techStack) ? projectData.techStack.join(', ') : projectData.techStack, 
            signed: projectData.signed ? true : false,
            attachment: projectData.attachment || "default_attachment_value",
            candidateIds: Array.isArray(projectData.candidateIds) ? projectData.candidateIds.join(',') : projectData.candidateIds
        };

        try {
            if (projectId) {
                await apiWithAuth.put(`projects/${projectId}`, dataToSend);
            } else {
                await apiWithAuth.post('projects', dataToSend);
            }
            onSave();
        } catch (error) {
            console.error('Error processing the project form:', error);
        }
    };

    return {
        projectData,
        setProjectData,
        handleInputChange,
        handleCheckboxChange,
        handleFileChange,
        handleTechStackChange,
        handleSubmit
    };
};

export default useProjectForm;
