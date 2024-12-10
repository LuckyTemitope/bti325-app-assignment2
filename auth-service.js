const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let Schema = mongoose.Schema;

let userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  email: String,
  loginHistory: [
    {
        dateTime: { type: Date },
        userAgent: { type: String }
    }
]
});

let User = mongoose.model("users", userSchema);


function initialize() {
    return new Promise(function (resolve, reject) {
        const connectionString = "mongodb+srv://developer:developer@cluster0.gtxre.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

        let db = mongoose.createConnection(connectionString);

        db.on('error', (err) => {
            reject(err); 
        });

        db.once('open', () => {
            User = db.model("users", userSchema); // Initialize the User object
            resolve(); 
        });
    });
}

function registerUser(userData) {
    return new Promise((resolve, reject) => {
        // Check if passwords match
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }

        // Hash the password before saving the user
        bcrypt.hash(userData.password, 10)
            .then(hash => {
                // Prepare user data for saving, with the hashed password
                let newUser = new User({
                    userName: userData.userName,
                    password: hash, // Use the hashed password
                    email: userData.email,
                    loginHistory: []
                });

                // Save the user to the database
                newUser.save()
                    .then(() => resolve("User registered successfully"))
                    .catch(err => {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject(`There was an error creating the user: ${err}`);
                        }
                    });
            })
            .catch(err => {
                console.error("Error encrypting the password:", err);
                reject("There was an error encrypting the password");
            });
    });
}


function checkUser(userData) {
    return new Promise((resolve, reject) => {
        // Find the user by userName
        User.findOne({ userName: userData.userName })
            .then(user => {
                if (!user) {
                    // User not found
                    reject(`Unable to find user: ${userData.userName}`);
                    return;
                }

                // Compare hashed password with the user-provided password
                bcrypt.compare(userData.password, user.password)
                    .then(isMatch => {
                        if (!isMatch) {
                            // Passwords do not match
                            reject(`Incorrect Password for user: ${userData.userName}`);
                        } else {
                            // Passwords match, update loginHistory
                            user.loginHistory.push({
                                dateTime: new Date().toString(),
                                userAgent: userData.userAgent
                            });

                            // Save the updated login history
                            user.save()
                                .then(() => resolve(user))
                                .catch(err => reject(`There was an error updating the login history: ${err}`));
                        }
                    })
                    .catch(err => {
                        console.error("Error comparing passwords:", err);
                        reject("There was an error verifying the user");
                    });
            })
            .catch(err => {
                console.error("Error finding user:", err);
                reject(`Unable to find user: ${userData.userName}`);
            });
    });
}


module.exports = { initialize, checkUser, registerUser};