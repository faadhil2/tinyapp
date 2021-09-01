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

function generateRandomString() {
return Math.random().toString(36).substr(2,6);
}


app.use(cookieParser())


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/login", (req, res) => {
  const user = req.body.username ;
  res.cookie('username', user);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const temp = req.params.shortURL
  res.redirect(urlDatabase[temp]);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies['username'] || ''};
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
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let temp = req.params.shortURL
  if (temp.charAt(0) === ':'){
    temp = req.params.shortURL.substring(1);
  }
  const temp2 = urlDatabase[temp]
  const templateVars = { shortURL: temp, longURL: temp2, username: req.cookies["username"]};
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