import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:9000',
}) //instance of axios.

export default instance
