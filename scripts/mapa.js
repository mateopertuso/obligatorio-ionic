let mapa = null;

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
