import mongoose from "mongoose";

/**
 * Generic middleware to validate MongoDB ObjectId route params.
 * 
 * @param {string} paramName - The name of the route parameter to validate (e.g. "taskId")
 * @returns Express middleware function
 */
export const validateObjectId = (paramName) => {
    console.log("hp",paramName);
    
  return (req, res, next) => {
    const id = req.params[paramName];
console.log("helo",id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};
