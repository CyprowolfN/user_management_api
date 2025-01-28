import express from "express";
import { v4 as uuidv4 } from "uuid";
import user_data from "./data.json" assert { type: "json" };
import fs from 'fs';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Empty array to store data
let data = [];

// Get all users
app.get("/users", (req, res) => {
  // Copy all user_data to data array
  data = [...user_data];
  res.json(data);
});

// Get specific user by guid
app.get("/users/:guid", (req, res) => {
  const requested_guid = req.params.guid;

  data = user_data.filter((user) => {
    // If user.guid matches requested_guid, return that user's guid
    if (user.guid === requested_guid) {
      return true;
    }
    // If it doesn't match, filter it out
    return false;
  });

  if (data.length > 0) {
    // Return the single user object
    res.json(data[0]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Delete user by guid
app.delete("/users/:guid", (req, res) => {
  const requested_guid = req.params.guid;

  // Find the index of the user
  const userIndex = user_data.findIndex((user) => {
    if (user.guid === requested_guid) {
      console.log(`Found user: ${requested_guid}`);
      return true;
    }
    return false;
  });

  // If user is found
  if (userIndex !== -1) {
    const deletedUser = user_data[userIndex];

    // This is where we delete the user and then update the data.json file
    user_data.splice(userIndex, 1);
    fs.writeFileSync('data.json', JSON.stringify(user_data, null, 2));


    // Send the deleted user data in response
    res.json(deletedUser);
    console.log(`User deleted: ${requested_guid}`);
  } else {
    // If user is not found
    res.status(404).json({ message: "User not found" });
  }
});

// Post a new user
app.post("/users/post", (req, res) => {
  const { name, phone, email } = req.body;

  // Generate a random GUID
  const guid = uuidv4();

  // Create a new user object
  const newUser = {
    guid,
    name,
    phone,
    email,
  };

  user_data.push(newUser);
  res.status(201).json(newUser);
  fs.writeFileSync('data.json', JSON.stringify(user_data, null, 2));
  console.log(`User added: ${guid}`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
