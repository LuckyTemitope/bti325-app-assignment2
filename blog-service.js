const Sequelize = require('sequelize');

var sequelize = new Sequelize("SenecaDB", "SenecaDB_owner", "1my3PnGsNJBc", {
    host: "ep-lucky-block-a5rreioq.us-east-2.aws.neon.tech",
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


// Define a "Post" model
const Post = sequelize.define('Post', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

// Define a "Category" model
const Category = sequelize.define('Category', {
  category: Sequelize.STRING,
});


Post.belongsTo(Category, {foreignKey: 'category'});



function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve("Database synced successfully"))
      .catch(err => reject(`Unable to sync the database: ${err.message}`));
  });
}


function getAllPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch(err => reject(`Error retrieving posts: ${err.message}`));
  });
}


function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: { category: category }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch(err => reject(`Error retrieving posts by category: ${err.message}`));
  });
}


function addPost(postData) {
  return new Promise((resolve, reject) => {
    // Ensure the 'published' property is set correctly
    postData.published = postData.published ? true : false;

    // Replace any empty ("") values with null
    for (const key in postData) {
      if (postData[key] === "") {
        postData[key] = null;
      }
    }

    // Set the current date for the 'postDate' property
    postData.postDate = new Date();

    // Create the post in the database
    Post.create(postData)
      .then(() => resolve())
      .catch(err => reject(`Unable to create post: ${err.message}`));
  });
}



// getPublishedPosts function
function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: { published: true }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch(err => reject(`Error retrieving published posts: ${err.message}`));
  });
}



function getPostsByMinDate(minDateStr) {
  const { gte } = Sequelize.Op; // Import the 'greater than or equal' operator

  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr) // Filter posts with postDate >= minDateStr
        }
      }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch(err => reject(`Error retrieving posts by minimum date: ${err.message}`));
  });
}


// Get posts by id 
function getPostById(id) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: { id: id }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data[0]); 
        } else {
          reject("no results returned");
        }
      })
      .catch(err => reject(`Error retrieving post by ID: ${err.message}`));
  });
}



// Get published posts by category
function getPublishedPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
        category: category
      }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch(err => reject(`Error retrieving published posts by category: ${err.message}`));
  });
}



// getCategories function
function getCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("no results returned");
        }
      })
      .catch(err => reject(`Error retrieving categories: ${err.message}`));
  });
}



function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    // Ensure all blank values are set to null
    for (let prop in categoryData) {
      if (categoryData[prop] === "") {
        categoryData[prop] = null;
      }
    }

    // Invoke the Category.create() function
    Category.create(categoryData)
      .then(() => {
        resolve("Category created successfully"); // Resolve with success message
      })
      .catch((err) => {
        reject("unable to create category"); // Reject with error message
      });
  });
}


function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: { id: id },
    })
      .then((deletedCount) => {
        if (deletedCount > 0) {
          resolve(`Category with id ${id} deleted successfully`);
        } else {
          reject(`No category found with id ${id}`);
        }
      })
      .catch(() => {
        reject("Unable to delete category");
      });
  });
}


// Function to delete a post by ID
function deletePostById(id) {
  return new Promise((resolve, reject) => {
      Post.destroy({
          where: { id: id }  // Destroy post with the given id
      })
      .then((rowsDeleted) => {
          if (rowsDeleted === 0) {
              reject("Post not found");  // Reject if no post was deleted (post not found)
          } else {
              resolve();  // Resolve if post was deleted
          }
      })
      .catch((error) => {
          reject("Unable to remove post: " + error);  // Reject if any error occurs during deletion
      });
  });
}



module.exports = { initialize, getAllPosts, getPublishedPosts, 
  getPostsByCategory, getPostById, getPostsByMinDate, getCategories, 
  addPost, getPublishedPostsByCategory, addCategory, deleteCategoryById, deletePostById };
