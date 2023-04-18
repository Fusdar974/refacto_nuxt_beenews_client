const prodUrl = "http://221.11.140.243:3000/"
const devUrl = "http://127.0.0.1:3000/"

export default process.env.NODE_ENV === 'development' ? devUrl : prodUrl;