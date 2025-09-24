const mongoose = require('mongoose');

const mongoConnection = async () => {
    
    const dbUrl = process.env.mongoUrl;
    
    try {
        await mongoose.connect(`${dbUrl}/mergemind`)
        .then(() => {
            console.log("🚀🚀🚀 connected to mongoDB");
        })
    } catch (error) {
        console.log("Error connecting to mongoDB", error);
    }
}

module.exports = mongoConnection;