import { jwtDecode } from 'jwt-decode';

const getUserRoleFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwtDecode(token);
        return decodedToken['role'];
    }
    return null;
};

export default getUserRoleFromToken;