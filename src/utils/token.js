import { jwtDecode } from 'jwt-decode';

const ROLE_CLAIMS = ['role', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
const USER_ID_CLAIMS = [
  'nameid',
  'name',
  'unique_name',
  'sub',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
];
const STREAM_CLAIMS = ['Stream', 'stream'];
const PERSON_ID_CLAIMS = ['PersonId', 'personId'];

const pickClaim = (decoded, claimKeys) => {
  if (!decoded) {
    return null;
  }

  for (const key of claimKeys) {
    if (Object.prototype.hasOwnProperty.call(decoded, key) && decoded[key] !== undefined && decoded[key] !== null) {
      return decoded[key];
    }
  }

  return null;
};

const parseNumberClaim = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const decodeTokenClaims = (token) => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);

    return {
      raw: decoded,
      userId: parseNumberClaim(pickClaim(decoded, USER_ID_CLAIMS)),
      role: pickClaim(decoded, ROLE_CLAIMS) ?? null,
      stream: pickClaim(decoded, STREAM_CLAIMS) ?? null,
      personId: parseNumberClaim(pickClaim(decoded, PERSON_ID_CLAIMS)),
      expiresAt: decoded?.exp ? decoded.exp * 1000 : null,
    };
  } catch (error) {
    console.warn('Unable to decode token', error);
    return null;
  }
};

export const getRoleFromToken = (token) => {
  const claims = decodeTokenClaims(token);
  return claims?.role ?? null;
};
