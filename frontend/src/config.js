// Central API configuration
// In development: http://localhost:5000/api
// In production:  uses VITE_API_URL environment variable
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default API
