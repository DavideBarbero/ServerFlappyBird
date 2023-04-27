"use strict";
const mongoFunctions = require("./mongoFunctions");
const fs = require("fs");

const express = require("express");
const cors = require("cors");
//const app = express();
const bodyParser = require("body-parser");

// Online RSA Key Generator
const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };

const TIMEOUT = 1000;
let port = 8888;

let app = express();

app.listen(8888, function () {
  let port = this.address().port;
  console.log("Server listening on port %s...", port);
});

// middleware
app.use("/", bodyParser.json());
app.use("/", bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/", function (req, res, next) {
  console.log(">_ " + req.method + ": " + req.originalUrl);
  if (Object.keys(req.query).length != 0)
    console.log("Parametri GET: " + JSON.stringify(req.query));
  if (Object.keys(req.body).length != 0)
    console.log("Parametri BODY: " + JSON.stringify(req.body));
  next();
});

//app.use("/", express.static("./static"));

app.get("/api/addLeaderboard", function (req, res) {
  let query = {
    player: req.query.player,
    score: parseInt(req.query.score),
  };
  mongoFunctions.insertOne(
    req,
    "FlappyBird",
    "leaderBoard",
    query,
    function (err, data) {
      if (err.codErr == -1) {
        console.log(data);
        res.send("Inserimento andato a buon fine.");
      } else
        error(req, res, {
          code: err.codErr,
          message: err.message,
        });
    }
  );
});

app.get("/api/loadLeaderboard", function (req, res) {
  mongoFunctions.aggregate(
    "FlappyBird",
    "leaderBoard",
    [{ $sort: { score: 1 } }],
    function (err, data) {
      if (err.codErr == -1) {
        res.send(data);
      } else error(req, res, { code: err.codErr, message: err.message });
    }
  );
});

/* ************************************************************* */
function error(req, res, err) {
  res.status(err.code).send(err.message);
}

// default route finale
app.use("/", function (req, res, next) {
  res.status(404);
  res.send("pageNotFound");
});
