import React from 'react';
import axios from 'axios';
import { apiWithAuth, apiWithoutAuth } from '../utils/api.js'
import { Button } from 'react-bootstrap';

const DeleteProject = ({ projectId, onProjectDeleted }) => {
  const handleDelete = () => {
    apiWithAuth.delete(`http://localhost:5297/api/projects/${projectId}`)
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
