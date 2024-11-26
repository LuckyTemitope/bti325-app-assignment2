/*********************************************************************************
 *  BTI325 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Lucky Osunbiyi Student ID: 144837192 Date: Nov. 11, 2024
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
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
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

  // render the "blog" view with all of the data
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
  blogService.getAllPosts()
    .then((data) => {
      if (data.length > 0) {
        res.render("posts", { posts: data }); // Render posts if data is available
      } else {
        res.render("posts", { message: "no results" }); // Render a message if no posts
      }
    })
    .catch((err) => {
      res.render("posts", { message: "Error retrieving posts: " + err });
    });
});

app.get("/categories/add", (req, res) => {
  res.render("addCategory"); // Render the addCategory view (make sure to create this view)
});

app.post("/categories/add", (req, res) => {
  const categoryData = req.body;

  // Ensure the category name is not empty or blank
  if (!categoryData.category || categoryData.category.trim() === "") {
    res.status(400).send("Category name cannot be empty.");
    return;
  }

  // Call the addCategory service method to add the new category
  blogService.addCategory(categoryData)
    .then(() => {
      res.redirect("/categories"); // Redirect to categories view after success
    })
    .catch((err) => {
      res.status(500).send("Unable to add category: " + err); // Error handling
    });
});

app.get("/categories/delete/:id", (req, res) => {
  const categoryId = req.params.id;

  // Call the deleteCategoryById function
  blogService.deleteCategoryById(categoryId)
    .then(() => {
      res.redirect("/categories"); // Redirect to categories view after deletion
    })
    .catch((err) => {
      res.status(500).send("Unable to remove category / Category not found: " + err);
    });
});


app.get("/posts/delete/:id", (req, res) => {
  const postId = req.params.id;

  blogService.deletePostById(postId)
      .then(() => {
          // If the post was deleted successfully, redirect to /posts
          res.redirect("/posts");
      })
      .catch((err) => {
          // If there was an error, return a 500 status with an error message
          res.status(500).send("Unable to Remove Post / Post not found");
      });
});



app.get("/posts/add", (req, res) => {
  blogService.getCategories()
  .then((categories) => {
      res.render("addPost", {
          categories: categories // Pass categories to the view
      });
  })
  .catch((err) => {
            // If there's an error fetching categories, pass an empty array
            res.render("addPost", { categories: [] });  });
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
  blogService.getCategories()
  .then((data) => {
    if (data.length > 0) { 
      res.render("categories", { categories: data }); // Render categories if data is available
    } else {
      res.render("categories", { message: "no results" }); // Render a message if no categories
    }
  })
  .catch((err) => {
    res.render("categories", { message: "Error retrieving categories: " + err });
  });
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

app.post("/categories/add", (req, res) => {
  addCategory(req.body)
    .then(() => {
      res.redirect("/categories"); // Redirect to the categories list on success
    })
    .catch((err) => {
      res.status(500).send("Unable to add category: " + err); // Send error message on failure
    });
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
