import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PersonList = () => {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    axios.get('https://localhost:7047/api/people')
      .then(response => {
        setPeople(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching people!', error);
      });
  }, []);

  return (
    <div>
      <h1>Person List</h1>
      <table border="1">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Location</th>
            <th>Available From</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {people.map(person => (
            <tr key={person.id}>
              <td>{person.firstName}</td>
              <td>{person.lastName}</td>
              <td>{person.location}</td>
              <td>{person.availableFrom}</td>
              <td>{person.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonList;
