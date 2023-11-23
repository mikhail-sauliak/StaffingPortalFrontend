import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../utils/api.js';
import { Container, Table, DropdownButton, Dropdown } from 'react-bootstrap';
import { format } from 'date-fns';

const SalaryReviewsHistory = () => {
    const [history, setHistory] = useState([]);
    const [people, setPeople] = useState([]);
    const [selectedPersonId, setSelectedPersonId] = useState(null);

    useEffect(() => {
        fetchPeople();
    }, []);

    const fetchPeople = async () => {
        try {
            const response = await apiWithAuth.get('people');
            setPeople(response.data.$values);
        } catch (error) {
            console.error('Error fetching people!', error);
        }
    };

    const fetchHistory = async (personId) => {
        try {
            const response = await apiWithAuth.get(`salaryreview/history/${personId}`);
            setHistory(response.data.$values);
        } catch (error) {
            console.error('Error fetching salary review history!', error);
        }
    };

    const handlePersonSelect = (personId) => {
        setSelectedPersonId(personId);
        fetchHistory(personId);
    };

    const getSelectedPersonName = () => {
        const selectedPerson = people.find(p => p.id === parseInt(selectedPersonId));
        return selectedPerson ? `${selectedPerson.firstName} ${selectedPerson.lastName}` : "Select a Person";
    };

    return (
        <Container fluid>
            <h2>Salary Reviews History</h2>
            <DropdownButton 
                id="dropdown-basic-button" 
                title={getSelectedPersonName()} 
                onSelect={handlePersonSelect}
            >
                {people.map(person => (
                    <Dropdown.Item key={person.id} eventKey={person.id}>
                        {person.firstName} {person.lastName}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Justification</th>
                        <th>Review Date</th>
                        <th>New Salary Start Date</th>
                        <th>New Salary Received Date</th>
                        <th>Old Salary</th>
                        <th>New Salary</th>
                        <th>Salary Change</th>
                        <th>Currency</th>
                        <th>Contract Type</th>
                        <th>Review Result</th>
                        <th>Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(review => (
                        <tr key={review.historyId}>
                            <td>{review.justification}</td>
                            <td>{format(new Date(review.reviewDate), 'dd/MM/yyyy')}</td>
                            <td>{format(new Date(review.newSalaryStartDate), 'dd/MM/yyyy')}</td>
                            <td>{format(new Date(review.salaryReceivedDate), 'dd/MM/yyyy')}</td>
                            <td>{review.oldSalary}</td>
                            <td>{review.proposedSalary}</td>
                            <td>{Math.round(review.proposedSalary - review.oldSalary)}</td>
                            <td>{review.currency}</td>
                            <td>{review.contractType}</td>
                            <td>{review.reviewResult}</td>
                            <td>{review.talentManagerComments || review.divisionManagerComments}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default SalaryReviewsHistory;
