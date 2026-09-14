export const getAdminAccess = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};