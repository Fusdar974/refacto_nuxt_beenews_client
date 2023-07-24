const prodUrl = "http://localhost:3005"
const devUrl = "http://localhost:3005"

export default process.env.NODE_ENV === 'development' ? devUrl : prodUrl;
