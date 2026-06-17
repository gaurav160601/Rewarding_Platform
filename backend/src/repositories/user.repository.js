const {pool}= require("../database/mysql");

class UserRepository{
    async findByEmail(email){
        const [rows]= await pool.execute(
            `SELECT * FROM users WHERE email=?`, 
            [email]);
        return rows[0];
    }

    async findById(id){
        const [rows]= await pool.execute(
            `SELECT * FROM users WHERE id=?`,
             [id]);
        return rows[0];
    }

    async createUser(user){
        const {name, email, password}= user;
        const [result]= await pool.execute(
            `INSERT INTO users ( email, password_hash, role) VALUES ( ?,?, ?)`,
            [user.email, user.passwordHash, user.role]
        );
        return result.insertId;
    }

}

module.exports= new UserRepository();