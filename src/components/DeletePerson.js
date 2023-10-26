import React from 'react';
import axios from 'axios';
import { apiWithAuth, apiWithoutAuth } from '../utils/api.js'
import { Button } from 'react-bootstrap';

const DeletePerson = ({ personId, onPersonDeleted }) => {
  const handleDelete = () => {
    apiWithAuth.delete(`api/people/${personId}`)
      .then(() => {
        onPersonDeleted(personId);
      })
      .catch(error => {
        console.error('There was an error deleting the person!', error);
      });
  };

  return (
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  );
};

export default DeletePerson;
