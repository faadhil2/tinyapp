const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString } = require('./helpers')
const app = express();
const PORT = 8080; // default port 8080
const flash = require('connect-flash');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");


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
  },
  sfsdfds: {
    id: "sfsdfds",
    email: "test@test.com",
    password: "$2b$10$A6Yxw.d3plrttllCza/w9Oq.5aYIZn0pxEUhvpIuGWc4vbQmv/M1W" //admin
  }
}

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  maxAge: 12 * 60 * 60 * 1000 // 12 hours
}))

app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  next();
});


const urlsForUser = function (id) {
  let urlList = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlList[key] = { longURL: urlDatabase[key].longURL }
    }
  }
  return urlList;
}


app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  return res.redirect("/login")

});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/");
  }

  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const newID = generateRandomString();

  if (!userEmail || !userPassword || getUserByEmail(userEmail, users)) {
    req.flash("error", "Invalid email and/or password")
    return res.redirect("/register")
    return res.send("Error: Status Code 400") // Email already exists
  }

  users[newID] = { id: newID, email: userEmail, password: bcrypt.hashSync(userPassword, 10) };

  req.session.user_id = newID;
  res.redirect("/urls")
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/");
  }
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const userID = getUserByEmail(userEmail, users);


  if (userID && bcrypt.compareSync(userPassword, users[userID].password)) {
    req.session.user_id = userID;
    return res.redirect("/urls")
  }


  req.flash("error", "Wrong Credentials")
  res.redirect("/login")
});

app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect("/")
});

app.get("/u/:shortURL", (req, res) => {
  const temp = req.params.shortURL
  res.redirect(urlDatabase[temp].longURL);
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const userUrls = urlsForUser(req.session.user_id)
    const templateVars = { urls: userUrls, user: users[req.session.user_id] };
    return res.render("urls_index", templateVars);
  } else {
    req.flash("error", "You need to be logged in");
    return res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login")
  }
  const temp = req.body.longURL;
  const ranShortURL = generateRandomString();

  urlDatabase[ranShortURL] = { longURL: temp, userID: req.session.user_id };

  res.redirect(`/urls/${ranShortURL}`)
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };

  if (req.session.user_id) {
    return res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let temp = req.params.shortURL
  let idExists = false;
  if (req.session.user_id === urlDatabase[temp].userID) {
    if (temp.charAt(0) === ':') {
      temp = req.params.shortURL.substring(1);
    }
    for (let key in urlDatabase) {
      if (temp === key) {
        idExists = true;
      }
    }
    if (idExists === false) {
      req.flash("error", "ShortURL does not exist")
      return res.redirect("/urls")
    }

    const temp2 = urlDatabase[temp].longURL
    const templateVars = { shortURL: temp, longURL: temp2, user: users[req.session.user_id] };
    return res.render("urls_show", templateVars);
  }
  req.flash("error", "Page Not Found")
  return res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const temp = req.body.id
  const temp2 = req.params.id

  if (req.session.user_id === urlDatabase[temp2].userID) {
    urlDatabase[temp2].longURL = temp;

    return res.redirect("/urls")
  } else {
    return res.redirect("/")
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const temp = req.params.shortURL

  if (req.session.user_id === urlDatabase[temp].userID) {
    delete urlDatabase[temp];
    return res.redirect("/urls")
  } else {
    return res.redirect("/login")
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

