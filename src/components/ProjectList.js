import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('https://localhost:7047/api/projects')
      .then(response => {
        setProjects(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching projects!', error);
      });
  }, []);

  return (
    <div>
      <h1>Project List</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Tech Stack</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td>{project.techStack}</td>
              <td>{project.startDate}</td>
              <td>{project.endDate}</td>
              <td>{project.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectList;
