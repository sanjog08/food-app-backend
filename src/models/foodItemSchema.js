const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    specialty: {
        type: String, 
        required: false
    },
    category: {
        type: String, 
        required: true
    },
    price: {
        type: Number, 
        required: true
    },
    discount: {
        type: Number, 
        required: true
    },
    sellarname: {
        type: String, 
        required: true
    },
    sellaraddress: {
        type: String, 
        required: true
    },
    image: {
        type: String, 
        required: true
    }
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
module.exports = FoodItem;