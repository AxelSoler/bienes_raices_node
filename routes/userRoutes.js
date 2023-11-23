import express from "express";
import {
  formularioLogin,
  formularioRegister,
  register,
  confirmarCuenta,
  formularioForgottenPassword,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  autenticar,
  cerrarSesion
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/login", formularioLogin);
router.post("/login", autenticar);

router.post("/cerrar-sesion", cerrarSesion);

router.get("/register", formularioRegister);
router.post("/register", register);

router.get("/confirmar/:token", confirmarCuenta);

router.get("/olvidepassword", formularioForgottenPassword);
router.post("/olvidepassword", resetPassword);

router.get("/olvidepassword/:token", comprobarToken);
router.post("/olvidepassword/:token", nuevoPassword);

export default router;
