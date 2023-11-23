(function () {
  const cambiarEstadoBotones = document.querySelectorAll(".cambiar-estado");
  const token = document
    .querySelector("meta[name='csrf-token']")
    .getAttribute("content");

  cambiarEstadoBotones.forEach((boton) => {
    boton.addEventListener("click", cambiarEstadoPropiedad);
  });

  async function cambiarEstadoPropiedad(e) {
    try {
      const { propiedadId: id } = e.target.dataset;

      const url = `/propiedades/${id}`;

      const respuesta = await fetch(url, {
        method: "PUT",
        headers: {
          "CSRF-Token": token
        }
      });

      const { resultado } = await respuesta.json()

      if (resultado) {
        if(e.target.classList.contains("bg-yellow-100")) {
          e.target.classList.add("text-green-800", "bg-green-100")
          e.target.classList.remove("text-yellow-800", "bg-yellow-100")
          e.target.textContent = "Publicado"
        } else {
          e.target.classList.add("text-yellow-800", "bg-yellow-100")
          e.target.classList.remove("text-green-800", "bg-green-100")
          e.target.textContent = "No Publicado"
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
})();
