const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/TaskManager').then(() => {
    console.log('Connected to MongoDB')
}).catch((err) => {
    console.log('Could Not Connect to DB');
});

module.exports = {
    mongoose
};