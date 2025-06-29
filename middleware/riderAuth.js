exports.requireRiderLogin = (req, res, next) => {
  if (req.session && req.session.rider) {
    return next();
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
