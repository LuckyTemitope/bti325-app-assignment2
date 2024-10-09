const fs = require("fs");
const path = require("path");


let posts = []
let categories = []


// initialize function
function initialize() {
    return new Promise((resolve, reject) => {
        // Read posts.json
        fs.readFile(__dirname + '/data/posts.json', 'utf8', (err, data) => {
            if (err) {
                return reject("unable to read file: posts.json");
            }
            try {
                posts = JSON.parse(data); // Parse JSON data into posts array
            } catch (parseErr) {
                return reject("Error parsing posts.json");
            }

            // Read categories.json once posts.json is read successfully
            fs.readFile(__dirname + '/data/categories.json', 'utf8', (err, data) => {
                if (err) {
                    return reject("unable to read file: categories.json");
                }
                try {
                    categories = JSON.parse(data); // Parse JSON data into categories array
                } catch (parseErr) {
                    return reject("Error parsing categories.json");
                }

                console.log("initialized");
                // If both files are read and parsed successfully, resolve the promise
                resolve();
            });
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

// getPublishedPosts function
function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        const publishedPosts = posts.filter(post => post.published === true); // Filter posts
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

module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories };