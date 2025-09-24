const jwt = require("jsonwebtoken");

const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error) {
        console.log("Error in isLoggedIn middleware", error);
    }
}

module.exports = isLoggedIn;