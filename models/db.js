const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

let db;

async function connectToDatabase(uri) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  await client.connect();
  db = client.db('auth_demo');
  console.log('Connected to MongoDB');
  return db;
}

function getDb() {
  return db;
}

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

module.exports = {
  connectToDatabase,
  getDb,
  hashPassword,
  comparePassword
};