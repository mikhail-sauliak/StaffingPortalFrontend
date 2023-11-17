import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Spinner } from 'react-bootstrap'; // import spinner
import { apiWithAuth } from '../utils/api.js'
import '../styles/styles.css';

const CandidateSelector = ({ project, onProjectUpdated }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); // add load state
  const [errors, setErrors] = useState({});
 
  useEffect(() => {
    setLoading(true);
    apiWithAuth.get('people')
      .then(response => {
        setCandidates(response.data.$values);
        console.log('Candidates Loaded:', response.data.$values);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading candidates:', error);
        setLoading(false);
      });
  }, []);

  const isSuitableCandidate = (candidate) => {
    const projectTechStackArray = project.techStack.split(', ');

    const techStackMatch = candidate.techStack && projectTechStackArray.some(tech => candidate.techStack.includes(tech));
    const levelMatch = candidate.level === project.level;

    const projectStartDate = new Date(project.startDate);
    const candidateAvailableFrom = new Date(candidate.availableFrom);

    const oneWeekAfterStart = new Date(projectStartDate);
    oneWeekAfterStart.setDate(projectStartDate.getDate() + 7);

    const availabilityMatch = candidate.isAvailable || (candidateAvailableFrom <= oneWeekAfterStart);

    return techStackMatch && levelMatch && availabilityMatch;
  };  

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
    const projectDataToUpdate = {
        name: project.name,
        techStack: project.techStack,
        startDate: project.startDate,
        endDate: project.endDate,
        comments: project.comments,
        search: project.search,
        signed: project.signed,
        positionSigned: project.positionSigned,
        positionClosed: project.positionClosed,
        location: project.location,
        stream: project.stream,
        level: project.level,
        priority: project.priority,
        attachment: project.attachment,
        candidateIds: selectedCandidates.map(c => c.id),
    };

    apiWithAuth.put(`projects/${project.id}`, projectDataToUpdate)
        .then(response => {
            console.log('Project updated:', response.data);
            setShowModal(false);
            onProjectUpdated(response.data);
        })
        .catch(error => {
            console.error('Error updating project:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        });
    };


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
      
      <Modal className="modal-custom" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header className="modal-header-custom" closeButton>
            <Modal.Title>Select a Candidate</Modal.Title>
        </Modal.Header  >
        <Modal.Body className="modal-body-custom">
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
                <Table className="table-custom">
                    <tbody>
                        {candidates.map(candidate => (
                            <tr key={candidate.id} style={isSuitableCandidate(candidate) ? { backgroundColor: '#dff0d8' } : {}}>
                                <td>
                                    <input 
                                        type="checkbox" 
                                        className="checkbox-custom"
                                        onChange={() => handleSelectCandidate(candidate)} 
                                        checked={selectedCandidates.includes(candidate)}
                                    />
                                </td>
                                <td>{candidate.firstName}</td>
                                <td>{candidate.lastName}</td>
                                <td>{candidate.location}</td>
                                <td>{candidate.stream}</td>
                                <td>{candidate.techStack}</td>
                                <td className="candidate-status">
                                  {isSuitableCandidate(candidate) && <span>🌟 Suitable Candidate</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Button className="btn-custom" onClick={handleSaveCandidates}>Save Candidates</Button>
            </>
        )}
    </Modal.Body>
    </Modal>
    </div>
  );
};

export default CandidateSelector;
