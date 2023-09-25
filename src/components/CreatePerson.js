import React, { useState } from 'react';
import axios from 'axios';

const CreatePerson = ({ onPersonCreated }) => {
  const [personData, setPersonData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    // Добавьте остальные поля
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPersonData({ ...personData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    axios.post('https://localhost:7047/api/people', personData)
      .then(response => {
        onPersonCreated(response.data); // Обновить список после создания
        setPersonData({
          firstName: '',
          lastName: '',
          location: '',
          // Очистить поля после успешного создания
        });
      })
      .catch(error => {
        console.error('There was an error creating a person!', error);
      });
  };

  return (
    <div>
      <h2>Create Person</h2>
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
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
};

export default CreatePerson;
