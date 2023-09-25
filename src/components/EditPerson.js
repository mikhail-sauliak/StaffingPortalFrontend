import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditPerson = ({ personId, onPersonUpdated }) => {
  const [personData, setPersonData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    // Добавьте остальные поля
  });

  useEffect(() => {
    axios.get(`https://localhost:7047/api/people/${personId}`)
      .then(response => {
        setPersonData(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching person data!', error);
      });
  }, [personId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPersonData({ ...personData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    axios.put(`https://localhost:7047/api/people/${personId}`, personData)
      .then(response => {
        onPersonUpdated(response.data); // Обновить список после редактирования
      })
      .catch(error => {
        console.error('There was an error updating the person!', error);
      });
  };

  return (
    <div>
      <h2>Edit Person</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input type="text" name="firstName" value={personData.firstName} onChange={handleInputChange} />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" name="lastName" value={personData.lastName} onChange={handleInputChange} />
        </div>
        <div>
          <label>Location:</label>
          <input type="text" name="location" value={personData.location} onChange={handleInputChange} />
        </div>
        {/* Добавьте остальные поля */}
        <div>
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditPerson;
