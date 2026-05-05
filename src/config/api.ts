const domain = import.meta.env.VITE_API_DOMAIN || 'http://localhost:8080';
const chatbotDomain = import.meta.env.VITE_CHATBOT_API_DOMAIN || 'https://tl-chatbot.nhokthanh3211.workers.dev';

export const API_BASE_URL = `${domain}/api/v1`;
export const ADMIN_API_URL = `${domain}/api/v1/admin`;
export const CHATBOT_API_URL = `${chatbotDomain}/api/v1`;

export { domain, chatbotDomain };
