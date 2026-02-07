// la API de login no devuelve idPais. el idPais se guarda solo al registrar usuario
// Usuarios antiguos pueden no tener miPais en localStorage

let mapa = null;

class Usuario {
  constructor(usuario, password, idPais) {
    this.usuario = usuario;
    this.password = password;
    this.idPais = idPais;
  }
}

const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const PELICULAS = document.querySelector("#pantalla-peliculas");
const ROUTER = document.querySelector("#ruteo");
const ALTA = document.querySelector("#pantalla-alta");
const ESTADISTICAS = document.querySelector("#pantalla-estadisticas");
const MAPA = document.querySelector("#pantalla-mapa");

inicio();

function inicio() {
  ROUTER.addEventListener("ionRouteDidChange", navegar);

  document.querySelector("#btnRegistrar").addEventListener("click", registrar);
  document.querySelector("#btnLogin").addEventListener("click", login);
  document.querySelector("#btnAlta").addEventListener("click", altaPelicula);
  document
    .querySelector("#btnFiltrar")
    .addEventListener("click", filtrarPeliculas);
  document
    .querySelector("#slcFiltro")
    .addEventListener("ionChange", filtrarPeliculas);

  cargarPaises();
}

function ocultarPantallas() {
  LOGIN.style.display = "none";
  REGISTRO.style.display = "none";
  PELICULAS.style.display = "none";
  ALTA.style.display = "none";
  ESTADISTICAS.style.display = "none";
  MAPA.style.display = "none";
}

function navegar(evt) {
  let destino = evt.detail.to;

  ocultarPantallas();

  if (destino == "/") LOGIN.style.display = "block";
  if (destino == "/registro") REGISTRO.style.display = "block";

  if (destino == "/peliculas") {
    PELICULAS.style.display = "block";
    prepararPantallaPeliculas();
  }
  if (destino == "/alta") {
    let token = localStorage.getItem("token");

    if (!token) {
      alert("Debe iniciar sesión");
      window.location = "#/";
      return;
    }

    ALTA.style.display = "block";
    cargarCategorias();
  }

  if (destino == "/estadisticas") {
    ESTADISTICAS.style.display = "block";
    prepararEstadisticas();
  }

  if (destino == "/mapa") {
    MAPA.style.display = "block";
    cargarMapa();
  }
}

// ================= PAÍSES =================

function cargarPaises() {
  fetch("https://movielist.develotion.com/paises")
    .then((r) => r.json())
    .then((data) => {
      let opciones = "";

      for (let p of data.paises) {
        opciones += `<ion-select-option value="${p.id}">
                     ${p.nombre}
                   </ion-select-option>`;
      }

      document.querySelector("#slcPaises").innerHTML = opciones;
    });
}

// ================= REGISTRO =================

function registrar() {
  let usuario = document.querySelector("#regUsuario").value;
  let password = document.querySelector("#regPass").value;
  let idPais = document.querySelector("#slcPaises").value;

  if (usuario == "" || password == "") {
    alert("Complete todos los datos");
    return;
  }

  let nuevo = new Usuario(usuario, password, idPais);

  fetch("https://movielist.develotion.com/usuarios.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevo),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.codigo == 200) {
        alert("Registro exitoso");
        window.location = "#/";
      } else {
        alert(res.mensaje);
      }
    })
    .catch(() => alert("Error de conexión"));
}

// NAVEGAR ENTRE REGISTRO Y LOGIN

function irRegistro() {
  window.location = "#/registro";
}

function irLogin() {
  window.location = "#/";
}

// ================= LOGIN =================

function login() {
  let usuario = document.querySelector("#txtUsuario").value;
  let password = document.querySelector("#txtPassword").value;

  if (usuario == "" || password == "") {
    alert("Complete usuario y password");
    return;
  }

  let datos = { usuario, password };

  fetch("https://movielist.develotion.com/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  })
    .then(async (response) => {
      const texto = await response.text();

      try {
        return JSON.parse(texto);
      } catch {
        throw new Error("No vino JSON válido");
      }
    })
    .then((res) => {
      if (res.codigo == 200) {
        localStorage.setItem("token", res.token);

        if (res.usuario) {
          localStorage.setItem("usuario", JSON.stringify(res.usuario));
          localStorage.setItem("miPais", res.usuario.idPais);
        }

        window.location = "#/peliculas";
      } else {
        alert(res.mensaje);
      }
    })
    .catch(() => alert("Error de conexión"));
}

// ================= LISTAR PELÍCULAS =================
let peliculasGlobal = [];
let categoriasGlobal = [];

function prepararPantallaPeliculas() {
  let token = localStorage.getItem("token");

  fetch("https://movielist.develotion.com/categorias.php", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((r) => r.json())
    .then((data) => {
      categoriasGlobal = data.categorias;

      return fetch("https://movielist.develotion.com/peliculas.php", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
    })
    .then((r) => r.json())
    .then((data) => {
      peliculasGlobal = data.peliculas || [];
      mostrarPeliculas(peliculasGlobal);
    });
}

function mostrarPeliculas(lista) {
  if (lista.length === 0) {
    document.querySelector("#listaPeliculas").innerHTML =
      "<ion-item><ion-label>No hay películas registradas</ion-label></ion-item>";
    return;
  }

  let html = "";

  for (let peli of lista) {
    let cat = categoriasGlobal.find((c) => c.id == peli.idCategoria);
    let emoji = cat ? cat.emoji : "🎬";
    html += `
      <ion-item>
        <ion-label>
          <h2>${peli.nombre} - ${emoji}</h2>
          <p>${peli.fechaEstreno}</p>
        </ion-label>

        <ion-button color="danger"
          onclick="eliminarPelicula(${peli.id})">
          X
        </ion-button>
      </ion-item>
    `;
  }

  document.querySelector("#listaPeliculas").innerHTML = html;
}

// ================= ELIMINAR =================

function eliminarPelicula(id) {
  if (!confirm("¿Seguro que desea eliminar?")) return;
  let token = localStorage.getItem("token");

  fetch("https://movielist.develotion.com/peliculas/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  })
    .then((r) => {
      // si no hay body, no intentes parsear JSON
      if (r.status === 204) return { codigo: 200 };
      return r
        .text()
        .then((t) => (t ? JSON.parse(t) : { codigo: r.ok ? 200 : r.status }));
    })
    .then((res) => {
      if (res.codigo == 200) {
        alert("Eliminada");
        prepararPantallaPeliculas();
      } else {
        alert(res.mensaje || "No se pudo eliminar");
      }
    })
    .catch(() => alert("Error al eliminar"));
}

// ================= ALTA PELÍCULA =================

function cargarCategorias() {
  let token = localStorage.getItem("token");

  fetch("https://movielist.develotion.com/categorias.php", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((r) => r.json())
    .then((data) => {
      categoriasGlobal = data.categorias;

      let opciones = "";

      for (let c of data.categorias) {
        opciones += `
        <ion-select-option value="${c.id}">
          ${c.nombre} ${c.emoji}
        </ion-select-option>`;
      }

      document.querySelector("#slcCategorias").innerHTML = opciones;
    });
}

function analizarSentimiento(texto) {
  return fetch("https://movielist.develotion.com/genai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: texto,
    }),
  })
    .then((r) => r.json())
    .then((res) => res);
}

function altaPelicula() {
  let idCategoria = document.querySelector("#slcCategorias").value;
  let nombre = document.querySelector("#txtNombrePeli").value;
  let fecha = document.querySelector("#txtFecha").value;
  let comentario = document.querySelector("#txtComentario").value;

  if (!nombre || !fecha || !comentario) {
    alert("Complete todos los datos");
    return;
  }

  let hoy = new Date().toISOString().split("T")[0];
  if (fecha > hoy) {
    alert("La fecha no puede ser futura");
    return;
  }

  analizarSentimiento(comentario).then((res) => {
    let sentimiento = (res.sentiment || "").toLowerCase();

    if (sentimiento === "negativo") {
      const alerta = document.createElement("ion-alert");

      alerta.header = "Comentario negativo";
      alerta.message = "Tu comentario parece muy negativo. ¿Qué querés hacer?";

      alerta.buttons = [
        {
          text: "Reformular ✏️",
          handler: () => {
            document.querySelector("#txtComentario").focus();
          },
        },
        {
          text: "Cancelar ❌",
          role: "cancel",
          handler: () => {
            limpiarAlta();
          },
        },
      ];

      document.body.appendChild(alerta);
      alerta.present();

      return;
    }

    guardarPelicula(idCategoria, nombre, fecha);
  });
}

function guardarPelicula(idCategoria, nombre, fecha) {
  let token = localStorage.getItem("token");

  let datos = {
    idCategoria,
    nombre,
    fecha,
  };

  fetch("https://movielist.develotion.com/peliculas.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(datos),
  })
    .then((r) => r.json())
    .then((res) => {
      if (res.codigo == 200) {
        alert("Película registrada");
        limpiarAlta();
        window.location = "#/peliculas";
      } else {
        alert(res.mensaje);
      }
    });
}

function limpiarAlta() {
  document.querySelector("#slcCategorias").value = "";
  document.querySelector("#txtNombrePeli").value = "";
  document.querySelector("#txtFecha").value = "";
  document.querySelector("#txtComentario").value = "";
}

function filtrarPeliculas() {
  let opcion = document.querySelector("#slcFiltro").value;

  if (opcion === "todas") {
    mostrarPeliculas(peliculasGlobal);
    return;
  }

  let hoy = new Date();

  let filtradas = peliculasGlobal.filter((p) => {
    // ✅ CAMBIO CLAVE
    let fechaPeli = new Date(p.fechaEstreno);

    let diferencia = hoy - fechaPeli;
    let dias = diferencia / (1000 * 60 * 60 * 24);

    if (opcion === "semana") return dias <= 7;
    if (opcion === "mes") return dias <= 30;

    return false;
  });

  mostrarPeliculas(filtradas);
}

function volverPeliculas() {
  window.location = "#/peliculas";
}

function irAlta() {
  window.location = "#/alta";
}

function irEstadisticas() {
  window.location = "#/estadisticas";
}

//=============ESTADISTICAS=================

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

// ================= MAPA =================

function obtenerMiPais() {
  let pais = localStorage.getItem("miPais");

  if (!pais) {
    let usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    if (usuario && usuario.idPais) {
      pais = usuario.idPais;
      localStorage.setItem("miPais", pais);
    }
  }

  return pais;
}

// function cargarMapa() {
//   let token = localStorage.getItem("token");

//   Promise.all([
//     fetch("https://movielist.develotion.com/paises.php").then((r) => r.json()),

//     fetch("https://movielist.develotion.com/usuariosPorPais", {
//       headers: {
//         Authorization: "Bearer " + token,
//       },
//     }).then((r) => r.json()),
//   ])
//     .then(([paisesData, usuariosData]) => {
//       let conteo = {};

//       // Base desde países
//       for (let p of paisesData.paises) {
//         conteo[p.id] = 0;
//       }

//       // Datos reales del endpoint
//       for (let u of usuariosData.paises) {
//         conteo[u.id] = u.cantidadDeUsuarios;
//       }

//       dibujarMapa(paisesData.paises, conteo);
//     })
//     .catch((e) => {
//       console.log("ERROR REAL MAPA:", e);
//       alert("Error al cargar mapa");
//     });
// }

function cargarMapa() {
  let token = localStorage.getItem("token");

  if (!token) {
    alert("Debe iniciar sesión");
    window.location = "#/";
    return;
  }

  fetch("https://movielist.develotion.com/paises.php")
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (paisesData) {
      fetch("https://movielist.develotion.com/usuariosPorPais", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then(function (respuesta2) {
          return respuesta2.json();
        })
        .then(function (usuariosData) {
          let conteo = {};

          for (let i = 0; i < paisesData.paises.length; i++) {
            let pais = paisesData.paises[i];
            conteo[pais.id] = 0;
          }

          for (let j = 0; j < usuariosData.paises.length; j++) {
            let u = usuariosData.paises[j];
            conteo[u.id] = u.cantidadDeUsuarios;
          }

          dibujarMapa(paisesData.paises, conteo);
        })
        .catch(function () {
          alert("Error al obtener usuarios por país");
        });
    })
    .catch(function () {
      alert("Error al obtener países");
    });
}

function dibujarMapa(paises, conteo) {
  if (mapa !== null) {
    mapa.remove();
    mapa = null;
  }

  mapa = L.map("mapa").setView([-30, -60], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapa);

  for (let p of paises) {
    L.marker([p.latitud, p.longitud]).addTo(mapa).bindPopup(`
        <b>${p.nombre}</b><br>
        Usuarios: ${conteo[p.id]}
      `);
  }
}

function irMapa() {
  window.location = "#/mapa";
}

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location = "#/";
}
