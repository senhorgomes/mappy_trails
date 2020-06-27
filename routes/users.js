/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get("/something", (req, res) => {
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/register", (req, res) => {
    res.render("register", templateVars);
  });

  router.get("/login", (req, res) => {
    res.render("login", templateVars);
  });

  router.post("/register", (req, res) => {
    //add user to database (change line below)
    const userId = generateRandomString();
    const email = req.body.email;
    //looking up user based on email
    const user = getUserByEmail(email, users);
    if (email === "") {
      res.status(403).send("user email is empty!");
    } else if (!user) {
      //add user to database (change below)
      users[userId] = {
        id: userId,
        email,
      }
      //setting the cookie in the users browser
      req.session['userId'] = userId
      res.redirect("/");
    } else {
      res.status(403).send("user is already registered!");
    }
  });

  router.post("/login", (req, res) => {
    //extract info from form with req.body from the login page!
    const email = req.body.email;
    //make a function to extract user infor base on email
    const userId = authenticateUser(email, users);
    if (userId) {
      //set cookie with user id
      req.session.userId = userId;
      res.redirect("/");
    } else {
      //user is not authenticated => error msg
      res.status(403).send("email is incorrect!");
    }
  });

  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  return router;
};
