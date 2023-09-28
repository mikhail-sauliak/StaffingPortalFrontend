import React from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

const DeleteProject = ({ projectId, onProjectDeleted }) => {
  const handleDelete = () => {
    axios.delete(`https://localhost:7047/api/projects/${projectId}`)
      .then(response => {
        onProjectDeleted(projectId);
      })
      .catch(error => {
        console.error('There was an error deleting the project!', error);
      });
  };

  return (
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  );
};

export default DeleteProject;
