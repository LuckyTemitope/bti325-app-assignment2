const fs = require("fs");
const path = require("path");

let posts = [];
let categories = [];

// initialize function
// function initialize() {
//     return new Promise((resolve, reject) => {
//         // Read posts.json
//         fs.readFile(__dirname + '/data/posts.json', 'utf8', (err, data) => {
//             if (err) {
//                 return reject("unable to read file: posts.json");
//             }
//             try {
//                 posts = JSON.parse(data); // Parse JSON data into posts array
//             } catch (parseErr) {
//                 return reject("Error parsing posts.json");
//             }

//             // Read categories.json once posts.json is read successfully
//             fs.readFile(__dirname + '/data/categories.json', 'utf8', (err, data) => {
//                 if (err) {
//                     return reject("unable to read file: categories.json");
//                 }
//                 try {
//                     categories = JSON.parse(data); // Parse JSON data into categories array
//                 } catch (parseErr) {
//                     return reject("Error parsing categories.json");
//                 }

//                 console.log("initialized");
//                 // If both files are read and parsed successfully, resolve the promise
//                 resolve();
//             });
//         });
//     });
// }

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



module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories, addPost };
