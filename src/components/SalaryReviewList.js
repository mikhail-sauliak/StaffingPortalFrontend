import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../utils/api.js';
import { Container, Table, Button, Modal, DropdownButton, Form, Dropdown } from 'react-bootstrap';
import { format } from 'date-fns';

const SalaryReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [people, setPeople] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [justification, setJustification] = useState('');
    const [newSalaryStartDate, setNewSalaryStartDate] = useState('');
    const [salaryReceivedDate, setSalaryReceivedDate] = useState('');
    const [talentManagerComments, setTalentManagerComments] = useState('');
    const [currency, setCurrency] = useState('');
    const [contractType, setContractType] = useState('');

    const fetchReviews = async () => {
        try {
            const responsePeople = await apiWithAuth.get('people');
            const response = await apiWithAuth.get('salaryreview');
            setPeople(responsePeople.data.$values);
            setReviews(response.data.$values);
            
        } catch (error) {
            console.error("Error fetching the salary reviews", error);
        }
    };
    
    const [loading, setLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);

    useEffect(() => {
        fetchReviews();
        setLoading(false);
    }, [refreshData]);

    const getPersonName = (personId) => {
        const person = people.find(p => p.id === personId);
        return person ? `${person.firstName} ${person.lastName}` : 'Unknown';
    };

    const handleSendReview = async () => {
        if (!selectedReview) {
            console.error('selectedReview is null');
            return;
        }
        const data = {
            personId: selectedReview.personId,
            justification,
            newSalaryStartDate,
            salaryReceivedDate,
            talentManagerComments,
            currency,
            contractType
        };
        try {
            await apiWithAuth.post('salaryreviewrequests', data);
            alert('Review request sent successfully');
            setShowReviewModal(false);
            setRefreshData(!refreshData);
        } catch (error) {
            console.error('Error sending review request:', error);
            alert('Failed to send review request');
        }
    };

    const handleShowReviewModal = (review) => {
        setSelectedReview(review);
        setJustification('');
        setNewSalaryStartDate('');
        setSalaryReceivedDate('');
        setTalentManagerComments('');
        setCurrency('');
        setContractType('');
        setShowReviewModal(true);
    };

    return (
        <Container fluid>
            
            <h2>Salary Reviews</h2>
            {loading ? (
            <div>Loading...</div>
            ) : (
            <React.Fragment>
            <Table responsive striped bordered hover>
                <thead>
                    <tr>
                        <th>PersonId</th>
                        <th>Person Name</th>
                        <th>ReviewDate</th>
                        <th>Justification</th>
                        <th>OldSalary</th>
                        <th>ProposedSalary</th>
                        <th>Currency</th>
                        <th>ContractType</th>
                        <th>NewSalaryStartDate</th>
                        <th>SalaryReceivedDate</th>
                        <th>DivisionManagerComments</th>
                        <th>TalentManagerComments</th>
                        <th>IsApproved</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map(review => (
                        <tr key={review.id}>
                            <td>{review.personId}</td>
                            <td>{getPersonName(review.personId)}</td>
                            <td>{format(new Date(review.reviewDate), 'dd/MM/yyyy')}</td> 
                            <td>{review.justification}</td>
                            <td>{review.oldSalary}</td>
                            <td>{review.proposedSalary}</td>
                            <td>{review.currency}</td>
                            <td>{review.contractType}</td>
                            <td>{format(new Date(review.newSalaryStartDate), 'dd/MM/yyyy')}</td> 
                            <td>{format(new Date(review.salaryReceivedDate), 'dd/MM/yyyy')}</td> 
                            <td>{review.divisionManagerComments}</td>
                            <td>{review.talentManagerComments}</td>
                            <td>{review.reviewResult}</td>
                            <td><Button variant="primary" onClick={() => handleShowReviewModal(review)}>
                                    Start Salary Review
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Start Salary Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="justification">
                            <Form.Label>Justification</Form.Label>
                            <Form.Control type="text" value={justification} onChange={e => setJustification(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="newSalaryStartDate">
                            <Form.Label>New Salary Start Date</Form.Label>
                            <Form.Control type="date" value={newSalaryStartDate} onChange={e => setNewSalaryStartDate(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="salaryReceivedDate">
                            <Form.Label>Salary Received Date</Form.Label>
                            <Form.Control type="date" value={salaryReceivedDate} onChange={e => setSalaryReceivedDate(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="talentManagerComments">
                            <Form.Label>Talent Manager Comments</Form.Label>
                            <Form.Control type="text" value={talentManagerComments} onChange={e => setTalentManagerComments(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="currencyDropdown">
                            <Form.Label>Currency</Form.Label>
                            <DropdownButton
                                id="currencyDropdown"
                                title={currency || "Select Currency"}
                                onSelect={(val) => setCurrency(val)}
                            >
                                {['USD', 'PLN', 'EUR', 'BGN', 'AED'].map(currency => (
                                    <Dropdown.Item key={currency} eventKey={currency}>{currency}</Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </Form.Group>
                        <Form.Group controlId="contractTypeDropdown">
                            <Form.Label>Contract Type</Form.Label>
                            <DropdownButton
                                id="contractTypeDropdown"
                                title={contractType || "Select Contract Type"}
                                onSelect={(val) => setContractType(val)}
                            >
                                {['B2B', 'EC'].map(contractType => (
                                    <Dropdown.Item key={contractType} eventKey={contractType}>{contractType}</Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSendReview}>
                        Send
                    </Button>
                </Modal.Footer>
            </Modal>

            </React.Fragment>
            )}
        </Container>
    );
}

export default SalaryReviewList;
