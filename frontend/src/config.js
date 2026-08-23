// Central API configuration
// In development & production: uses VITE_API_URL or defaults to your live Railway backend URL
const API = import.meta.env.VITE_API_URL || 'https://helphub-production-3b59.up.railway.app/api'

export default API
