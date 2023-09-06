require('dotenv').config()

const env = process.env.NODE_ENV || 'development';
const config: any = require('./config.' + env);
export default config;