/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const {isLoggedIn, generateRandomString } = require("./helpers.js");

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
      templateVars ={
        userId : req.session.userId
      }
      res.render("register", templateVars);
    } else {
      res.redirect("/");
    }
  });

  router.get("/login", (req, res) => {
    templateVars ={
      userId : req.session.userId
    }
    res.render("login", templateVars);
  });

  router.post("/register", (req, res) => {
    const name = req.body.user_name;
    const email = req.body.email;

    //adding user to database
    db.query(`
    INSERT INTO users(name, email) VALUES($1, $2);`, [name, email])
      .then( data => {
        //setting the cookie in the users browser
        const userId = generateRandomString();
        console.log(userId);
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
    SELECT name, email FROM users
    WHERE name = $1
    AND email = $2;`, [name, email])
      .then((data) => {
        if (data.rowCount = 1) {
          //setting the cookie in the users browser
          userId = generateRandomString();
          req.session['userId'] = userId
          res.redirect("/");
        } else {
          res.status(403).send("Error! Name or email do not exist. Please register if you havent.")
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  return router;
};
