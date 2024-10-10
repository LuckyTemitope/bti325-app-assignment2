const express = require("express");
const path = require("path");
const fs = require("fs");
const blogService = require("./blog-service.js");
const app = express();
app.use(express.static(__dirname + '/public'));

const HTTP_PORT = process.env.PORT || 8080;

// app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", (req, res) => {
  blogService.getPublishedPosts().then((publishedBlogs) => {
    res.json(publishedBlogs);
  }).catch((err) => { 
    console.error(err);
    res.status(500).send("An error occurred while fetching published posts");
  });
});

app.get("/posts", (req, res) => {
  blogService.getAllPosts().then((posts) => {
    res.json(posts);
  }).catch((err) => {
    console.error(err);
    res.status(500).send("An error occurred while fetching categories");
  }
  );
});

app.get("/categories", (req, res) => {
  blogService.getCategories().then((categories) => {
    res.json(categories);
  }).catch((err) => {
    console.error(err);
    res.status(500).send("An error occurred while fetching categories");
  })
});

// Other route handlers, middleware, etc ...

app.use((req, res, next) => {
  res.status(404).sendfile(path.join(__dirname, "/views/error.html"));

});

blogService
  .initialize()
  .then(() => {
    // Start the server only if initialization is successful
    app.listen(HTTP_PORT, () => {
      console.log(`Server is running on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    // Log error and prevent server from starting
    console.error(`Failed to initialize data: ${err}`);
  });

  