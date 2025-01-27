import { USER_DATA } from "./data.js";
import express from "express";
const app = express();
const port = 3000;

// Empty array to store data
let data = [];

// Get all users
app.get("/users", (req, res) => {
  // Copy all user_data to data array
  data = [...USER_DATA];
  res.json(data);
});

// Get specific user by guid
app.get("/users/:guid", (req, res) => {
  const requested_guid = req.params.guid;

  data = USER_DATA.filter(function (user) {
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

app.delete("/users/:guid", (req, res) => {
  const requested_guid = req.params.guid;

  // Find the index of the user
  const userIndex = USER_DATA.findIndex((user) => {
    if (user.guid === requested_guid) {
      console.log(`Found user: ${requested_guid}`);
      return true;
    }
    return false;
  });

  // If user is found
  if (userIndex !== -1) {
    // Store the user data before removing
    const deletedUser = USER_DATA[userIndex];

    // Remove the user from the array
    USER_DATA.splice(userIndex, 1);

    // Send the deleted user data in response
    res.json(deletedUser);
    console.log(`User deleted: ${requested_guid}`);
  } else {
    // If user is not found
    res.status(404).json({ message: "User not found" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
