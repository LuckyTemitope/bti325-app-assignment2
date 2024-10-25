const fs = require("fs");
const path = require("path");

let posts = [];
let categories = [];

function initialize() {
  const promise1 = new Promise((resolve, reject) => {
    // Read posts.json
    fs.readFile(__dirname + "/data/posts.json", "utf8", (err, data) => {
      if (err) {
        return reject("unable to read file: posts.json");
      }
      try {
        posts = JSON.parse(data); // Parse JSON data into posts array
        resolve();
      } catch (parseErr) {
        return reject("Error parsing posts.json");
      }
    });
  });

  const promise2 = new Promise((resolve, reject) => {
    // Read categories.json once posts.json is read successfully
    fs.readFile(__dirname + "/data/categories.json", "utf8", (err, data) => {
      if (err) {
        return reject("unable to read file: categories.json");
      }
      try {
        categories = JSON.parse(data); // Parse JSON data into categories array
        resolve();
      } catch (parseErr) {
        return reject("Error parsing categories.json");
      }
    });
  });

  return new Promise((resolve, reject) => {
    Promise.all([promise1, promise2])
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// getAllPosts function
function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length > 0) {
      resolve(posts); // Return all posts
    } else {
      reject("no results returned"); // Reject if no posts are found
    }
  });
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    if (postData.published == undefined){
      postData.published = false; // Set default value for published if not provided
    } else { 
      postData.published = true;
    }

    postData.id = posts.length + 1;

    // Set postDate to current date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    postData.postDate = formattedDate;

    posts.push(postData); // Add new post to posts array

    resolve(postData);
  });

}

// getPublishedPosts function
function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter((post) => post.published === true); // Filter posts
    if (publishedPosts.length > 0) {
      resolve(publishedPosts); // Return published posts
    } else {
      reject("no results returned"); // Reject if no published posts are found
    }
  });
}

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const postsInCategory = posts.filter((post) => post.category === parseInt(category)); // Filter posts by category
    if (postsInCategory.length > 0) {
      resolve(postsInCategory); // Return posts in the specified category
    } else {
      reject("no results returned"); // Reject if no posts are found in the specified category
    }
  });
}

function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr); // Convert the minDateStr to a Date object

    // Filter posts where the postDate is greater than or equal to minDate
    const postsAfterMinDate = posts.filter((post) => new Date(post.postDate) >= minDate);

    if (postsAfterMinDate.length > 0) {
      resolve(postsAfterMinDate); // Return the filtered posts if there are any results
    } else {
      reject(new Error("no results returned")); // Reject with an error if no results are found
    }
  });
}


function getPostById(id) {
  return new Promise((resolve, reject) => {
    const post = posts.find((post) => post.id === parseInt(id)); // Find post by ID
    if (post) {
      resolve(post); // Return the found post
    } else {
      reject("No results returned"); // Reject if no post is found with the specified ID
    }
  });
}

// getCategories function
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories); // Return all categories
    } else {
      reject("no results returned"); // Reject if no categories are found
    }
  });
}



module.exports = { initialize, getAllPosts, getPublishedPosts, getPostsByCategory, getPostById, getPostsByMinDate, getCategories, addPost };
