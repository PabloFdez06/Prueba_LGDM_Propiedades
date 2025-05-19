fetch('propiedades.xml')
    .then(response => response.text())
    .then(xmlTexto => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlTexto, "application/xml");
        const propiedades = xmlToJson(xmlDoc);
        mostrarTabla(propiedades);
    });

function xmlToJson(xml) {
    const propiedades = [];
    const nodos = xml.getElementsByTagName("propiedad");

    for (let propiedad of nodos) {
        const precioAlquiler = propiedad.querySelector("precioAlquiler").textContent;


        const localizacion = propiedad.querySelector("localizacion");
        const localidad = localizacion.querySelector("localidad").textContent;
        const calle = localizacion.querySelector("calle").textContent;
        const codigoPostal = localizacion.querySelector("codigoPostal").textContent;
        const datosLocalizacion = { localidad, calle, codigoPostal };


        const metrosCuadrados = propiedad.querySelector("metrosCuadrados").textContent;
        const anioConstruccion = propiedad.querySelector("anioConstruccion").textContent;
        propiedades.push({ precioAlquiler, datosLocalizacion, metrosCuadrados, anioConstruccion});
    }

    return propiedades;
}


function mostrarTabla(datos) {
    let html = `
        <table>
          <thead>
            <tr>
              <th>Precio</th>
              <th>Localización</th>
              <th>Metros cuadrados</th>
              <th>Año construcción</th>
            </tr>
          </thead>
          <tbody>
      `;

    datos.forEach(propiedad => {
        html += `
          <tr>
            <td>${propiedad.precioAlquiler} €</td>
            <td>${propiedad.datosLocalizacion.localidad}, ${propiedad.datosLocalizacion.calle}, ${propiedad.datosLocalizacion.codigoPostal}</td>
            <td>${propiedad.metrosCuadrados}</td>
            <td>${propiedad.anioConstruccion}</td>
          </tr>
        `;
    });

    html += "</tbody></table>";
    document.getElementById("tabla-contenedor").innerHTML = html;
}