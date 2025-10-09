const jwt = require("jsonwebtoken");
const User = require("../model/User");

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const details = await User.findById(decoded.id).select(
      "fullName email githubConnected profilePicture"
    );
    req.user = details;
    next();
  } catch (error) {
    console.log("Error in isLoggedIn middleware", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = isLoggedIn;
