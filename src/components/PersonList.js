import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../utils/api.js'
import CreatePerson from './CreatePerson';
import DeletePerson from './DeletePerson';
import EditPerson from './EditPerson';
import { format } from 'date-fns';

import { Table, Container, Button } from 'react-bootstrap';
import Sidebar from 'react-sidebar';

import { differenceInDays, differenceInMonths, differenceInWeeks, parseISO } from 'date-fns';

const PersonList = () => {
  const [people, setPeople] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [sidebarTitle, setSidebarTitle] = useState('');
 
  useEffect(() => {    
    setSidebarOpen(false);
    fetchPeople();
  }, [refresh]);

  const fetchPeople = () => {
    apiWithAuth.get('people')
      .then(response => {
        console.log(response.data);
        const peopleData = response.data.$values;
        const updatedPeople = peopleData.map(person => {
          const divisionManager = peopleData.find(p => p.userId === person.divisionManagerId);
          const talentManager = peopleData.find(p => p.userId === person.talentManagerId);
    
          const divisionManagerName = divisionManager ? `${divisionManager.firstName} ${divisionManager.lastName}` : 'No Manager';
          const talentManagerName = talentManager ? `${talentManager.firstName} ${talentManager.lastName}` : 'No Manager';
    
          return {
            ...person,
            divisionManagerName,
            talentManagerName,
          };
        });
        setPeople(updatedPeople);
      })
      .catch(error => {
        console.error('There was an error fetching people!', error);
      });
  };

  const calculateAvailability = (availableFromDate) => {
    const currentDate = new Date();
    const availableDate = parseISO(availableFromDate); // ISO 8601
    
    const months = differenceInMonths(availableDate, currentDate);
    const weeks = differenceInWeeks(availableDate, currentDate) % 4; // 4 weeks in a month
    const days = differenceInDays(availableDate, currentDate) % 7; // 7 days in a week
    
    return `${months} months ${weeks} weeks ${days} days`;
  };

  const handlePersonCreated = () => {
    setSidebarOpen(false);
    setRefresh(!refresh);
  };

  const handlePersonDeleted = (personId) => {
    setPeople(people.filter(person => person.id !== personId));
    setRefresh(!refresh);
  };

  const handlePersonUpdated = (updatedPerson) => {
    console.log("Updated Person:", updatedPerson);
    console.log("Current people list:", people);
  
    const divisionManager = people.find(p => p.userId === updatedPerson.divisionManagerId);
    const talentManager = people.find(p => p.userId === updatedPerson.talentManagerId);
  
    console.log("Found division manager:", divisionManager);
    console.log("Found talent manager:", talentManager);
  
    const divisionManagerName = divisionManager ? `${divisionManager.firstName} ${divisionManager.lastName}` : 'No Manager';
    const talentManagerName = talentManager ? `${talentManager.firstName} ${talentManager.lastName}` : 'No Manager';
  
    const updatedPersonFormatted = {
      ...updatedPerson,
      divisionManagerName,
      talentManagerName
    };
  
    setPeople(people.map(person => person.id === updatedPersonFormatted.id ? updatedPersonFormatted : person));
  
    setSidebarOpen(false);
    setRefresh(!refresh);
  };

  const handleCreateClick = () => {
    setSidebarContent(<CreatePerson onPersonCreated={handlePersonCreated} />);
    setSidebarOpen(true);
    setSidebarTitle("New Person");
  };

  const handleEditClick = (person) => {
    setSidebarContent(
      <EditPerson
        personId={person.id}
        onPersonUpdated={handlePersonUpdated}
      />
    );
    setSidebarOpen(true);
    setSidebarTitle("Edit Person");
  };

  const formatAvailableDate = (availableFromDate) => {
    if (!availableFromDate) {
      return 'N/A'; // Fallback for invalid or missing dates
    }

    try {
      const parsedDate = parseISO(availableFromDate);
      return format(parsedDate, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const customSidebarStyles = {
    sidebar: {
        background: "white",
        width: "400px",
        padding: "50px 20px 20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderLeft: "1px solid #ddd",
        overflowY: "auto",
        zIndex: "2",
    },
    overlay: {
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: "1",
    }
  };

  return (
    <div>
    <Sidebar
        sidebar={
          <>
              <h3 style={{ padding: '10px' }}>{sidebarTitle}</h3>
              {sidebarContent}
          </>
      }
        open={sidebarOpen}
        onSetOpen={setSidebarOpen}
        pullRight={true}
        styles={customSidebarStyles}
      >
    <Container fluid style={{ paddingTop: '56px' }} className="sidebar-container-custom">      
        <div>
          <h1>Person List</h1>
          <Button onClick={handleCreateClick}>Add New Person</Button>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Stream</th>
                <th>Location</th>
                <th>Division Manager</th>
                <th>Talent Manager</th>
                <th>Available From</th>
                <th>TM Aware</th>
                <th>Level</th>
                <th>Assignment Exists in GCP</th>
                <th>Planned Assignment</th>
                <th>Tech Stack</th>
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
                    <td>{person.stream}</td>
                    <td>{person.location}</td>
                    <td>{person.divisionManagerName}</td>
                    <td>{person.talentManagerName}</td>
                    <td>{formatAvailableDate(person.availableFrom)}</td>
                    <td>{person.tmAware}</td>
                    <td>{person.level}</td>
                    <td>
                        {person.assignmentExistsInGCP ? (
                            <span style={{ color: 'green' }}>Yes</span>
                        ) : (
                            <span style={{ color: 'red' }}>No</span>
                        )}
                    </td>
                    <td>{person.plannedAssignment}</td>
                    <td>{person.techStack}</td>                    
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
