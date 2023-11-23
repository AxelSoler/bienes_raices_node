import bcrypt from "bcrypt";

const usuarios = [
  {
    nombre: "Axel",
    email: "axel@mail.com",
    confirmado: 1,
    password: bcrypt.hashSync("123456", 10)
  }
];

export default usuarios;
