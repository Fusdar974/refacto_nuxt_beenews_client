const prodUrl = "http://localhost:3000"
const devUrl = "http://localhost:3000"

export default process.env.NODE_ENV === 'development' ? devUrl : prodUrl;