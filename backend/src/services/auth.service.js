const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../utils/jwt");
const userRepository = require("../repositories/user.repository");
const role = require("../constants/roles");
const emailQueue = require("../queues/email.queue");
const { sendMessage } = require("../producers/order.producer");
const TOPICS = require("../topics/kafka.topics");
const logger = require("../utils/logger");

const authLog = logger.child({ module: "auth.service" });

class AuthService {
    async register(data) {
        authLog.info({ event: "AUTH_REGISTER_ATTEMPT", email: data.email }, "AUTH_REGISTER_ATTEMPT");

        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            authLog.warn({ event: "AUTH_REGISTER_FAILED", email: data.email, reason: "email already exists" }, "AUTH_REGISTER_FAILED");
            throw new Error("email already exists");
        }

        const passwordHash =
            await bcrypt.hash(
                data.password,
                10
            );

        const userId =
            await userRepository.createUser({
                email: data.email,
                passwordHash,
                role: role.CUSTOMER
            });

        authLog.info({ event: "AUTH_REGISTER_SUCCESS", userId, email: data.email }, "AUTH_REGISTER_SUCCESS");

        await emailQueue.add(
            "WELCOME",
            {
                email: data.email,
                name: data.name || data.email
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000
                }
            }
        );

        sendMessage(TOPICS.USER_REGISTERED, {
            email: data.email,
            userId,
            name: data.name || data.email
        });

        return { userId };
    }

    async login(data) {
        authLog.info({ event: "AUTH_LOGIN_ATTEMPT", email: data.email }, "AUTH_LOGIN_ATTEMPT");

        const user = await userRepository.findByEmail(data.email);
        if (!user) {
            authLog.warn({ event: "AUTH_LOGIN_FAILED", email: data.email, reason: "user not found" }, "AUTH_LOGIN_FAILED");
            throw new Error("Invalid credentials");
        }

        const validPassword = await bcrypt.compare(
            data.password,
            user.password_hash
        );

        if (!validPassword) {
            authLog.warn({ event: "AUTH_LOGIN_FAILED", email: data.email, reason: "invalid password" }, "AUTH_LOGIN_FAILED");
            throw new Error("Invalid credentials");
        }

        const token = generateAccessToken(user);

        authLog.info({ event: "AUTH_LOGIN_SUCCESS", userId: user.id, email: user.email }, "AUTH_LOGIN_SUCCESS");
        authLog.info({ event: "JWT_CREATED", userId: user.id, email: user.email }, "JWT_CREATED");

        return { token };

    }
}

module.exports = new AuthService();
