(function () {
  const lat = -38.0057574;
  const lng = -57.542309;
  const mapa = L.map("mapa-inicio").setView([lat, lng], 14);

  let markers = new L.FeatureGroup().addTo(mapa);

  let propiedades = [];

  // Filtros

  const filtros = {
    categoria: "",
    precio: ""
  };

  const categoriasSelect = document.querySelector("#categorias");
  const preciosSelect = document.querySelector("#precios");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapa);

  // Filtrado de categorias y presios

  categoriasSelect.addEventListener("change", (e) => {
    filtros.categoria = +e.target.value;
    filtrarPropiedades();
  });

  preciosSelect.addEventListener("change", (e) => {
    filtros.precio = +e.target.value;
    filtrarPropiedades();
  });

  const obtenerPropiedades = async () => {
    try {
      const url = "/api/propiedades";
      const respuesta = await fetch(url);
      propiedades = await respuesta.json();

      mostrarPropiedades(propiedades);
    } catch (error) {
      console.log(error);
    }
  };

  const mostrarPropiedades = (propiedades) => {
    markers.clearLayers()
    
    propiedades.forEach((propiedad) => {
      const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
        autopan: true
      }).addTo(mapa).bindPopup(`
        <p class="text-indigo-600 font-bold">${propiedad?.categoria.nombre}</p>
        <h1 class="text-xl font-extrabold uppercase">${propiedad?.titulo}</h1>
        <img src="/uploads/${propiedad?.imagen}" alt=${propiedad?.titulo}>
        <p class="text-gray-600 font-bold">${propiedad?.precio.nombre}</p>
        <a href="/propiedad/${propiedad?.id}" class="block p-2 text-center text-white bg-indigo-600 font-bold uppercase">Ver Propiedad</a>
      `);

      markers.addLayer(marker);
    });
  };

  const filtrarPropiedades = () => {
    const resultado = propiedades
      .filter(filtrarCategoria)
      .filter(filtrarPrecio);

    mostrarPropiedades(resultado);
  };

  const filtrarCategoria = (propiedad) =>
    filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;

  const filtrarPrecio = (propiedad) =>
    filtros.precio ? propiedad.precioId === filtros.precio : propiedad;

  obtenerPropiedades();
})();
