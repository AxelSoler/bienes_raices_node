import express from "express"
import csrf from "csurf"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js"
import propiedadesRoutes from "./routes/propiedadesRoutes.js"
import appRoutes from "./routes/appRoutes.js"
import apiRoutes from "./routes/apiRoutes.js"
import db from "./config/db.js"

// App
const app = express()

// Habilitar lectura de formularios
app.use( express.urlencoded({extended:true}) )

// Habilitar cookie-parser
app.use( cookieParser() )

// Habilitar csrf
app.use( csrf({ cookie: true }) )

// Conexion a la db
try {
  await db.authenticate()
  db.sync()
  console.log("conexion correcta a la DB");
} catch(error) {
  console.log(error);
}

// Habilitar pug
app.set("view engine", "pug")
app.set("views", "./views")

// Carpeta publica
app.use( express.static("public") )

// Routing
app.use("/", appRoutes)
app.use("/auth", userRoutes)
app.use("/", propiedadesRoutes)
app.use("/api", apiRoutes)

// Puerto
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`server funcionando en el port ${port}`);
})