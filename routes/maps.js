/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
const { getUserByEmail, authenticateUser, mapsForUser, isLoggedIn } = require("./helpers.js");

const express = require('express');
const router = express.Router();
const generateHelpers = require('./helpers');

module.exports = (db) => {
  router.get("/somethings", (req, res) => {
    let query = `SELECT * FROM widgets`;
    console.log(query);
    db.query(query)
      .then(data => {
        const widgets = data.rows;
        res.json({ widgets });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  //displays a list of links to maps (with names) associated with the category chosen
  router.get("/categories/:category", (req, res) => {
    const category= req.params.category;
    let query = `SELECT * FROM maps
    WHERE category = $1`;
    db.query(query, [category])
      .then(data => {
        let templateVars = {
          category,
          maps: data.rows,
          userId : req.session.userId
        }
        //pass the category chosen to the view file
        res.render("category", templateVars)
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });

  });

  //renders a form for creating a new map upon clicking "create new map"
  router.get("/maps/new", (req, res) => {
    const userId = req.session.userId;
    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      let templateVars = {
        userId : req.session.userId
      }

    res.render("new_map", templateVars);
    }
  });

  //displays the chosen map
  router.get("/maps/:id", (req, res) => {
    const id= req.params.id;
    let query = `SELECT * FROM maps
    WHERE id = $1`;
    db.query(query, [id])
      .then(data => {
        let templateVars = {
          maps: data.rows,
          userId : req.session.userId
        }
        //pass the category chosen to the view file
        res.render("display_map", templateVars)
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  //displays the saved maps by the user
  router.get("/profile/maps", (req, res) => {
    const userId = req.session.userId;
  if (!isLoggedIn(req.session)) {
    res.status(403).send("Please login or register first.");
  } else {
    templateVars ={
      userId : req.session.userId
    }
    res.render("my_maps", templateVars)
  }
  });

  //editing maps =>to be figured out
  router.put("/maps/:id", (req, res) => {
    const newMap = req.body.newMap
    //intigrate new map info into database
    res.redirect("/profile/maps");
  });

  //posting new maps to database and redirecting to newly created map
  router.post("/maps/", (req, res) => {
    //add the new map associated with the user to the database
    const mapName = req.body.name;
    //get a new id from the database
    //INSERT INTO ... RETURNING*;
    res.redirect(`/maps/${id}`);
  });

  //deleting maps => to be figured out
  router.delete("/maps/:id/", (req, res) => {
    //delete map from data base
    res.redirect("/profile/maps");
  });

  return router;
};
