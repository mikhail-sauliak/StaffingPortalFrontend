import React, { useState, useEffect } from 'react';
import { apiWithAuth } from '../utils/api.js';
import '../styles/styles.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, TextField, Box } from '@mui/material';

const CandidateSelector = ({ project, onProjectUpdated }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
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
      <TextField
        multiline
        fullWidth
        variant="outlined"
        value={selectedCandidates.map(candidate => `${candidate.firstName} ${candidate.lastName}`).join('\n')}
        InputProps={{ readOnly: true }}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={() => setShowModal(true)}>Add Candidate</Button>
      <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth maxWidth="md">
        <DialogTitle>Select a Candidate</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Stream</TableCell>
                  <TableCell>Tech Stack</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map(candidate => (
                  <TableRow key={candidate.id} sx={{ backgroundColor: isSuitableCandidate(candidate) ? '#dff0d8' : 'inherit' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCandidates.includes(candidate)}
                        onChange={() => handleSelectCandidate(candidate)}
                      />
                    </TableCell>
                    <TableCell>{candidate.firstName}</TableCell>
                    <TableCell>{candidate.lastName}</TableCell>
                    <TableCell>{candidate.location}</TableCell>
                    <TableCell>{candidate.stream}</TableCell>
                    <TableCell>{candidate.techStack}</TableCell>
                    <TableCell>{isSuitableCandidate(candidate) && <span>🌟 Suitable Candidate</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSaveCandidates} variant="contained">Save Candidates</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CandidateSelector;
