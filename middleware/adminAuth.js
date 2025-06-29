exports.requireAdminLogin = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next();
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
