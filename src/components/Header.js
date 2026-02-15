import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../utils/slice';
import getUserRoleFromToken from './hooks/getUserRole';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MoneyIcon from '@mui/icons-material/Money';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { styled } from '@mui/material/styles';

// Создаем стилизованную кнопку с иконкой
const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  textTransform: 'none',
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
  '& .MuiButton-startIcon': {
    color: theme.palette.secondary.light,
  },
}));

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const userRole = getUserRoleFromToken();

  const handleLogoutClick = () => {
    setShowModal(true);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/login');
    setShowModal(false);
  };

  const handleCancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link component={NavLink} to="/" color="inherit" underline="none">
              DM Portal
            </Link>
          </Typography>
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <StyledButton startIcon={<HomeIcon />} component={NavLink} to="/">Home</StyledButton>
            {/* Добавьте другие StyledButton с иконками здесь */}
            <StyledButton startIcon={<MoneyIcon />} component={NavLink} to="/salaryreviews">Salary Reviews</StyledButton>
            {userRole === 'Head' || userRole === 'DeputyHead' || userRole === 'DivisionManager' && (
              <>
                <StyledButton startIcon={<ChecklistIcon />} component={NavLink} to="/salaryreviewrequests">Salary Reviews to Approve</StyledButton>
                <StyledButton startIcon={<AdminPanelSettingsIcon />} component={NavLink} to="/admin">Admin Panel</StyledButton>
              </>
            )}
            <StyledButton startIcon={<LockOpenIcon />} component={NavLink} to="/changepassword">Change Password</StyledButton>
          </Box>
          <StyledButton startIcon={<ExitToAppIcon />} onClick={handleLogoutClick}>Logout</StyledButton>
        </Toolbar>
      </AppBar>
      <Dialog open={showModal} onClose={handleCancelLogout}>
        <DialogTitle>{"Log Out"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout}>No</Button>
          <Button onClick={handleConfirmLogout} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
