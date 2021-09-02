const express = require("express");
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  // b6UTxQ: {
  //     longURL: "https://www.tsn.ca",
  //     userID: "aJ48lW"
  // },
  // i3BoGr: {
  //     longURL: "https://www.google.ca",
  //     userID: "aJ48lW"
  // }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  //maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(cookieParser())

function generateRandomString() {
return Math.random().toString(36).substr(2,6);
}

const emailFinder = function(email, users){
  for (let key in users){
    if (users[key].email === email){
      return users[key].id; 
    }
  }
  return false;
}

const urlsForUser = function (id){
  let urlList = {};

  for (let key in urlDatabase){
    if (urlDatabase[key].userID === id){
      urlList[key] = {longURL: urlDatabase[key].longURL}
    }
  }
  return urlList;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = {urls: urlDatabase, user : users[req.session.user_id]};
  //const templateVars = {urls: urlDatabase, user : users[req.cookies['user_id']]};
  //const templateVars = {urls: urlDatabase, username: req.cookies['username'] || '', user : users[req.cookies['user_id']]};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const newID = generateRandomString();

  if (!userEmail || !userPassword || emailFinder(userEmail, users)){
    return res.send("Error: Status Code 400")
  }
  // users[newID] = {id: newID, email: userEmail, password: userPassword};
  users[newID] = {id: newID, email: userEmail, password: bcrypt.hashSync(userPassword,10)};

  //res.cookie('user_id', newID);
  req.session.user_id = newID;
  res.redirect("/urls")
});

app.get("/login", (req, res) => {
  const templateVars = {urls: urlDatabase, user : users[req.session.user_id]};
  //const templateVars = {urls: urlDatabase, user : users[req.cookies['user_id']]};
  //const templateVars = {urls: urlDatabase, username: req.cookies['username'] || '', user : users[req.cookies['user_id']]};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email ;
  const userPassword = req.body.password;

  const userID = emailFinder(userEmail, users);

  // if (userID && users[userID].password === userPassword){
    if (userID && bcrypt.compareSync(userPassword, users[userID].password)){
    //res.cookie('user_id', userID);
    req.session.user_id = userID;
    return res.redirect("/urls")
  }
  
  // res.cookie('username', user);
  // for( let key in users){
  //   if (users[key].email === userEmail){
  //     res.cookie('user_id', users[key].id);
  //     res.redirect("/urls")
  //   }
  // }
  res.send("Error: Status Code 403") // Wrong Credentials
  //res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  //res.clearCookie("user_id")
  req.session.user_id = null
  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  const temp = req.params.shortURL
  res.redirect(urlDatabase[temp]);
});

app.get("/urls", (req, res) => {
  const userUrls = urlsForUser(req.session.user_id)
  //const userUrls = urlsForUser(req.cookies['user_id'])
  
  // const templateVars = {urls: urlDatabase, user : users[req.cookies['user_id']]};
  const templateVars = {urls: userUrls, user : users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // if (!req.cookies['user_id']){
    if (!req.session.user_id){
    return res.redirect("/login")
  }
  const temp = req.body.longURL;
  const ranShortURL = generateRandomString();
  // urlDatabase[ranShortURL] = temp;
  // urlDatabase[ranShortURL] = {longURL: temp, userID: req.cookies['user_id']};
  urlDatabase[ranShortURL] = {longURL: temp, userID: req.session.user_id};
  //console.log(urlDatabase)
  
  res.redirect(`/urls/:${ranShortURL}`)
});

app.get("/urls/new", (req, res) => {
  // const templateVars = {user : users[req.cookies['user_id']]};
  const templateVars = {user : users[req.session.user_id]};

  // if (req.cookies['user_id']){
    if (req.session.user_id){
  res.render("urls_new", templateVars);
  } else{
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let temp = req.params.shortURL
  let idExists = false;
  if (temp.charAt(0) === ':'){
    temp = req.params.shortURL.substring(1);
  }
  for (let key in urlDatabase){
    if (temp === key){
      idExists = true;
    }
  }
  if (idExists === false){
    return res.send("ShortURL does not exist")
  }

  const temp2 = urlDatabase[temp].longURL
  // const templateVars = { shortURL: temp, longURL: temp2, user : users[req.cookies['user_id']]};
  const templateVars = { shortURL: temp, longURL: temp2, user : users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const temp = req.body.id
  const temp2 = req.params.id

  // if (req.cookies['user_id'] === urlDatabase[temp2].userID){
    if (req.session.user_id === urlDatabase[temp2].userID){
  urlDatabase[temp2].longURL = temp;
  
  res.redirect("/urls")
  } else{
    res.redirect("/login")
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const temp = req.params.shortURL

  // if (req.cookies['user_id'] === urlDatabase[temp].userID){
  if (req.session.user_id === urlDatabase[temp].userID){
  delete urlDatabase[temp];
  res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("*", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});