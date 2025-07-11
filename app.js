import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ES module __dirname workaround
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

/*
- Trying to work with file data before it's actually read
- Sending responses before data is saved
- Race conditions where multiple operations interfere with each other

- Think of it like ordering food:
-- Without await: Asking for your order and immediately walking away (before getting your food)
-- With await: Asking for your order and waiting until you actually get your food before leaving
*/

// Middleware to parse JSON bodies
/*
app.use(express.json())
is for parsing incoming request bodies (from clients).
JSON.parse(data)
is for parsing JSON strings you read from files on your server. 
*/
app.use(express.json());

// Helper function to read users file
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
}

// Helper function to write users file
async function writeUsers(data) {
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

// CREATE - Add a new user
app.post('/api/users', async (req, res) => {
    try {
        const { FirstName, LastName, PhoneNumber, Address } = req.body;
        
        // Validate required fields
        if (!FirstName || !LastName || !PhoneNumber || !Address) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const data = await readUsers();
        const newUser = {
            UID: uuidv4(),
            FirstName,
            LastName,
            PhoneNumber,
            Address
        };

        data.users.push(newUser);
        await writeUsers(data);

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// READ - Get all users
app.get('/api/users', async (req, res) => {
    try {
        const data = await readUsers();
        res.json(data.users);
    } catch (error) {
        res.status(500).json({ error: 'Error reading users' });
    }
});

// READ - Get a single user by UID
app.get('/api/users/:uid', async (req, res) => {
    try {
        const data = await readUsers();
        const user = data.users.find(u => u.UID === req.params.uid);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error reading user' });
    }
});

// UPDATE - Update a user
app.put('/api/users/:uid', async (req, res) => {
    try {
        const { FirstName, LastName, PhoneNumber, Address } = req.body;
        const data = await readUsers();
        const userIndex = data.users.findIndex(u => u.UID === req.params.uid);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        /*
            If FirstName (from the request body) exists and is not empty/null/undefined, use that value
            Otherwise, use the value from the existing user data
        */
        // Update user with new data, maintaining the same UID
        data.users[userIndex] = {
            UID: req.params.uid,
            FirstName: FirstName || data.users[userIndex].FirstName,
            LastName: LastName || data.users[userIndex].LastName,
            PhoneNumber: PhoneNumber || data.users[userIndex].PhoneNumber,
            Address: Address || data.users[userIndex].Address
        };

        await writeUsers(data);
        res.json(data.users[userIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// DELETE - Delete a user
app.delete('/api/users/:uid', async (req, res) => {
    try {
        const data = await readUsers();
        const userIndex = data.users.findIndex(u => u.UID === req.params.uid);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        data.users.splice(userIndex, 1);
        await writeUsers(data);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 