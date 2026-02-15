//Routes.js
import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import ProjectList from './components/ProjectList';
import PersonList from './components/PersonList';
import SalaryReviewList from './components/SalaryList/SalaryReviewList';
import SalaryReviewRequests from './components/SalaryList/SalaryReviewApproval';
import ChangePassword from './components/ChangePassword';
import AdminPanel from './components/Admin/AdminPanel';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetRedirect } from './utils/slice';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector(state => state.auth.token);
  const shouldRedirect = useSelector(state => state.auth.redirectToHome);
  const shouldRedirectToLogin = useSelector(state => state.auth.shouldRedirectToLogin);

  useEffect(() => {
    console.log('shouldRedirect:', shouldRedirect);
    console.log('shouldRedirectToLogin:', shouldRedirectToLogin);
    if (shouldRedirect) {
        navigate('/');
        dispatch(resetRedirect());
    } else if (shouldRedirectToLogin) {
        navigate('/login');
        dispatch(resetRedirect());
    }
}, [shouldRedirect, shouldRedirectToLogin, dispatch, navigate]);

  return (
    <Routes>
      {isAuthenticated ? (
        <React.Fragment>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/people" element={<PersonList />} />
          <Route path="/salaryreviews" element={<SalaryReviewList />} />
          <Route path="/salaryreviewrequests" element={<SalaryReviewRequests />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/changepassword" element={<ChangePassword />} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </React.Fragment>
      )}
    </Routes>
  );
};

export default AppRoutes;
