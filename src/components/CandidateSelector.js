import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Spinner } from 'react-bootstrap'; // Импортируйте Spinner
import axios from 'axios';

const CandidateSelector = ({ project, onProjectUpdated }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // Добавьте состояние загрузки

  useEffect(() => {
    setLoading(true);
    axios.get('https://localhost:7047/api/people')
      .then(response => {
        console.log('Candidates Loaded:', response.data); // Добавьте вывод в консоль
        setCandidates(response.data);
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
      candidateIds: selectedCandidates.map(c => c.id)
    };
    
    axios.put(`https://localhost:7047/api/projects/${project.id}`, updatedProject)
      .then(response => {
        console.log('Project updated:', response.data);
        setShowModal(false);
        onProjectUpdated(response.data); // Вызов callback для обновления проекта в списке
      })
      .catch(error => console.error('Error updating project:', error));
    };

  return (
    <div>
      <textarea 
        value={selectedCandidates.map(candidate => `${candidate.firstName} ${candidate.lastName}`).join('\n')} 
        readOnly 
        />
      <Button onClick={() => {
            console.log('Add Candidate Button Clicked!'); // Добавьте эту строку
            setShowModal(true);
        }}>Add Candidate</Button>
      
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select a Candidate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? ( // Если идет загрузка, отобразите Spinner
            <div style={{ textAlign: 'center' }}>
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </div>
          ) : (
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
                <Button onClick={handleSaveCandidates}>Save Candidates</Button>
            </Table>
          )}
        </Modal.Body>
      </Modal>      
    </div>
  );
};

export default CandidateSelector;
