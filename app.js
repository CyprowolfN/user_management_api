import express from "express";
import { v4 as uuidv4 } from "uuid";
import user_data from "./data.json" assert { type: "json" };
import fs from "fs";

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Empty array to hold onto data
let data = [];

// Get all users
app.get("/users", (req, res) => {
  // Copy all user_data to data array
  data = [...user_data];
  res.json(data);
});

// Get user by guid
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
app.delete("/users/delete/:guid", (req, res) => {
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
    const deleted_user = user_data[userIndex];

    // This is where we delete the user and then update the data.json file
    user_data.splice(userIndex, 1);
    fs.writeFileSync("data.json", JSON.stringify(user_data, null, 2));

    // Send the deleted user data in response
    res.json(deleted_user);
    console.log(`User deleted: ${requested_guid}`);
  } else {
    // If user is not found
    res.status(404).json({ message: "User not found" });
  }
});

// Create a new user
app.post("/users/create", (req, res) => {
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
  fs.writeFileSync("data.json", JSON.stringify(user_data, null, 2));
  console.log(`User added: ${guid}`);
});

// Edit a user
app.put("/users/edit/:guid", (req, res) => {
  const { guid, name, phone, email } = req.body;

  // Is the guid equal to the user's guid?
  const userIndex = user_data.findIndex((user) => {
    if (user.guid === guid) {
      console.log(`Found user: ${guid}`);
      return true;
    }
    return false;
  });
  const updated_user = {
    guid,
    name,
    phone,
    email,
  };

  // If user is found
  if (userIndex !== -1) {
    const edited_user = user_data[userIndex];

    // Remove the old user from user_data array
    user_data.splice(userIndex, 1);

    // Update user_data array with new user data
    user_data.push(updated_user);

    // write the updated user_data array to data.json file
    fs.writeFileSync("data.json", JSON.stringify(user_data, null, 2));

    // Send the edited_user data in response
    res.json(edited_user);
    console.log(`User edited: ${guid}`);
  } else {
    // If user is not found
    console.log(`User not found: ${guid}`);
    res.status(404).json({ message: "User not found" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
