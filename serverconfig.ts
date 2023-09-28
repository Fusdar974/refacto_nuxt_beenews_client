const prodUrl = "http://192.168.1.10:3005"
const devUrl = "http://localhost:3005"

export default process.env.NODE_ENV === 'development' ? devUrl : prodUrl;