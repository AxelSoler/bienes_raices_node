import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";
import db from "../config/db.js";
import { Categoria, Precio, Usuario } from "../models/index.js";

const importarDatos = async () => {
  try {
    await db.authenticate();

    await db.sync();

    await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios),
      Usuario.bulkCreate(usuarios)
    ]);

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const eliminarDatos = async () => {
  try {
    // await Categoria.destroy({where: {}, truncate: true})
    // await Precio.destroy({where: {}, truncate: true})

    await db.sync({ force: true });

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importarDatos();
}

if (process.argv[2] === "-e") {
  eliminarDatos();
}
