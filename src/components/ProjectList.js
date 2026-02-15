// import React, { useState, useEffect } from 'react';
// import { apiWithAuth } from '../utils/api.js';
// import EditProject from './EditProject';
// import DeleteProject from './DeleteProject';
// import CreateProject from './CreateProject';
// import CandidateSelector from './CandidateSelector';
// import { StyledHeaderCell, StyledTableCell } from '../styles/Styles';

// import { format } from 'date-fns';
// import { Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, Drawer, Typography, Grid } from '@mui/material';

// const ProjectList = () => {
//     const [projects, setProjects] = useState([]);
//     const [filter, setFilter] = useState('');
//     const [sort, setSort] = useState('name');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [projectsPerPage, setProjectsPerPage] = useState(10);
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [sidebarContent, setSidebarContent] = useState(null);

//     useEffect(() => {
//         apiWithAuth.get('projects')
//             .then(response => {
//                 setProjects(response.data.$values);
//                 setSidebarOpen(false);
//             })
//             .catch(error => {
//                 console.error('There was an error fetching projects!', error);
//             });
//     }, []);

//     const filteredProjects = projects.filter(project => project.name.toLowerCase().includes(filter.toLowerCase()));
//     const sortedProjects = filteredProjects.sort((a, b) => a[sort].localeCompare(b[sort]));

//     const indexOfLastProject = currentPage * projectsPerPage;
//     const indexOfFirstProject = indexOfLastProject - projectsPerPage;
//     const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);

//     const handleProjectUpdated = (updatedProject) => {
//         setProjects(projects.map(project => project.id === updatedProject.id ? updatedProject : project));
//         setSidebarOpen(false);
//     };

//     const handleProjectDeleted = (deletedProjectId) => {
//         setProjects(projects.filter(project => project.id !== deletedProjectId));
//     };

//     const handleEditClick = (project) => {
//         setSidebarContent(<EditProject projectId={project.id} onProjectUpdated={handleProjectUpdated} />);
//         setSidebarOpen(true);
//     };

//     const handleCreateClick = () => {
//         setSidebarContent(<CreateProject onProjectCreated={handleProjectCreated} />);
//         setSidebarOpen(true);
//     };

//     const handleProjectCreated = (newProject) => {
//         setProjects([...projects, newProject]);
//         setSidebarOpen(false);
//     };

//     return (
//         <Box sx={{ display: 'flex' }}>
//             <Drawer
//                 anchor="right"
//                 open={sidebarOpen}
//                 onClose={() => setSidebarOpen(false)}
//             >
//                 {sidebarContent}
//             </Drawer>
//             <Grid container spacing={2} sx={{ p: 3 }}>
//                 <Grid item xs={12}>
//                     <Typography variant="h4">Project List</Typography>
//                     <Button variant="contained" color="primary" onClick={handleCreateClick} sx={{ my: 2 }}>
//                         Add New Project
//                     </Button>
//                     <Box>
//                     </Box>
//                     <TableContainer component={Paper}>
//                         <Table sx={{ minWidth: 650 }} aria-label="simple table">
//                             <TableHead>
//                                 <TableRow>
//                                     <StyledHeaderCell>Name</StyledHeaderCell>
//                                     <StyledHeaderCell>Tech Stack</StyledHeaderCell>
//                                     <StyledHeaderCell>Start Date</StyledHeaderCell>
//                                     <StyledHeaderCell>End Date</StyledHeaderCell>
//                                     <StyledHeaderCell>Search</StyledHeaderCell>
//                                     <StyledHeaderCell>Signed</StyledHeaderCell>
//                                     <StyledHeaderCell>Position Signed</StyledHeaderCell>
//                                     <StyledHeaderCell>Position Closed</StyledHeaderCell>
//                                     <StyledHeaderCell>Location</StyledHeaderCell>
//                                     <StyledHeaderCell>Stream</StyledHeaderCell>
//                                     <StyledHeaderCell>Level</StyledHeaderCell>
//                                     <StyledHeaderCell>Priority</StyledHeaderCell>
//                                     <StyledHeaderCell>Attachment</StyledHeaderCell>
//                                     <StyledHeaderCell>Candidates</StyledHeaderCell>
//                                     <StyledHeaderCell>Comments</StyledHeaderCell>
//                                     <StyledHeaderCell>Actions</StyledHeaderCell>
//                                 </TableRow>
//                             </TableHead>
//                             <TableBody>
//                                 {currentProjects.map((project) => (
//                                     <TableRow key={project.id}>
//                                         <StyledTableCell>{project.name}</StyledTableCell>
//                                         <StyledTableCell>{project.techStack}</StyledTableCell>
//                                         <StyledTableCell>{format(new Date(project.startDate), 'dd/MM/yyyy')}</StyledTableCell>
//                                         <StyledTableCell>{format(new Date(project.endDate), 'dd/MM/yyyy')}</StyledTableCell>
//                                         <StyledTableCell>{project.search}</StyledTableCell>
//                                         <StyledTableCell>{project.signed ? 'Yes' : 'No'}</StyledTableCell>
//                                         <StyledTableCell>{format(new Date(project.positionSigned), 'dd/MM/yyyy')}</StyledTableCell>
//                                         <StyledTableCell>{format(new Date(project.positionClosed), 'dd/MM/yyyy')}</StyledTableCell>
//                                         <StyledTableCell>{project.location}</StyledTableCell>
//                                         <StyledTableCell>{project.stream}</StyledTableCell>
//                                         <StyledTableCell>{project.level}</StyledTableCell>
//                                         <StyledTableCell>{project.priority}</StyledTableCell>
//                                         <StyledTableCell>{project.attachment ? 'Yes' : 'No'}</StyledTableCell>
//                                         <StyledTableCell>
//                                             {project.candidates && project.candidates.length > 0 ? (
//                                                 project.candidates.map(candidate => (
//                                                     <div key={candidate.id}>
//                                                         {candidate.firstName} {candidate.lastName}
//                                                     </div>
//                                                 ))
//                                             ) : (
//                                                 <div>No Candidates</div>
//                                             )}
//                                             <CandidateSelector project={project} onProjectUpdated={handleProjectUpdated} />
//                                         </StyledTableCell>
//                                         <StyledTableCell>{project.comments}</StyledTableCell>
//                                         <StyledTableCell>
//                                             <Button variant="outlined" color="primary" onClick={() => handleEditClick(project)}>Edit</Button>
//                                             <DeleteProject projectId={project.id} onProjectDeleted={handleProjectDeleted} />
//                                         </StyledTableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </TableContainer>
//                 </Grid>
//             </Grid>
//         </Box>
//     );
// };

// export default ProjectList;

// import React, { useState, useEffect } from 'react';
// import { apiWithAuth } from '../utils/api.js';
// import EditProject from './EditProject';
// import DeleteProject from './DeleteProject';
// import CreateProject from './CreateProject';
// import CandidateSelector from './CandidateSelector';
// import { Box, Button, Typography, Grid, Drawer } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
// import { isValid, parseISO, format } from 'date-fns';

// const ProjectList = () => {
//     const [projects, setProjects] = useState([]);
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [sidebarContent, setSidebarContent] = useState(null);

//     const processProjectsData = (data) => {
//         return data.$values.map(project => ({
//           ...project,
//           startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
//           endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
//           positionSigned: project.positionSigned ? new Date(project.positionSigned).toISOString() : null,
//           positionClosed: project.positionClosed ? new Date(project.positionClosed).toISOString() : null,
//           candidates: project.candidates?.$values.map(candidate => `${candidate.firstName} ${candidate.lastName}`).join(', ') || 'No Candidates'
//         }));
//       };

//       useEffect(() => {
//         apiWithAuth.get('projects')
//           .then(response => {
//             const processedData = processProjectsData(response.data);
//             setProjects(processedData);
//             setSidebarOpen(false);
//           })
//           .catch(error => {
//             console.error('There was an error fetching projects!', error);
//           });
//       }, []);

//     const renderActions = (params) => (
//         <strong>
//             <Button
//                 onClick={() => handleEditClick(params.row)}
//                 variant="outlined"
//                 color="primary"
//                 size="small"
//                 style={{ marginLeft: 16 }}
//             >
//                 Edit
//             </Button>
//             <DeleteProject projectId={params.row.id} onProjectDeleted={handleProjectDeleted} />
//         </strong>
//     );

//     const columns = [
//         { field: 'name', headerName: 'Name', width: 150 },
//         { field: 'techStack', headerName: 'Tech Stack', width: 130 },
//         { field: 'startDate', headerName: 'Start Date', width: 130, valueGetter: (params) => params.value ? format(new Date(params.value), 'dd/MM/yyyy') : "N/A" },
//         { field: 'endDate', headerName: 'End Date', width: 130, valueGetter: (params) => params.value ? format(new Date(params.value), 'dd/MM/yyyy') : "N/A" },
//         { field: 'search', headerName: 'Search', width: 120 },
//         { field: 'signed', headerName: 'Signed', width: 100, valueGetter: (params) => params.value ? 'Yes' : 'No' },
//         { field: 'positionSigned', headerName: 'Position Signed', width: 150, valueGetter: (params) => params.value ? format(new Date(params.value), 'dd/MM/yyyy') : "N/A" },
//         { field: 'positionClosed', headerName: 'Position Closed', width: 150, valueGetter: (params) => params.value ? format(new Date(params.value), 'dd/MM/yyyy') : "N/A" },
//         { field: 'location', headerName: 'Location', width: 120 },
//         { field: 'stream', headerName: 'Stream', width: 110 },
//         { field: 'level', headerName: 'Level', width: 110 },
//         { field: 'priority', headerName: 'Priority', width: 110 },
//         { field: 'attachment', headerName: 'Attachment', width: 130, valueGetter: (params) => params.value ? 'Yes' : 'No' },
//         { field: 'candidates', headerName: 'Candidates', width: 300 },
//         { field: 'comments', headerName: 'Comments', width: 200 }
//       ];

//     const handleEditClick = (project) => {
//         setSidebarContent(<EditProject projectId={project.id} onProjectUpdated={handleProjectUpdated} />);
//         setSidebarOpen(true);
//     };

//     const handleProjectUpdated = (updatedProject) => {
//         setProjects(projects.map(project => project.id === updatedProject.id ? updatedProject : project));
//         setSidebarOpen(false);
//     };

//     const handleProjectDeleted = (deletedProjectId) => {
//         setProjects(projects.filter(project => project.id !== deletedProjectId));
//     };

//     const handleCreateClick = () => {
//         setSidebarContent(<CreateProject onProjectCreated={handleProjectCreated} />);
//         setSidebarOpen(true);
//     };

//     const handleProjectCreated = (newProject) => {
//         setProjects([...projects, newProject]);
//         setSidebarOpen(false);
//     };

//     return (
//         <Box sx={{ height: 650, width: '100%', overflow: 'auto' }}>
//             <Drawer anchor="right" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
//                 {sidebarContent}
//             </Drawer>
//             <Grid container spacing={2} sx={{ p: 3 }}>
//                 <Grid item xs={12}>
//                     <Typography variant="h4" gutterBottom>
//                         Project List
//                     </Typography>
//                     <Button variant="contained" color="primary" onClick={handleCreateClick} sx={{ mb: 2 }}>
//                         Add New Project
//                     </Button>
//                     <DataGrid
//                         rows={projects}
//                         columns={columns}
//                         pageSize={10}
//                         rowsPerPageOptions={[5, 10, 20]}
//                         checkboxSelection
//                     />
//                 </Grid>
//             </Grid>
//         </Box>
//     );
// };

// export default ProjectList;
import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem, GridRowModes, GridToolbarContainer } from '@mui/x-data-grid';
import { Box, Button, Typography, Grid, Drawer } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { apiWithAuth } from '../utils/api.js';
import EditProject from './EditProject';
import DeleteProject from './DeleteProject';
import CreateProject from './CreateProject';
import CandidateSelector from './CandidateSelector';
import { isValid, parseISO, format } from 'date-fns';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarContent, setSidebarContent] = useState(null);

    const processProjectsData = (data) => {
        return data.map(project => ({
            ...project,
            startDate: project.startDate ? new Date(project.startDate) : null,
            endDate: project.endDate ? new Date(project.endDate) : null,
            positionSigned: project.positionSigned ? new Date(project.positionSigned) : null,
            positionClosed: project.positionClosed ? new Date(project.positionClosed) : null,
            candidates: project.candidates && project.candidates.$values 
                        ? project.candidates.$values.map(candidate => `${candidate.firstName} ${candidate.lastName}`).join(', ') 
                        : 'No Candidates'
        }));
    };

    useEffect(() => {
        apiWithAuth.get('projects')
            .then(response => {
                const processedData = processProjectsData(response.data.$values);
                console.log('processedData', processedData);
                setProjects(processedData);
                setSidebarOpen(false);
            })
            .catch(error => {
                console.error('There was an error fetching projects!', error);
            });
    }, []);

    const handleRowEditStart = (params, event) => {
        event.defaultMuiPrevented = true;
    };

    const handleRowEditStop = (params, event) => {
        event.defaultMuiPrevented = true;
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.Edit },
        });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
        });
    };

    const handleDeleteClick = (id) => () => {
        setProjects(projects.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
        });
    };

    const columns = [
                { field: 'name', headerName: 'Name', width: 150, editable: true },
                { field: 'techStack', headerName: 'Tech Stack', width: 130, editable: true },
                {
                    field: 'startDate',
                    headerName: 'Start Date',
                    type: 'date',
                    width: 130,                    
                    editable: true,
                },
                {
                    field: 'endDate',
                    headerName: 'End Date',
                    type: 'date',
                    width: 130,  
                    editable: true,
                },
                // { field: 'search', headerName: 'Search', width: 120, editable: true },
                { field: 'signed', headerName: 'Signed', width: 100, valueGetter: (params) => params.value ? 'Yes' : 'No', editable: true },
                // { field: 'positionSigned', type: 'date', headerName: 'Position Signed', width: 150, valueGetter: (params) => params.value ? format(new Date(params.value), 'dd/MM/yyyy') : "N/A", editable: true },
                // { field: 'positionClosed', type: 'date', headerName: 'Position Closed', width: 150, valueGetter: (params) => params.value ? format(new Date(params.value), 'dd/MM/yyyy') : "N/A", editable: true },
                { field: 'location', headerName: 'Location', width: 120, editable: true },
                { field: 'stream', headerName: 'Stream', width: 110, editable: true },
                { field: 'level', headerName: 'Level', width: 110, editable: true },
                // { field: 'priority', headerName: 'Priority', width: 110, editable: true },
                // { field: 'attachment', headerName: 'Attachment', width: 130, valueGetter: (params) => params.value ? 'Yes' : 'No', editable: true },
                { field: 'candidates', headerName: 'Candidates', width: 300, editable: true },
                { field: 'comments', headerName: 'Comments', width: 200, editable: true },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                            color="primary"
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <div style={{ height: 800, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ minHeight: 600, width: '100%' }}>
            <Drawer anchor="right" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                {sidebarContent}
            </Drawer>
            <Grid container spacing={2} sx={{ p: 3 }}>
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom>
                        Project List
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => handleEditClick('new')}>
                        Add New Project
                    </Button>
                    {projects.length > 0 ? (
                        <DataGrid
                        autoHeight={false}
                        rows={projects}
                        columns={columns}
                        pageSize={25}
                        rowsPerPageOptions={[25, 50, 100]}
                        checkboxSelection
                        editMode="row"
                        rowModesModel={rowModesModel}
                        onRowEditStart={handleRowEditStart}
                        onRowEditStop={handleRowEditStop}
                        sx={{
                          '& .MuiDataGrid-viewport': {
                            maxHeight: '600px', 
                          }
                        }}
                      />
                    ) : (
                        <Typography>Loading projects...</Typography>
                    )}
                </Grid>
            </Grid>
        </Box>
       </div>
    );
};

export default ProjectList;

