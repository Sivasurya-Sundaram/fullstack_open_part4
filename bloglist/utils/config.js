require('dotenv').config();
const DBURL =
  process.env.NODE_ENV == 'test' ? process.env.TESTDBURL : process.env.DBURL;
const PORT = process.env.PORT;

module.exports = {
  DBURL,
  PORT,
};
