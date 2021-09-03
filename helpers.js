const urlDatabase = require('./express_server');

const getUserByEmail = function(email, users){
  for (let key in users){
    if (users[key].email === email){
      return users[key].id; 
    }
  }
  return false;
}

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
  }




module.exports = {
  getUserByEmail,
  generateRandomString
}