import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreatePerson from './CreatePerson';
import DeletePerson from './DeletePerson';
import EditPerson from './EditPerson';

import { Table, Container, Button } from 'react-bootstrap';
import Sidebar from 'react-sidebar';

import { differenceInDays, differenceInMonths, differenceInWeeks, parseISO } from 'date-fns';

const PersonList = () => {
  const [people, setPeople] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    fetchPeople();
  }, [refresh]);

  const fetchPeople = () => {
    axios.get('https://localhost:7047/api/people')
      .then(response => {
        setPeople(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching people!', error);
      });
  };

  const calculateAvailability = (availableFromDate) => {
    const currentDate = new Date();
    const availableDate = parseISO(availableFromDate); // Предполагается, что availableFromDate в формате ISO 8601
    
    const months = differenceInMonths(availableDate, currentDate);
    const weeks = differenceInWeeks(availableDate, currentDate) % 4; // 4 недели в месяце
    const days = differenceInDays(availableDate, currentDate) % 7; // 7 дней в неделе
    
    return `${months} months ${weeks} weeks ${days} days`;
  };

  const handlePersonCreated = (newPerson) => {
    setPeople([...people, newPerson]);
    setSidebarOpen(false);
    setRefresh(!refresh);
  };

  const handlePersonDeleted = (personId) => {
    setPeople(people.filter(person => person.id !== personId));
    setRefresh(!refresh);
  };

  const handlePersonUpdated = (updatedPerson) => {
    setPeople(people.map(person => (person.id === updatedPerson.id ? updatedPerson : person)));
    setSidebarOpen(false);
    setRefresh(!refresh);
  };

  const handleCreateClick = () => {
    setSidebarContent(<CreatePerson onPersonCreated={handlePersonCreated} />);
    setSidebarOpen(true);
  };

  const handleEditClick = (person) => {
    setSidebarContent(<EditPerson personId={person.id} onPersonUpdated={handlePersonUpdated} />);
    setSidebarOpen(true);
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
          <h1>Person List</h1>
          <Button onClick={handleCreateClick}>Add New Person</Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Location</th>
                <th>Division Manager</th>
                <th>Resource Manager</th>
                <th>Available From</th>
                <th>Availability</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {people.map(person => (
                <tr key={person.id}>
                    <td>{person.firstName}</td>
                    <td>{person.lastName}</td>
                    <td>{person.location}</td>
                    <td>{person.divisionManager}</td>
                    <td>{person.resourceManager}</td>
                    <td>{person.availableFrom}</td>
                    <td>{calculateAvailability(person.availableFrom)}</td>
                    <td>{person.comments}</td>
                    <td>
                        <Button onClick={() => handleEditClick(person)}>Edit</Button>
                        <DeletePerson personId={person.id} onPersonDeleted={handlePersonDeleted} />
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

export default PersonList;
