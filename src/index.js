require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');


// import database connection and schema
require('./db/conn');
const Userr = require('./models/userSchema');
const FoodItem = require('./models/foodItemSchema');

const app = express();
app.use(express.json());    // json body parser


// home route
app.get('/', (req, res) => {
    res.send('food-app-api-running-24x7!');
});


const tokken = process.env.TOKEN_SECRET || 'default-key';

// middleware for authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['Authorization'] || req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);

    if (token == null) return res.sendStatus(401);
    
    jwt.verify(token, tokken, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        console.log(user);
        next();
    });

};


// authentication routes (login/signup)
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
      
        // Email validation
        // const emailRegex = /^[^\s@]+@gmail\.ai$/;
        // if (!emailRegex.test(email)) {
        //     return res.status(400).json({ error: 'Invalid email format' });
        // }
        
        // Password validation
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be more than 8 characters' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new Userr({
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);
        
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
  
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
        
        const user = await Userr.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.TOKEN_SECRET);
        
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Food Item Routes
app.post('/food-items', authenticateToken, async (req, res) => {
    try {
        // Only admin can add food items
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
      
        const foodItem = new FoodItem(req.body);
        await foodItem.save();
      
        res.status(201).json(foodItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/food-items', authenticateToken, async (req, res) => {
    try {
        // Only admin can add food items
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
      
        const {id} = req.body;
        await FoodItem.deleteOne({_id: id})
      
        res.status(204).json("Deleted successfully");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/food-items', authenticateToken, async (req, res) => {
    try {
        const foodItems = await FoodItem.find();
        res.json(foodItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
