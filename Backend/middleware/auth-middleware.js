import jwt from "jsonwebtoken"; // Import JWT library for token verification
import User from "../models/user.js"; // Import User model to query the database

// Middleware to protect routes and authenticate users
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from the Authorization header
    // Expected format: "Bearer <token>"
    const token = req.headers.authorization.split(" ")[1]; // e.g., "Bearer dhghjhdkjfg"
console.log(token);

    // If no token is provided, respond with 401 Unauthorized
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Verify the token using the JWT secret
    // decoded will contain the payload data (e.g., userId)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database using the ID from the decoded token
    const user = await User.findById(decoded.userId);

    // If user does not exist, respond with 401 Unauthorized
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Attach the user object to the request so it can be accessed in other routes
    req.user = user;

    // Call next() to pass control to the next middleware or route handler
    next();
  } catch (error) {
    console.log(error); // Log the error for debugging

      if (error.name === "TokenExpiredError") {
      // Specific handling for expired token
      return res.status(401).json({ message: "Token expired, please login again" });
    }

    if (error.name === "JsonWebTokenError") {
      // Invalid token (tampered or malformed)
      return res.status(401).json({ message: "Invalid token" });
    }
    // Return a 500 Internal Server Error response for unexpected errors
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default authMiddleware; // Export the middleware to use in routes
