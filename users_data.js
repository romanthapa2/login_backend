import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const users = [];

const hashPassword = (password) =>{
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
    return bcrypt.hashSync(password,salt);
}

const verifyPassword = (password,hashedPassword) => bcrypt.compareSync(password,hashedPassword);

const autoIncrementId = () => {
    if(users.length === 0) return 1;
    return users[users.length - 1].id + 1;
}

const getusers = () => users;

const addUser = (user) =>{
    const newUser = {id: autoIncrementId(), username: user.username, password: hashPassword(user.password), phone : user.phone, email: user.email,address:user.address, gender: user.gender};
    users.push(newUser);
    return newUser;
}

const findUser = (username)=>users.find(user=>user.username === username);

export {getusers,addUser,findUser,verifyPassword};
