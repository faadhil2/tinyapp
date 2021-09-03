const urlDatabase = require('./express_server');

const getUserByEmail = function(email, users){
  for (let key in users){
    if (users[key].email === email){
      return users[key].id; 
    }
  }
  return false;
}

// const urlsForUser = function (id){
//   let urlList = {};

//   for (let key in urlDatabase){
//     if (urlDatabase[key].userID === id){
//       urlList[key] = {longURL: urlDatabase[key].longURL}
//     }
//   }
//   return urlList;
// }

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
  }




module.exports = {
  getUserByEmail,
  generateRandomString
}