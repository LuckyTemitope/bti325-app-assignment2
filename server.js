const express = require('express');
const path = require("path");
const blog = require("blog-service.js");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));


app.get('/', (req, res) => {
    res.redirect('/about');
  });

  app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
