const bcrypt = require('bcryptjs');

const passwordEncryption = async (password) => {
    try{
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        return hashed;
    } catch (error){
        console.log("Error in password encryption", error);
    }
}

module.exports = passwordEncryption;