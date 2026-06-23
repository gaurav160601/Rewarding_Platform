const authService = require("../services/auth.service");
const userRepository = require("../repositories/user.repository");

class AuthController {
    async register(req, res, next) {
        try {
            const result = await authService.register(
                req.body
            );
            return res.status(201).json({
                success: true,
                data: result
            });

        } catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await authService.login(
                req.body
            );
            return res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {
            next(error);
        }
    }
    async profile(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const { password_hash, ...safeUser } = user;
      return res.status(200).json({ success: true, data: safeUser });
    } catch (error) {
      next(error);
    }
}
}

module.exports = new AuthController();
