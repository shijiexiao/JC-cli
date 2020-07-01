const axios = require('axios');
const {
    baseURL,
    token
} = require('./cliConfig.js');

const instance = axios.create({
    baseURL,
    timeout: 6e4,
    headers: {
        Authorization: `token ${token.split(' ').reverse().join('')}`,
        // header: 'application/vnd.github.nebula-preview+json'
    },
});

// Add a request interceptor
instance.interceptors.request.use(config => {
        // console.log(config);
        return config
    },
    error => {
        console.log('error',error)
        return Promise.reject(error)
    });

// Add a response interceptor
instance.interceptors.response.use(response => {
    // console.log('response.data',response)
    return response.data
},
    error => Promise.reject(error));

module.exports = instance;