import nodemailer from "nodemailer"

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const { nombre, email, token } = datos

  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Confirma tu cuenta en BienesRaices.com",
    text: "Confirma tu cuenta en BienesRaices.com",
    html: `
      <p>Hola ${nombre} comprueba tu cuenta en Bienes Raices</p>
      <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
      <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a> </p>

      <p>Si tu no creaste esta cuenta puedes ignorar este mensaje</p>
    `
  })
}

const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const { nombre, email, token } = datos

  await transport.sendMail({
    from: "BienesRaices.com",
    to: email,
    subject: "Reestablce tu password en BienesRaices.com",
    text: "Reestablce tu password en BienesRaices.com",
    html: `
      <p>Hola ${nombre}, has solicitado cambiar la password en Bienes Raices</p>
      <p>Sigue el siguiente enlace para generar un password nuevo:
      <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvidepassword/${token}">Reestablecer Password</a> </p>

      <p>Si tu no solicitaste este cambio puedes ignorar este mensaje</p>
    `
  })
}

export {
  emailRegistro,
  emailOlvidePassword
}