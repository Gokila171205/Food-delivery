const notFound = (req, res, next) => {
  res.status(404);
  const error = new Error(`API route not found - ${req.originalUrl}`);
  next(error);
};

module.exports = notFound;
