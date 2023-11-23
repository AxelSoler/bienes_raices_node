import Jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"

const protegerRuta = async (req, res, next) => {
  // Verificar si hay token
  const { _token } = req.cookies
  if(!_token) {
    return res.redirect("/auth/login")
  }

  // Comprobar token
  try {
    const decoded = Jwt.verify(_token, process.env.JWT_SECRET)
    const usuario = await Usuario.scope("eliminarPassword").findByPk(decoded.id)
    
    // Almacenar usuario
    if(usuario) {
      req.usuario = usuario
    } else {
      res.redirect("/auth/login")
    }

    return next()
  } catch (error) {
    return res.clearCookie("_token").redirect("/auth/login")
  }

  next()
}

export default protegerRuta