const jwt = require("jsonwebtoken");
const productService = require("../services/productService");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "productiq_super_secret_jwt_key_2026_secure"
    );

    const user = await productService.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed or expired",
      error: error.message,
    });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "productiq_super_secret_jwt_key_2026_secure"
      );
      req.user = await productService.findUserById(decoded.id);
    } catch (e) {
      // Ignore token failure for optional endpoints
    }
  }

  next();
};

module.exports = {
  protect,
  optionalProtect,
};
