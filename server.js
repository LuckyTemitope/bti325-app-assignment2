/*********************************************************************************
 *  BTI325 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Lucky Osunbiyi Student ID: 144837192 Date: Oct. 24, 2024
 *
 *  Online (Vercel) Link: bti325-app-assignment2.vercel.app
 ********************************************************************************/

const express = require("express");
const path = require("path");
const blogService = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const HTTP_PORT = process.env.PORT || 8080;

const app = express();
const upload = multer();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: "dmjqjuppv",
  api_key: "279536762174178",
  api_secret: "YsG08Sbf6b2ZkrN8t4KV4NUwtd0",
  secure: true,
});

// Routes
app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

app.get("/blog", async (req, res) => {
  try {
    const publishedBlogs = await blogService.getPublishedPosts();
    res.json(publishedBlogs);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching published posts");
  }
});

app.get("/posts", async (req, res) => {
  try {
    let { category, minDate } = req.query; // Get query parameters

    let posts;

    if (category) {
      // Filter posts by category
      console.log("Filter posts by category");
      posts = await blogService.getPostsByCategory(category);
    } else if (minDate) {
      // Filter posts by minimum date
      console.log("Filter posts by min date");
      posts = await blogService.getPostsByMinDate(minDate);
    } else {
      // Get all posts (existing functionality)
      posts = await blogService.getAllPosts();
    }

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching posts");
  }
});


app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addPost.html"));
});


// Add the "/posts/:id" route to get a single post by ID
app.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id; // Get the post ID from the route parameter
    const post = await blogService.getPostById(postId);

    if (post) {
      res.json(post);
    } else {
      res.status(404).send("Post not found");
    }
  } catch (err) {
    res.status(404).send("No result returned");
  }
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await blogService.getCategories();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching categories");
  }
});

// Upload function using Cloudinary
const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        return reject(error);
      }
      resolve({ url: result.secure_url });
    });

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

// Handle new post with image upload
app.post("/posts/add", upload.single("featureImage"), async (req, res) => {
  try {
    // Upload image to Cloudinary and set featureImage URL in the request body
    const uploaded = await streamUpload(req);
    req.body.featureImage = uploaded.url;

    // Add the new post to the blog service
    await blogService.addPost(req.body);
    res.redirect("/posts");
  } catch (error) {
    console.error("Error during upload:", error);
    res.status(500).send("Upload failed");
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "error.html"));
});

// Initialize the blog service and start the server
blogService
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is running on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Failed to initialize data: ${err}`);
  });
