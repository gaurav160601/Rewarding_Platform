function requireAuth(context) {
  if (!context.user) {
    throw new Error(
      "Authentication required"
    );
  }
  return context.user;
}

function requireRole(context, role) {
  const user = requireAuth(context);

  if (user.role !== role) {
    throw new Error(
      `Admin role required`
    );
  }

  return user;
}

module.exports = {
  requireAuth,
  requireRole,
};
