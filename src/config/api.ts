const domain = import.meta.env.VITE_API_DOMAIN || 'http://localhost:8080';

export const API_BASE_URL = `${domain}/api/v1`;
export const ADMIN_API_URL = `${domain}/api/v1/admin`;

export { domain };