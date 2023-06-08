const prodUrl = "http://127.0.0.1:5000/"
const devUrl = "http://127.0.0.1:5000/"

export default process.env.NODE_ENV === 'development' ? devUrl : prodUrl;