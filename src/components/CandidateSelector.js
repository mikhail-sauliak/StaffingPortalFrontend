import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Spinner } from 'react-bootstrap'; // import spinner
import { apiWithAuth, apiWithoutAuth } from '../utils/api.js'

const CandidateSelector = ({ project, onProjectUpdated }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // add load state
  const [errors, setErrors] = useState({});
 
  useEffect(() => {
    setLoading(true);
    apiWithAuth.get('api/people')
      .then(response => {
        setCandidates(response.data);
        console.log('Candidates Loaded:', response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading candidates:', error);
        setLoading(false);
      });
  }, []);

  const handleAddCandidate = (candidate) => {
    if (!selectedCandidates.includes(candidate)) {
      setSelectedCandidates([...selectedCandidates, candidate]);
    }
    setShowModal(false);
  };

  const handleSelectCandidate = (candidate) => {
    if (selectedCandidates.includes(candidate)) {
      setSelectedCandidates(selectedCandidates.filter(c => c !== candidate));
    } else {
      setSelectedCandidates([...selectedCandidates, candidate]);
    }
  };

  const handleSaveCandidates = () => {
    const updatedProject = {
      ...project,
      candidateIds: selectedCandidates.map(c => c.id),
    };
    
    apiWithAuth.put(`projects/${project.id}`, updatedProject)
      .then(response => {
        console.log('Project updated:', response.data);
        setShowModal(false);
        onProjectUpdated(response.data); // callback to renew project in a list
      })
      .catch(error => {
        console.error('Error updating project:', error);
        if (error.response && error.response.data && error.response.data.errors) {
            setErrors(error.response.data.errors); // Установка ошибок в state
        }
    })};

  return (
    <div>
      <textarea 
        value={selectedCandidates.map(candidate => `${candidate.firstName} ${candidate.lastName}`).join('\n')} 
        readOnly 
        />
      <Button onClick={() => {
            console.log('Add Candidate Button Clicked!');
            setShowModal(true);
        }}>Add Candidate</Button>
      
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Select a Candidate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {errors.Name && <p style={{color: 'red'}}>{errors.Name[0]}</p>} {/* error with Name */}
            {errors.Level && <p style={{color: 'red'}}>{errors.Level[0]}</p>} {/* error with Level */}
            {errors.Location && <p style={{color: 'red'}}>{errors.Location[0]}</p>} {/* error with Location */}
            {errors.Stream && <p style={{color: 'red'}}>{errors.Stream[0]}</p>} {/* error with Stream */}
            {errors.TechStack && <p style={{color: 'red'}}>{errors.TechStack[0]}</p>} {/* error with TechStack */}
            {errors.Priority && <p style={{color: 'red'}}>{errors.Priority[0]}</p>} {/* error with Priority */}
            {loading ? (
            <div style={{ textAlign: 'center' }}>
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </div>
        ) : (
            <>
                <Table>
                    <tbody>
                        {candidates.map(candidate => (
                            <tr key={candidate.id}>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        onChange={() => handleSelectCandidate(candidate)} 
                                        checked={selectedCandidates.includes(candidate)}
                                    />
                                </td>
                                <td>{candidate.firstName}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button onClick={handleSaveCandidates}>Save Candidates</Button>
            </>
        )}
    </Modal.Body>
    </Modal>
    </div>
  );
};

export default CandidateSelector;
