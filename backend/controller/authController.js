const jwt = require("jsonwebtoken");
const User = require("../model/User");
const bcrypt = require("bcryptjs");

const loginController = async (req, res) => {
    try {
        const { email, password} = req.body;

        // checking if userName and password are provided
        if(!email || !password){
            return res.status(400).json({ message: "Please provide userName and password" });
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "User not found" });
        }

        // checking if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", token);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
        })

    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    loginController
}