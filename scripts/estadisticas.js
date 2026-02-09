function calcularEstadisticas() {
  let total = peliculasGlobal.length;

  let conteoPorCat = {};

  for (let cat of categoriasGlobal) {
    conteoPorCat[cat.id] = 0;
  }

  for (let peli of peliculasGlobal) {
    if (conteoPorCat[peli.idCategoria] !== undefined) {
      conteoPorCat[peli.idCategoria]++;
    }
  }

  let aptas12 = 0;
  let resto = 0;

  for (let peli of peliculasGlobal) {
    let cat = categoriasGlobal.find((c) => c.id == peli.idCategoria);

    if (!cat) continue;

    if (cat.edad_requerida > 12) {
      aptas12++;
    } else {
      resto++;
    }
  }

  let porcentaje12 = total > 0 ? ((aptas12 * 100) / total).toFixed(1) : 0;
  let porcentajeResto = total > 0 ? ((resto * 100) / total).toFixed(1) : 0;

  let html = `<h3>Total películas: ${total}</h3>`;

  html += `<h4>Por categoría</h4>`;

  for (let cat of categoriasGlobal) {
    html += `
      <ion-item>
        <ion-label>
          ${cat.emoji} ${cat.nombre}: ${conteoPorCat[cat.id]}
        </ion-label>
      </ion-item>
    `;
  }

  html += `
    <h4>Porcentaje edades</h4>
    <p>+12: ${aptas12} (${porcentaje12}%)</p>
    <p>Resto: ${resto} (${porcentajeResto}%)</p>
  `;

  document.querySelector("#listaPorCategoria").innerHTML = html;
}

function prepararEstadisticas() {
  let token = localStorage.getItem("token");

  fetch("https://movielist.develotion.com/peliculas.php", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((r) => r.json())
    .then((data) => {
      peliculasGlobal = data.peliculas || [];

      return fetch("https://movielist.develotion.com/categorias.php", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
    })
    .then((r) => r.json())
    .then((data) => {
      categoriasGlobal = data.categorias || [];

      calcularEstadisticas();
    })
    .catch(() => alert("Error al cargar estadísticas"));
}
