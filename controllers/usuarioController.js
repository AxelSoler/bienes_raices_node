import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import { generarJWT, generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar Sesion",
    csrfToken: req.csrfToken()
  });
};

const autenticar = async (req, res) => {
  await body("email").isEmail().withMessage("Inserte un email").run(req);
  await body("password")
    .notEmpty()
    .withMessage("Inserte Password")
    .run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: resultado.array()
    });
  }

  const { email, password } = req.body

  const usuario = await Usuario.findOne({ where: {email} })
  
  if(!usuario) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{msg: "El usuario no existe"}]
    });
  }
  
  if(!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{msg: "El usuario no esta confirmado"}]
    });
  }
  
  if(!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{msg: "Password incorrecta"}]
    });
  }

  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre})

  console.log(token);

  return res.cookie("_token", token, {
    httpOnly: true,
    // secure: true
    // sameSite: true
  }).redirect("/mis-propiedades")

}

const cerrarSesion = (req, res) => {
  return res.clearCookie("_token").status(200).redirect("/auth/login")
}

const formularioRegister = (req, res) => {
  res.render("auth/register", {
    pagina: "Crear cuenta",
    csrfToken: req.csrfToken()
  });
};

const register = async (req, res) => {
  // validacion
  await body("nombre")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio")
    .run(req);
  await body("email").isEmail().withMessage("Inserte un email").run(req);
  await body("password")
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos de 6 caracteres")
    .run(req);
  await body("repeat_password")
    .equals(req.body.password)
    .withMessage("Password no son iguales")
    .run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("auth/register", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email
      }
    });
  }

  const { nombre, email, password } = req.body;

  const existeUsuario = await Usuario.findOne({ where: { email } });

  if (existeUsuario) {
    return res.render("auth/register", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Usuario existente" }],
      usuario: {
        nombre,
        email
      }
    });
  }

  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId()
  });

  // Envia mail de confirmacion
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token
  });

  res.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje: "Hemos enviado un mail de confirmacion"
  });
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params

  const usuario = await Usuario.findOne({ where: {token} })
  
  if(!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta",
      error: true
    });
  }

  // Confirmar cuenta
  usuario.token = null
  usuario.confirmado = true
  await usuario.save()

  res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta Confirmada",
    mensaje: "La cuenta se confirmo correctamente"
  });

}

const formularioForgottenPassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Recuperar Password",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  // validacion
  await body("email").isEmail().withMessage("Inserte un email").run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("auth/olvide-password", {
      pagina: "Recuperar Password",
      csrfToken: req.csrfToken(),
      errores: resultado.array()
    });
  }

  const { email } = req.body

  // Buscar usuario
  const usuario = await Usuario.findOne({ where: {email} })

  if(!usuario) {
    return res.render("auth/olvide-password", {
      pagina: "Recuperar Password",
      csrfToken: req.csrfToken(),
      errores: [{msg: "El email no pertenece a ningun usuario"}]
    });
  }

  usuario.token = generarId()
  await usuario.save()

  // Enviar mail
  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token
  })

  // Renderizar mensaje
  res.render("templates/mensaje", {
    pagina: "Reestablece tu password",
    mensaje: "Hemos enviado un mail con las instrucciones"
  });
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: {token}})

  if(!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Reestablece tu password",
      mensaje: "Hubo un error al validar tu informacion, intenta de nuevo",
      error: true
    });
  }

  res.render("auth/reset-password", {
    pagina: "Reestablece tu password",
    csrfToken: req.csrfToken()
  })

}

const nuevoPassword = async (req, res) => {
  await body("password")
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos de 6 caracteres")
    .run(req);

    let resultado = validationResult(req);
  
    if (!resultado.isEmpty()) {
      return res.render("auth/reset-password", {
        pagina: "Reestablece tu password",
        csrfToken: req.csrfToken(),
        errores: resultado.array(),
      });
    }

  const { token } = req.params;
  const { password } = req.body;

  const usuario = await Usuario.findOne({ where: { token } })

  const salt = await bcrypt.genSalt(10)
  usuario.password = await bcrypt.hash(password, salt)
  usuario.token = null

  await usuario.save()

  res.render("auth/confirmar-cuenta", {
    pagina: "Password reestablecido",
    mensaje: "Password reestablecido correctamente",
  });

}

export {
  formularioLogin,
  autenticar,
  cerrarSesion,
  formularioRegister,
  register,
  confirmarCuenta,
  formularioForgottenPassword,
  resetPassword,
  comprobarToken,
  nuevoPassword
};
