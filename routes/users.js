/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const { getUserByEmail, authenticateUser, mapsForUser, isLoggedIn } = require("./helpers.js");

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
    if (!isLoggedIn(req.session)) {

      res.render("register");
    } else {
      res.redirect("/");
    }
  });

  router.get("/login", (req, res) => {
    res.render("login");
  });

  router.post("/register", (req, res) => {
    const name = req.body.email;
    const email = req.body.email;
    //adding user to database
    db.query(`
    INSERT INTO users(name, email)
     VALUES($1, $2)`, [name, email])
      .then(() => {
        //setting the cookie in the users browser
        req.session['userId'] = userId
        res.redirect("/");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  router.post("/login", (req, res) => {
    //extract info from form with req.body from the login page!
    const name = req.body.email;
    const email = req.body.email;
    db.query(`
    SELECT name, email`, [name, email])
      .then(() => {
        //setting the cookie in the users browser
        req.session['userId'] = userId
        res.redirect("/");
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
    //make a function to extract user infor base on email
    const userId = authenticateUser(email);
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
