/*********************************************************************************
 *  BTI325 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Lucky Osunbiyi Student ID: 144837192 Date: Oct. 24, 2024
 *
 *  Online (Vercel) Link: https://bti325-app-assignment2.vercel.app/
 ********************************************************************************/

const express = require("express");
const path = require("path");
const blogService = require("./blog-service.js");
const helpers = require('./utils/helpers');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const HTTP_PORT = process.env.PORT || 8080;
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');


const app = express();
const upload = multer();

// Set up Handlebars with custom helpers
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    ...helpers,
      safeHTML: function(context) {
          return stripJs(context);
      }
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Middleware to track the active route
app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


// Cloudinary Configuration
cloudinary.config({
  cloud_name: "dmjqjuppv",
  api_key: "279536762174178",
  api_secret: "YsG08Sbf6b2ZkrN8t4KV4NUwtd0",
  secure: true,
});

// Routes
app.get("/", (req, res) => {
  res.redirect('/blog');
});

app.get("/about", (req, res) => {
  res.render('about');
});

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogService.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
    console.log(err);
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});


app.get('/blog/:id', async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // Declare empty array to hold "post" objects
    let posts = [];

    // If there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts();
    }

    // Sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // Store the "posts" in viewData
    viewData.posts = posts;
  } catch (err) {
    console.error(err);
    viewData.message = "Please try another Post / Category";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blogService.getPostById(req.params.id);
  } catch (err) {
    if (!viewData.message) viewData.message = "No post found for the given ID."; 
  }

  try {
    // Obtain the full list of "categories"
    viewData.categories = await blogService.getCategories();
  } catch (err) {
    viewData.categoriesMessage = "No results for categories.";
  }

  // Render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
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

    // Render the posts view with the posts data, or a message if no posts are found
    if (posts.length > 0) {
      res.render("posts", { posts: posts });
    } else {
      res.render("posts", { message: "No results" });
    }
  } catch (err) {
    console.error(err);
    res.render("posts", { message: "An error occurred while fetching posts" });
  }
});



app.get("/posts/add", (req, res) => {
  res.render('addPost');
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
    const categories = await blogService.getCategories(); // Assuming blogService has a method to fetch categories
    res.render("categories", { categories });
  } catch (err) {
    console.error(err);
    res.render("categories", { message: "no results" });
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
  res.status(404).render('404'); // Render the 404.hbs template
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
