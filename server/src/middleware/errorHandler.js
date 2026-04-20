export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = error.message || "Something went wrong";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors || {})
      .map((entry) => entry.message)
      .filter(Boolean)
      .join(", ") || message;
  }

  if (error.code === 11000) {
    statusCode = 400;
    const duplicateField = Object.keys(error.keyPattern || {})[0];
    message = duplicateField ? `${duplicateField} already exists` : "A record with this value already exists";
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path || "value"}`;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
