import jwt from "jsonwebtoken";

const generateToken = (userId, tokenVersion = 0) => {
  return jwt.sign(
    { userId, tokenVersion },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

export default generateToken;
