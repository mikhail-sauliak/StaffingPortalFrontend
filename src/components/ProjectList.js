import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditProject from './EditProject';
import DeleteProject from './DeleteProject';
import CreateProject from './CreateProject';
import CandidateSelector from './CandidateSelector';

import { Table, Container, Button } from 'react-bootstrap';
import Sidebar from 'react-sidebar';

import { format } from 'date-fns';

  const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage, setProjectsPerPage] = useState(10);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarContent, setSidebarContent] = useState(null);

    useEffect(() => {
      axios.get('https://localhost:7047/api/projects')
        .then(response => {
          console.log(response.data); // check if project has candidates
          setProjects(response.data);
          setSidebarOpen(false);
        })
        .catch(error => {
          console.error('There was an error fetching projects!', error);
        });
    }, []);

    const filteredProjects = projects.filter(project => project.name.toLowerCase().includes(filter.toLowerCase()));
    const sortedProjects = filteredProjects.sort((a, b) => a[sort].localeCompare(b[sort]));

    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);
    const [refresh, setRefresh] = useState(false); // state to refresh the list

    const handleProjectUpdated = (updatedProject) => {
      setProjects(projects.map(project => project.id === updatedProject.id ? updatedProject : project));
      setRefresh(!refresh); // refresh state
    };

    const handleProjectDeleted = (deletedProjectId) => {
      setProjects(projects.filter(project => project.id !== deletedProjectId));
      setRefresh(!refresh);
    };

    const handleEditClick = (project) => {
      setSidebarContent(<EditProject projectId={project.id} onProjectUpdated={handleProjectUpdated} />);
      setSidebarOpen(true);
    };

    const handleCreateClick = () => {
      setSidebarContent(<CreateProject onProjectCreated={handleProjectCreated} />);
      setSidebarOpen(true);
    };

    const handleProjectCreated = (newProject) => {
      setProjects([...projects, newProject]);
      setSidebarOpen(false);
    };

    return (
      <div>
        <Sidebar
          sidebar={sidebarContent}
          open={sidebarOpen}
          onSetOpen={setSidebarOpen}
          pullRight={true}
          styles={{ sidebar: { background: "white", width: "300px", paddingTop: '56px' } }}
        >
          <Container fluid style={{ paddingTop: '56px' }}>
            <div>
              <h1>Project List</h1>
              <Button onClick={handleCreateClick}>Add New Project</Button>
              <label>Filter:</label>
              <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} />
              <label>Sort by:</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="name">Name</option>
                {/* Add other options as necessary */}
              </select>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Tech Stack</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Candidates</th> {/* changed to Candidates */}
                    <th>Comments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map(project => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.techStack}</td>
                      <td>{format(new Date(project.startDate), 'dd/MM/yyyy')}</td>
                      <td>{format(new Date(project.endDate), 'dd/MM/yyyy')}</td>
                      <td>
                        {project.candidates && project.candidates.length > 0 ? (
                          project.candidates.map(candidate => (
                            <div key={candidate.id}>
                              {candidate.firstName} {candidate.lastName}
                            </div>
                          ))
                        ) : (
                          <div>No Candidates</div>
                        )}
                        <CandidateSelector project={project} onProjectUpdated={handleProjectUpdated} />
                      </td>
                      <td>{project.comments}</td>
                      <td>
                        <Button onClick={() => handleEditClick(project)}>Edit</Button>
                        <DeleteProject projectId={project.id} onProjectDeleted={handleProjectDeleted} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Container>
        </Sidebar>
      </div>
    );
  };
  
  export default ProjectList;