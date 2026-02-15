import { decodeTokenClaims } from '../../utils/token';

const getUserRoleFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const claims = decodeTokenClaims(token);
        return claims?.role ?? null;
    }
    return null;
};

export default getUserRoleFromToken;