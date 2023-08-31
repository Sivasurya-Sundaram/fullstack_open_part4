require('dotenv').config();
const DBURL = process.env.DBURL;
const PORT = process.env.PORT;

module.exports = {
  DBURL,
  PORT,
};
