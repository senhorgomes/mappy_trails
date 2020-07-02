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
    const userId = req.session.userId
    console.log(mapId);
    let query = `SELECT maps.name AS name, maps.category AS category,maps.owner_id AS owner_id, maps.id AS id, points.latitude, points.longitude, points.description, points.name AS points_name, points.img AS points_img, usermaps.map_id AS favemap FROM maps
    JOIN pointsmaps ON maps.id = pointsmaps.map_id
    JOIN points ON points.id = pointsmaps.point_id
    LEFT JOIN users ON users.email = $1
    LEFT JOIN usermaps ON usermaps.user_id = users.id
    WHERE maps.id = $2`;
    db.query(query, [userId, mapId])
      .then(data => {
        return data

      }).then((data) => {
        const maps = data.rows;
        let query = `SELECT  usermaps.map_id AS favemap FROM usermaps
        JOIN users ON usermaps.user_id = users.id
        WHERE users.email =$1`;
        db.query(query, [userId])
          .then((data2) => {
            const favemaps_obj = data2.rows;
            //making favemaps an array of favourite maps
            const favemaps_arr = [];
            for (item of favemaps_obj) {
              favemaps_arr.push(item.favemap);
            }
            let templateVars = {
              maps,
              favemaps : favemaps_arr,
              userId
            }
            //pass the category chosen to the view file
            res.render("display_map", templateVars)
          })

      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.get("/maps/:id/markers", (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId

    let query = `SELECT maps.name AS name, maps.category AS category,maps.owner_id AS owner_id, maps.id AS id, points.latitude, points.longitude, points.description, points.name AS points_name, points.img AS points_img, usermaps.map_id AS favemap FROM maps
    JOIN pointsmaps ON maps.id = pointsmaps.map_id
    JOIN points ON points.id = pointsmaps.point_id
    LEFT JOIN users ON users.email = $1
    LEFT JOIN usermaps ON usermaps.user_id = users.id
    WHERE maps.id = $2`;
    db.query(query, [userId, id])
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

  //saves the map as favourite
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
          db.query(query, [ownerId, mapId]).then((res) => {
          })
        })
        .catch((err) => {
          console.log('Error', err)
        })
    }
  });
  //edit the map page
  router.get("/maps/:id/edit/", (req, res) => {
    const id = req.params.id;

    const mapId = req.params.id;
    const userId = req.session.userId;

    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      let query = `SELECT maps.name AS name, maps.category AS category,maps.owner_id AS owner_id, maps.id AS map_id, points.latitude, points.longitude, points.description AS points_description, points.name AS points_name, points.id AS point_id, points.img AS points_img FROM maps
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
          return data;

        }).then((data) => {
          let myMaps = data.rows;
          let query = `SELECT maps.id, maps.name, maps.category FROM usermaps JOIN users ON usermaps.user_id = users.id
          JOIN maps ON usermaps.map_id = maps.id
          WHERE users.email = $1`;
          db.query(query, [userId])
            .then(data2 => {
              let faveMaps = data2.rows;
              let templateVars = {
                maps: myMaps,
                faveMaps: faveMaps,
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

        })
    }
  });

  //post request to edit the map in the database
  router.post("/maps/:mapId/edit/:pointId/", (req, res) => {
    console.log(req.body);
    const map_id = req.params.mapId;
    const point_id = req.params.pointId;
    console.log(point_id);
    const points_name = req.body.points_name;
    const points_desc = req.body.points_description;
    const points_lat = req.body.latitude;
    const points_long = req.body.longitude;
    const points_img = req.body.points_img;

    const query = `SELECT id FROM users
      WHERE email = $1;`
    db.query(query, [req.session.userId])
      .then(data => {

        return data;

      }).then((data) => {
        let ownerId = data.rows[0].id;
        const query1 = `UPDATE points SET name = $1, description = $2, latitude = $3, longitude =$4, img = $5
        WHERE id = $6;`
        return db.query(query1, [points_name, points_desc, points_lat, points_long, points_img, point_id])

      }).then(data => {
        res.redirect(`/maps/${map_id}/edit/`);
      })
  })

  //post request to add points to the map database
  router.post("/maps/:mapId/add/point/", (req, res) => {
    console.log(req.body);
    const map_id = req.params.mapId;
    const points_name = req.body.points_name;
    const points_desc = req.body.points_description;
    const points_lat = req.body.latitude;
    const points_long = req.body.longitude;
    const points_img = req.body.points_img;

    const query = `SELECT id FROM users
      WHERE email = $1;`
    db.query(query, [req.session.userId])
      .then(data => {

        return data;

      }).then((data) => {
        let ownerId = data.rows[0].id;
        const query = `INSERT INTO points (id, name, description, latitude, longitude , owner_id, img)
        VALUES(DEFAULT, $1, $2, $3, $4, $5, $6) RETURNING *;`
        return db.query(query, [points_name, points_desc, Number(points_lat), Number(points_long), ownerId, points_img])

      }).then(data2 => {
        const point_id = data2.rows[0].id;
        console.log("point id", point_id);
        const query = `INSERT INTO pointsmaps (id, point_id, map_id)
        VALUES(DEFAULT, $1, $2);`
        db.query(query, [point_id, map_id])

      }).then(data => {
        res.redirect(`/maps/${map_id}/edit/`);
      })
  })

  //posting new maps to database and redirecting to newly created map NOT COMPLETE
  router.post("/maps/:mapId/points/submission", (req, res) => {
    //add the new map associated with the user to the database
    const mapID = req.params.mapId;
    const pointName = req.body.point_name;
    const pointDescription = req.body.point_description;
    const pointLat = req.body.point_lat;
    const pointLong = req.body.point_long;
    const pointImg = req.body.point_img;
    const ownerId = 1;
    if (pointName) {
      let query = `INSERT INTO points (name, description, owner_id, img, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`
      db.query(query, [pointName, pointDescription, ownerId, pointImg, pointLat, pointLong])
        .then(result => {
          console.log(result.rows);
          return res.json(result.rows[0]);
        })
        .then(result2 => {
          const pointID = result2.rows[0].id;
          console.log("point id", pointID);
          const query = `INSERT INTO pointsmaps (id, point_id, map_id)
        VALUES(DEFAULT, $1, $2);`
          db.query(query, [pointID, mapID])

        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
          console.log(err);
        });
    }
  });
  //posting new maps to database and redirecting to newly created map NOT COMPLETE
  router.post("/maps", (req, res) => {
    //add the new map associated with the user to the database
    //const mapId = 100004444;
    const mapName = req.body.map_name;
    const mapDescription = req.body.map_description;
    const mapCategory = req.body.map_category;
    const mapOwnerId = 1;//getOwnerId(req.session.userId);
    console.log(req.body);
    if (mapName) {
      let query = `INSERT INTO maps (name, description, category, owner_id) VALUES ($1, $2, $3, $4) RETURNING *`;
      db.query(query, [mapName, mapDescription, mapCategory, mapOwnerId])
        .then(result => {
          console.log(result.rows);
          return res.json(result.rows[0]);
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
          console.log(err);
        });
    }
  });
  //post request to remove points from map database
  router.post("/maps/:mapId/remove/:pointId/", (req, res) => {
    console.log(req.body);
    const map_id = req.params.mapId;
    const points_id = req.params.pointId;

    const query = `SELECT id FROM users
        WHERE email = $1;`
    db.query(query, [req.session.userId])
      .then(data => {

        return data;

      }).then((data) => {
        let ownerId = data.rows[0].id;
        const query = `DELETE FROM points WHERE id =$1;`
        db.query(query, [points_id]).then((data) => {
          res.redirect(`/maps/${map_id}/edit/`);

        })
      })
  })

  //posting new maps to database and redirecting to newly created map NOT COMPLETE
  router.post("/maps/:mapId/points", (req, res) => {
    //add the new map associated with the user to the database
    const pointName = req.body.point_name;
    const pointDescription = req.body.point_description;
    const pointLat = req.body.point_latitude;
    const pointLong = req.body.point_long;
    if (pointName) {
      let query2 = `INSERT INTO points (name, description, category, owner_id) VALUES ($1, $2, $3, $4) RETURNING *`
      db.query(query2, [pointName, pointDescription, pointLat, pointLong])
        .then(result => {
          console.log(result.rows);
          return res.json(result.rows[0]);
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    }
  });
  //posting new maps to database and redirecting to newly created map NOT COMPLETE
  router.post("/maps/", (req, res) => {
    //add the new map associated with the user to the database
    //const mapId = 100004444;
    const mapName = req.body.map_name;
    const mapDescription = req.body.map_description;
    const mapCategory = req.body.map_category;
    const mapOwnerId = 1;//getOwnerId(req.session.userId);
    console.log(req.body);
    if (mapName) {
      let query = `INSERT INTO maps (name, description, category, owner_id) VALUES ($1, $2, $3, $4) RETURNING *`;
      db.query(query, [mapName, mapDescription, mapCategory, mapOwnerId])
        .then(result => {
          console.log(result.rows);
          return res.json(result.rows[0]);
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
          console.log(err);
        });
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

          res.redirect("/profile/maps")
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    }
  })


  //deleting favourited maps
  router.post("/maps/:favemapid/favorites/", (req, res) => {
    //delete map from data base
    map_id = req.params.favemapid;
    const userId = req.session.userId;
    if (!isLoggedIn(req.session)) {
      res.status(403).send("Please login or register first.");
    } else {
      const query = `SELECT id FROM users
        WHERE email = $1;`
    db.query(query, [req.session.userId])
      .then(data => {

        return data;

      }).then((data) => {
        let ownerId = data.rows[0].id;
      let query = `DELETE FROM usermaps
      WHERE map_id = $1
      AND user_id =$2`;
      db.query(query, [map_id, ownerId])
       }) .then(data => {

          res.redirect("/profile/maps")
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });

    }
  });

  return router;
};

