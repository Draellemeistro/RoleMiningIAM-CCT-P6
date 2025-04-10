//
// Config file to manage API base URL for different environments
// Could also use an environment variable
//
// import config from '../config'; // eller path till config.js
// await axios.get(`${config.apiBaseUrl}/roles`);

// Check if the app is running on localhost
const isLocal = window.location.hostname === 'localhost';

const config = {
  // if localhost, use local API URL, otherwise use production URL
  apiBaseUrl: isLocal
    ? 'http://localhost:3000/api'
    : 'https://bipbupbop.com/api', //TODO: replace with real actual URL
};

if (!isLocal && config.apiBaseUrl === 'https://bipbupbop.com/api') {
  console.warn("Production API URL is not set. Please update this in frontend/src/config.js.");
}

export default config;
