// --------------------------------------
// BLOQUE NODE (procesamiento y guardado)
// --------------------------------------

if (typeof window === "undefined") { // el if typeof window quiere decir que, window es una propiedad solo del navegador, entonces si esta undefined es que no está en el navegador por lo que ejecutará ese bloque de código, que es el compatible con node.js.
    const fs = require("fs");
    const xml2js = require("xml2js");

    const xmlPath = "propiedades.xml";
    const jsonPath = "propiedades.json";
    const schemaPath = "estructura.json";

    // Leer y procesar XML
    fs.readFile(xmlPath, "utf-8", (err, xmlData) => {
        if (err) return console.error("Error al leer XML:", err);

        xml2js.parseString(xmlData, (err, result) => {
            if (err) return console.error("Error al parsear XML:", err);

            const propiedades = result.propiedades.propiedad.map(p => ({
                precioAlquiler: parseInt(p.precioAlquiler[0]),
                datosLocalizacion: {
                    localidad: p.localizacion[0].localidad[0],
                    calle: p.localizacion[0].calle[0],
                    codigoPostal: parseInt(p.localizacion[0].codigoPostal[0])
                },
                metrosCuadrados: parseInt(p.metrosCuadrados[0]),
                anioConstruccion: parseInt(p.anioConstruccion[0])
            }));

            // Guardar JSON
            fs.writeFileSync(jsonPath, JSON.stringify(propiedades, null, 2));
            console.log("propiedades.json generado");

            // Generar y guardar schema del JSON
            const schema = generarJsonSchemaDesdeDatos(propiedades);
            fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
            console.log("estructura.json generada");
        });
    });

    function generarJsonSchemaDesdeDatos(datos) {
        const ejemplo = datos[0];

        const inferirTipo = valor => {
            if (typeof valor === "number") return Number.isInteger(valor) ? "integer" : "number";
            if (typeof valor === "string") return "string";
            if (typeof valor === "boolean") return "boolean";
            if (Array.isArray(valor)) return "array";
            if (typeof valor === "object") return "object";
            return "string";
        };

        const construirEsquema = objeto => {
            const properties = {};
            const required = [];

            for (const clave in objeto) {
                required.push(clave);
                const valor = objeto[clave];
                const tipo = inferirTipo(valor);

                properties[clave] = tipo === "object"
                    ? construirEsquema(valor)
                    : { type: tipo };
            }

            return {
                type: "object",
                properties,
                required
            };
        };

        return {
            $schema: "http://json-schema.org/draft-07/schema#",
            title: "Propiedades",
            type: "array",
            items: construirEsquema(ejemplo)
        };
    }
}

// --------------------------------
// BLOQUE NAVEGADOR (mostrar datos) | lo hago en diferente (comprobado por el if anterior) ya que el fetch no es compatible con el Node.js
// --------------------------------
if (typeof window !== "undefined") {

    fetch("propiedades.json")
        .then(res => res.json())
        .then(data => mostrarTabla(data))
        .catch(err => {
            const contenedor = document.getElementById("tabla-contenedor");
            if (contenedor) {
                contenedor.innerHTML = "<p>Error al cargar los datos.</p>";
            }
            console.error("Error al cargar JSON:", err);
        });

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
        const contenedor = document.getElementById("tabla-contenedor");
        if (contenedor) {
            contenedor.innerHTML = html;
        }
    }
}