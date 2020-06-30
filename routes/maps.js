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
  router.get("/categories/:category/", (req, res) => {
    const category = req.params.category;
    let query = `SELECT * FROM maps
    WHERE category = $1`;
    db.query(query, [category])
      .then(data => {
        let templateVars = {
          category,
          maps: data.rows,
          userId: req.session.userId
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
  router.get("/maps/new/", (req, res) => {
    const userId = req.session.userId;
    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {

      let templateVars = {
        userId: req.session.userId
      }

      res.render("new_map", templateVars);
    }
  });

  //displays the chosen map
  router.get("/maps/:id/", (req, res) => {
    console.log(req.session.userId);

    const mapId = req.params.id;
    console.log(mapId);
    let query = `SELECT maps.name AS name, maps.category AS category,maps.owner_id AS owner_id, maps.id AS id, points.latitude, points.longitude, points.description, points.name AS points_name FROM maps
    JOIN pointsmaps ON maps.id = pointsmaps.map_id
    JOIN points ON points.id = pointsmaps.point_id
    WHERE maps.id = $1`;
    db.query(query, [mapId])
      .then(data => {
        console.log(data.rows);
        let templateVars = {
          maps: data.rows,
          userId: req.session.userId
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

  router.get("/maps/:id/markers", (req, res) => {
    const id = req.params.id;
    let query = `SELECT maps.name AS name, maps.category AS category,maps.owner_id AS owner_id, maps.id AS map_id, points.latitude, points.longitude, points.description, points.name AS points_name FROM maps
    JOIN pointsmaps ON maps.id = pointsmaps.map_id
    JOIN points ON points.id = pointsmaps.point_id
    WHERE maps.id = $1`;
    db.query(query, [id])
      .then(data => {
        let templateVars = {
          maps: data.rows,
          userId: req.session.userId
        }
        //pass the category chosen to the view file
        res.json(templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  //saves the map as favourite NEED DATABASE!!
  router.get("/maps/:id/favorites/", (req, res) => {
    const mapId = req.params.id;
    const userId = req.session.userId;

    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      const query = `SELECT id FROM users
      WHERE email = $1;`
      db.query(query, [userId])
        .then(data => {

          return data;

        }).then((res) => {
          let ownerId = res.rows[0].id;
          let query = `INSERT INTO usermaps VALUES (DEFAULT, $1, $2)`;
          return db.query(query, [ownerId, mapId]).then((res) => {
            console.log("favourited", res);
          })
        })
        .catch((err) => {
          console.log('Error', err)
        })

    }
  });
  // //edit the map
  router.get("/maps/:id/edit/", (req, res) => {
    const id = req.params.id;

    const mapId = req.params.id;
    const userId = req.session.userId;

    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      let query = `SELECT maps.name AS name, maps.category AS category,maps.owner_id AS owner_id, maps.id AS map_id, points.latitude, points.longitude, points.description AS points_description, points.name AS points_name, points.id AS point_id FROM maps
  JOIN pointsmaps ON maps.id = pointsmaps.map_id
  JOIN points ON points.id = pointsmaps.point_id
  WHERE maps.id = $1`;
      db.query(query, [id])
        .then(data => {
          let templateVars = {
            maps: data.rows,
            userId: req.session.userId

          }
          res.render("edit_map", templateVars);

        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });



    }

  });


  //shows saved maps by the user
  router.get("/profile/maps", (req, res) => {
    const userId = req.session.userId;
    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      let query = `SELECT maps.id, maps.name, maps.category FROM maps JOIN users ON owner_id = users.id
    WHERE users.email = $1`;
      db.query(query, [userId])
        .then(data => {
          let templateVars = {
            maps: data.rows,
            userId: req.session.userId
          }
          //pass the category chosen to the view file
          res.render("my_maps", templateVars)
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });

    }
  });

  // //editing maps =>to be figured out
  // router.put("/maps/:id", (req, res) => {
  //   const newMap = req.body.newMap
  //   //intigrate new map info into database
  //   res.redirect("/profile/maps");
  // });
  //edit the map
  router.post("/maps/:mapId/edit/:pointId/", (req, res) => {
    console.log(req.body);
    const map_id = req.body.mapId;
    const point_id = req.body.pointId;
    const points_name = req.body.points_name;
    const points_desc = req.body.points_description;
    const points_lat = req.body.latitude;
    const points_long = req.body.longitude;

    const query = `SELECT id FROM users
      WHERE email = $1;`
    db.query(query, [req.session.userId])
      .then(data => {

        return data;

      }).then((data) => {
        let ownerId = data.rows[0].id;
        const query = `UPDATE points SET name = $1, description = $2, latitude = $3, longitude =$4, owner_id = $5
   WHERE id = $6;`
        db.query(query, [points_name, points_desc, points_lat, points_long, ownerId, point_id])

      }).then(data => {
        res.redirect(`/maps/${mapId}/edit/`);
      })
  })
  //posting new maps to database and redirecting to newly created map NOT COMPLETE
  router.post("/maps/", (req, res) => {
    //add the new map associated with the user to the database
    const mapName = req.body.map_name;
    const mapDescription = req.body.map_description;
    const mapCategory = req.body.map_category;
    const mapOwnerId = getOwnerId(req.session.userId);
    const pointName = req.body.point_name;
    const pointDescription = req.body.point_description;
    const pointLat = req.body.point_latitude;
    const pointLong = req.body.point_long;
    if (mapName) {
      let query = `INSERT INTO maps VALUES ($1, $2, $3, $4)`;
      db.query(query, [mapName, mapDescription, mapCategory, mapOwnerId])
    }
    if (pointName) {
      let query2 = `INSERT INTO points VALUES ($1, $2, $3, $4)`
      db.query(query2, [pointName, pointDescription, pointLat, pointLong])
    }
  });

  //deleting maps
  router.post("/maps/:id/", (req, res) => {
    //delete map from data base
    id = req.params.id;
    const userId = req.session.userId;
    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      let query = `DELETE FROM maps
      WHERE id = $1`;
      db.query(query, [id])
        .then(data => {
          let templateVars = {
            maps: data.rows,
            userId: req.session.userId
          }
          res.render("my_maps", templateVars)
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    }
  });
  //editing maps IN PROGRESS!
  // router.post("/maps/:id/edit/", (req, res) => {
  //   //delete map from data base
  //   let id = req.params.id;
  //   let info = req.body;
  //   console.log(info);
  // const userId = req.session.userId;
  // if (!isLoggedIn(req.session)) {
  //   res.status(403).send("Please login or register first.");
  // } else {
  //   //removing points from db
  //   let query = `DELETE FROM points JOIN pointsmaps ON points.id = point_id
  // JOIN maps ON map_id = maps.id
  // WHERE map.id = $1`;
  //   db.query(query, [id])
  //     //looking for owner id in db
  //     .then(data => {
  //       const query = `SELECT id FROM users WHERE email = $1;`
  //       db.query(query, [userId])
  //     }).then(data => {
  //       return data;
  //       //insert new points into points.sql
  //     }).then((res) => {
  //       let ownerId = res.rows[0].id;
  //       let query = `INSERT INTO points (id, name, description, latitude, longitude, owner_id)
  //       VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING *;`;
  //       return db.query(query, [pointName, pointDesc, pointLat, pointLong, ownerId])
  //     }).then((data) => {
  //       let pointId = data.row.id;
  //       let query = `INSERT INTO pointsmaps (id, point_id, map_id) VALUES (DEFAULT, $1, $2)`
  //       db.query(query, [pointId, id])
  //     }).then(() => {
  //       res.redirect("my_maps");
  //     });

  //   }
  // })
  return router;
};
