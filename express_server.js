const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.use(cookieParser())


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = {urls: urlDatabase, user : users[req.cookies['user_id']]};
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
  users[newID] = {id: newID, email: userEmail, password: userPassword};
  //console.log(users)
  res.cookie('user_id', newID);
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email ;
  //res.cookie('username', user);
  for( let key in users){
    if (users[key].email === userEmail){
      res.cookie('user_id', users[key].id);
      res.redirect("/urls")
    }
  }
  res.send("Wrong Credentials")
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  //res.clearCookie("username")
  res.clearCookie("user_id")
  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const temp = req.params.shortURL
  res.redirect(urlDatabase[temp]);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, user : users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const temp = req.body.longURL;
  const ranShortURL = generateRandomString();
  urlDatabase[ranShortURL] = temp;

  res.redirect(`/urls/:${ranShortURL}`)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user : users[req.cookies['user_id']]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let temp = req.params.shortURL
  if (temp.charAt(0) === ':'){
    temp = req.params.shortURL.substring(1);
  }
  const temp2 = urlDatabase[temp]
  const templateVars = { shortURL: temp, longURL: temp2, user : users[req.cookies['user_id']]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const temp = req.body.id
  const temp2 = req.params.id
  console.log(temp)
  console.log(temp2)
  
  urlDatabase[temp2] = temp;
  
  res.redirect("/urls")
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const temp = req.params.shortURL
  delete urlDatabase[temp];
  
  res.redirect("/urls")
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