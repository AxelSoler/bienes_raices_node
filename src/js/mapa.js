(function() {
  const lat = document.querySelector("#lat").value || -38.0057574;
  const lng = document.querySelector("#lng").value || -57.542309;
  const mapa = L.map('mapa').setView([lat, lng ], 14);
  let marker;

  const geocodeService = L.esri.Geocoding.geocodeService();

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapa);

  // Pin
  marker = new L.marker([lat,lng], {
    draggable: true,
    autoPan: true
  })
  .addTo(mapa)

  // detectar movimiento de pin
  marker.on("moveend", function(e) {
    marker = e.target
    const posicion = marker.getLatLng()
    mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))

    // Obtener info de calles
    geocodeService.reverse().latlng(posicion, 14).run(function(error, resultado) {
      console.log(resultado);

      marker.bindPopup(resultado.address.LongLabel)

      // Llenar los campos
      document.querySelector(".calle").textContent = resultado?.address?.Address ?? ""
      document.querySelector("#calle").value = resultado?.address?.Address ?? ""
      document.querySelector("#lat").value = resultado?.latlng?.lat ?? ""
      document.querySelector("#lng").value = resultado?.latlng?.lng ?? ""
    })
  })

})()