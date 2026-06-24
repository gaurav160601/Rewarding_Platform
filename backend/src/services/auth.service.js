const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../utils/jwt");
const userRepository = require("../repositories/user.repository");
const role = require("../constants/roles");
const emailQueue = require("../queues/email.queue");
const { sendMessage } = require("../producers/order.producer");
const TOPICS = require("../topics/kafka.topics");

class AuthService {
    async register(data) {

        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
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
        const user = await userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const validPassword = await bcrypt.compare(
            data.password,
            user.password_hash
        );

        if (!validPassword) {
            throw new Error("Invalid credentials");
        }

        const token = generateAccessToken(user);

        return { token };


    }
}

module.exports = new AuthService();
