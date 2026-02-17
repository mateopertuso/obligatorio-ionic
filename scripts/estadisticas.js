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

  let html = `

<div class="dash-total">
  <span class="dash-label">TOTAL PELÍCULAS</span>
  <span class="dash-num">${total}</span>
</div>

<h4 class="dash-title">CATEGORÍAS</h4>

<div class="dash-grid">
`;

  for (let cat of categoriasGlobal) {
    html += `
  <div class="dash-card">
    <div class="dash-left">
      <div class="dash-emoji">${cat.emoji}</div>
      <span>${cat.nombre}</span>
    </div>

    <div class="dash-count">
      ${conteoPorCat[cat.id]}
    </div>
  </div>
  `;
  }
  
  html += `
</div>

<h4 class="dash-title">CLASIFICACIÒN</h4>

<div class="dash-ages">

  <div class="age-row">
    <span>+12</span>
    <span>${aptas12}</span>
  </div>

  <div class="dash-bar">
    <div class="dash-fill blue" style="width:${porcentaje12}%"></div>
  </div>

  <div class="age-row">
    <span>Resto</span>
    <span>${resto}</span>
  </div>

  <div class="dash-bar">
    <div class="dash-fill purple" style="width:${porcentajeResto}%"></div>
  </div>

</div>
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
