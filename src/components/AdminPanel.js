import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Button, Table } from 'react-bootstrap';
import { apiWithAuth } from '../utils/api.js';
import EditPersonModal from './EditPersonModal.js';
import CreateManager from './CreateManager';
import getUserRoleFromToken from './hooks/getUserRole.js';
import SalaryStatistics from './SalaryStatistics.js';
import FileUpload from '../utils/FileUpload.js';
import { format } from 'date-fns';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('People');
    const [people, setPeople] = useState([]);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [selectedDivisionManager, setSelectedDivisionManager] = useState(null);
    const [talentManagers, setTalentManagers] = useState([]);    

    const [newPerson, setNewPerson] = useState({
        firstName: '',
        lastName: '',
        location: '',
        divisionManagerId: null,
        talentManagerId: null,
        availableFrom: '',
        techStack: '',
        stream: '',
        level: '',
        role: ''
    });

    const userRole = getUserRoleFromToken();

    useEffect(() => {  
        fetchPeople();
    }, [userRole]);    

    const fetchPeople = () => {
        Promise.all([
            apiWithAuth.get('people'),
            apiWithAuth.get('user')
        ])
        .then(([peopleResponse, usersResponse]) => {
            const peopleData = peopleResponse.data.$values;
            const usersData = usersResponse.data.$values;
    
            const updatedPeople = peopleData.map(person => {
                const user = usersData.find(u => u.personId === person.id);
                const role = user ? user.role : 'Employee';
    
                const divisionManager = peopleData.find(p => p.userId === person.divisionManagerId);
                const talentManager = peopleData.find(p => p.userId === person.talentManagerId);
    
                const divisionManagerName = divisionManager ? `${divisionManager.firstName} ${divisionManager.lastName}` : '';
                const talentManagerName = talentManager ? `${talentManager.firstName} ${talentManager.lastName}` : '';
    
                return {
                    ...person,
                    role,
                    divisionManagerName,
                    talentManagerName,
                };
            });
    
            setPeople(updatedPeople);
        })
        .catch(error => {
            console.error('There was an error fetching people or users!', error);
        });
    };

    if (userRole !== 'Head' && userRole !== 'DeputyHead' && userRole !== 'DivisionManager') {
        return <div>Access Denied</div>;
    }

    const fetchTalentManagers = (managerId) => {
        apiWithAuth.get(`administration/manager/${managerId}/subordinates`)
            .then(response => {
                setTalentManagers(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching talent managers!', error);
            });
    };    

    const handleDivisionManagerChange = (managerId) => {
        setSelectedDivisionManager(managerId);
        fetchTalentManagers(managerId);
    };
    
    const handleDeleteClick = async (personId) => {
        await apiWithAuth.delete(`people/${personId}`);
        fetchPeople();
    };

    const handleUploadSuccess = () => {
        fetchPeople();
    };

    const handleUpdatePerson = async (personId, updatedData) => {
        await apiWithAuth.put(`people/${personId}`, updatedData);
        fetchPeople();
    };

    const handleEditClick = (person) => {
        setEditingPerson(person);
        setEditModalOpen(true);
    };

    const handleSaveEditModal = async (editedPerson) => {
        await handleUpdatePerson(editedPerson.id, editedPerson);
        setEditModalOpen(false);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-8"></div>
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    {/* <Tabs defaultActiveKey="createManager" id="admin-panel-tabs"> */}
                        <Tab eventKey="createManager" title="Create Manager">
                            <CreateManager />
                        </Tab>
                    <Tab eventKey="People" title="People">                
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Location</th>
                                    <th>Role</th>
                                    <th>Division Manager ID</th>
                                    <th>Talent Manager ID</th>
                                    <th>Available From</th>
                                    <th>Tech Stack</th>
                                    <th>Stream</th>
                                    <th>Level</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {people.map(person => (
                                    <tr key={person.id}>
                                        <td>{person.firstName}</td>
                                        <td>{person.lastName}</td>
                                        <td>{person.location}</td>
                                        <td>{person.role}</td>
                                        <td>{person.divisionManagerName}</td>
                                        <td>{person.talentManagerName}</td>
                                        <td>{format(new Date(person.availableFrom), 'dd/MM/yyyy')}</td> 
                                        <td>{person.techStack}</td>
                                        <td>{person.stream}</td>
                                        <td>{person.level}</td>
                                        <td>
                                            <Button onClick={() => handleEditClick(person)}>Edit</Button>
                                            <Button onClick={() => handleDeleteClick(person.id)}>Delete</Button>
                                        </td>
                                        {isEditModalOpen && 
                                            <EditPersonModal 
                                                person={editingPerson} 
                                                onClose={handleCloseEditModal} 
                                                onSave={handleSaveEditModal}
                                            />
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Tab>
                    <Tab eventKey="SalaryReviews" title="SalaryReviews">
                        {/* Content for SalaryReviews tab */}
                    </Tab>
                    <Tab eventKey="Statistics" title="Statistics">
                        <SalaryStatistics />
                    </Tab>
                    <Tab eventKey="UploadData" title="Upload Data">
                        <FileUpload onUploadSuccess={handleUploadSuccess} />
                    </Tab>
                </Tabs>
            </div>
        </div>        
    );
};

export default AdminPanel;
