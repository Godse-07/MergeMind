const jwt = require("jsonwebtoken");
const User = require("../model/User");

const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const details = await User.findById(decoded.id).select(
      "-password -githubToken",
    );

    if (!details) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = details;
    next();
  } catch (error) {
    console.log("Error in isLoggedIn middleware", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = isLoggedIn;
