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

function obtenerEstadisticas() {
  const total = peliculasGlobal.length;

  const conteoPorCat = {};
  categoriasGlobal.forEach((cat) => (conteoPorCat[cat.id] = 0));

  peliculasGlobal.forEach((peli) => {
    if (conteoPorCat[peli.idCategoria] !== undefined) {
      conteoPorCat[peli.idCategoria]++;
    }
  });

  let aptas12 = 0;
  let resto = 0;

  peliculasGlobal.forEach((peli) => {
    const cat = categoriasGlobal.find((c) => c.id == peli.idCategoria);
    if (!cat) return;

    if (cat.edad_requerida > 12) {
      aptas12++;
    } else {
      resto++;
    }
  });

  return {
    total,
    categorias: categoriasGlobal.map((cat) => ({
      ...cat,
      cantidad: conteoPorCat[cat.id],
    })),
    aptas12,
    resto,
    porcentaje12: total ? aptas12 / total : 0,
    porcentajeResto: total ? resto / total : 0,
  };
}

function renderEstadisticas(data) {
  const container = document.querySelector("#listaPorCategoria");
  container.innerHTML = "";

  // ----- TOTAL -----
  const totalCard = document.createElement("ion-card");
  totalCard.innerHTML = `
    <ion-card-content class="total-card">
      <div class="total-label">TOTAL PELÍCULAS</div>
      <div class="total-number">${data.total}</div>
    </ion-card-content>
  `;
  container.appendChild(totalCard);

  // ----- CATEGORÍAS -----
  const catCard = document.createElement("ion-card");
  catCard.innerHTML = `
    <ion-card-header>
      <ion-card-title>Categorías</ion-card-title>
    </ion-card-header>
  `;

  const list = document.createElement("ion-list");

  data.categorias.forEach((cat) => {
    const item = document.createElement("ion-item");
    item.innerHTML = `
      <ion-label>
        <h2>${cat.emoji} ${cat.nombre}</h2>
      </ion-label>
      <ion-badge color="primary">${cat.cantidad}</ion-badge>
    `;
    list.appendChild(item);
  });

  catCard.appendChild(list);
  container.appendChild(catCard);

  // ----- CLASIFICACIÓN -----
  const clasCard = document.createElement("ion-card");
  clasCard.innerHTML = `
  <ion-card-header>
    <ion-card-title>Clasificación</ion-card-title>
  </ion-card-header>
  <ion-card-content>

    <div class="age-row">
      <span>+12</span>
      <span>${(data.porcentaje12 * 100).toFixed(1)}%</span>
    </div>
    <ion-progress-bar value="${data.porcentaje12}" color="primary"></ion-progress-bar>

    <div class="age-row ion-margin-top">
      <span>Resto</span>
      <span>${(data.porcentajeResto * 100).toFixed(1)}%</span>
    </div>
    <ion-progress-bar value="${data.porcentajeResto}" color="secondary"></ion-progress-bar>

  </ion-card-content>
`;

  container.appendChild(clasCard);
}

function calcularEstadisticas() {
  const data = obtenerEstadisticas();
  renderEstadisticas(data);
}
