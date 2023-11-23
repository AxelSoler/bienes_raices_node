import { unlink } from "fs/promises";
import { validationResult } from "express-validator";
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from "../models/index.js";
import { esVendedor, formatearFecha } from "../helpers/index.js";

const admin = async (req, res) => {
  const { pagina: paginaActual } = req.query;

  const expresion = /^[1-9]$/;

  if (!expresion.test(paginaActual)) {
    return res.redirect("mis-propiedades?pagina=1");
  }

  try {
    const { id } = req.usuario;

    const limit = 10;
    const offset = paginaActual * limit - limit;

    const [propiedades, total] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: { usuarioId: id },
        include: [
          { model: Categoria, as: "categoria" },
          { model: Precio, as: "precio" },
          { model: Mensaje, as: "mensajes" }
        ]
      }),
      Propiedad.count({
        where: {
          usuarioId: id
        }
      })
    ]);

    res.render("propiedades/admin", {
      pagina: "Mis propiedades",
      csrfToken: req.csrfToken(),
      propiedades,
      paginas: Math.ceil(total / limit),
      paginaActual: Number(paginaActual),
      total,
      offset,
      limit
    });
  } catch (error) {
    console.log(error);
  }
};

const crear = async (req, res) => {
  // consultar precios y categorias
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll()
  ]);

  res.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: {}
  });
};

const guardar = async (req, res) => {
  // validacion
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    // consultar precios y categorias
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll()
    ]);

    return res.render("propiedades/crear", {
      pagina: "Crear Propiedad",
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body
    });
  }

  const {
    titulo,
    descripcion,
    habitaciones,
    estacionamiento,
    wc,
    calle,
    lat,
    lng,
    precio,
    categoria
  } = req.body;

  // Crear un registro
  try {
    const propiedadGuardada = await Propiedad.create({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precioId: precio,
      categoriaId: categoria,
      usuarioId: req.usuario.id,
      imagen: ""
    });

    const { id } = propiedadGuardada;
    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.log(error);
  }
};

const agregarImagen = async (req, res) => {
  const { id } = req.params;
  const propiedad = await Propiedad.findByPk(id);
  // Validar propiedad exista
  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Validar propiedad no este publicada
  if (propiedad.publicado) {
    res.redirect("/mis-propiedades");
  }

  // Validar propiedad pertenezca al usuario
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    res.redirect("/mis-propiedades");
  }

  res.render("propiedades/agregar-imagen", {
    pagina: `Agregar Propiedad: ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    propiedad
  });
};

const almacenarImagen = async (req, res, next) => {
  const { id } = req.params;
  const propiedad = await Propiedad.findByPk(id);
  // Validar propiedad exista
  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Validar propiedad no este publicada
  if (propiedad.publicado) {
    res.redirect("/mis-propiedades");
  }

  // Validar propiedad pertenezca al usuario
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    res.redirect("/mis-propiedades");
  }

  try {
    propiedad.imagen = req.file.filename;
    propiedad.publicado = 1;

    await propiedad.save();

    next();
  } catch (error) {
    console.log(error);
  }
};

const editar = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }
  // consultar precios y categorias
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll()
  ]);

  res.render("propiedades/editar", {
    pagina: "Editar Propiedad",
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: propiedad
  });
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }
  
  propiedad.publicado = !propiedad.publicado
  await propiedad.save()

  res.json({
    resultado: "ok"
  })
};

const guardarCambios = async (req, res) => {
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    // consultar precios y categorias
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll()
    ]);

    return res.render("propiedades/editar", {
      pagina: "Editar Propiedad",
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body
    });
  }

  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  try {
    const {
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precio,
      categoria
    } = req.body;

    propiedad.set({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precioId: precio,
      categoriaId: categoria
    });

    await propiedad.save();

    res.redirect("/mis-propiedades");
  } catch (error) {
    console.log(error);
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  propiedad.imagen && (await unlink(`public/uploads/${propiedad.imagen}`));

  await propiedad.destroy();
  res.redirect("/mis-propiedades");
};

// Muestra propiedad
const mostrarPropiedad = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" }
    ]
  });

  if (!propiedad || !propiedad.publicado) {
    return res.redirect("/404");
  }

  return res.render("propiedades/mostrar", {
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    propiedad,
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
  });
};
// Muestra propiedad
const enviarMensaje = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" }
    ]
  });

  if (!propiedad) {
    return res.redirect("/404");
  }

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("propiedades/mostrar", {
      pagina: propiedad.titulo,
      csrfToken: req.csrfToken(),
      propiedad,
      usuario: req.usuario,
      esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
      errores: resultado.array()
    });
  }

  const { mensaje } = req.body;
  const { id: propiedadId } = req.params;
  const { id: usuarioId } = req.usuario;

  await Mensaje.create({
    mensaje,
    propiedadId,
    usuarioId
  });

  res.redirect("/");
};

const verMensajes = async (req, res) => {
  const { id } = req.params;

  const propiedad = await Propiedad.findByPk(id, {
    include: [
      {
        model: Mensaje,
        as: "mensajes",
        include: [{ model: Usuario.scope("eliminarPassword"), as: "usuario" }]
      }
    ]
  });

  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("propiedades/mensajes", {
    pagina: "Mensajes",
    mensajes: propiedad.mensajes,
    formatearFecha
  });
};

export {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editar,
  guardarCambios,
  eliminar,
  cambiarEstado,
  mostrarPropiedad,
  enviarMensaje,
  verMensajes
};
