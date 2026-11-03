// archivo: src/dashboard/graficos.js (completo, con la nueva sección de clientes agregada)
import { apiFetch } from "../shared/api.js";
import { TIPOS_SERVICIO } from "../config/preguntas.js";
import {
  esSesionDemo,
  obtenerTecnicosDemo,
  obtenerResumenDashboardDemo,
  obtenerRankingTecnicosDemo,
  obtenerFallasComunesDemo,
  obtenerTendenciaDemo,
  obtenerClientesEncuestadosDemo,
} from "../shared/mock-api.js";

const prefiereMovimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let chartFallasInternet = null;
let chartFallasTelevision = null;
let chartTendencia = null;
let refsResumen = null;

function debounce(fn, espera) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}

function calcularEstado(promedio) {
  if (promedio >= 4.6) return { texto: "Excelente", color: "var(--color-acento-2)" };
  if (promedio >= 4.0) return { texto: "Bueno", color: "var(--color-marca)" };
  if (promedio >= 3.0) return { texto: "Regular", color: "var(--color-texto-secundario)" };
  return { texto: "Crítico", color: "var(--color-error)" };
}

function animarNumero(elemento, valorFinal, { decimales = 0, sufijo = "" } = {}) {
  const valorInicial = Number(elemento.dataset.valorActual || 0);

  if (prefiereMovimientoReducido) {
    elemento.textContent = valorFinal.toFixed(decimales) + sufijo;
    elemento.dataset.valorActual = valorFinal;
    return;
  }

  const duracion = 650;
  const inicio = performance.now();

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const facilitado = 1 - Math.pow(1 - progreso, 3);
    const valorActual = valorInicial + (valorFinal - valorInicial) * facilitado;
    elemento.textContent = valorActual.toFixed(decimales) + sufijo;
    if (progreso < 1) requestAnimationFrame(paso);
    else elemento.dataset.valorActual = valorFinal;
  }

  requestAnimationFrame(paso);
}

function crearTarjetasResumen() {
  const contenedor = document.getElementById("resumen-general");
  contenedor.innerHTML = "";

  function crearTarjeta(titulo) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "rounded-2xl border p-5";
    tarjeta.style.background = "var(--color-superficie)";
    tarjeta.style.borderColor = "var(--color-borde)";

    const tituloEl = document.createElement("p");
    tituloEl.className = "dato-tecnico mb-2";
    tituloEl.textContent = titulo;

    const valorEl = document.createElement("p");
    valorEl.style.fontFamily = "var(--font-display)";
    valorEl.style.fontWeight = "700";
    valorEl.style.fontSize = "2rem";
    valorEl.style.color = "var(--color-texto)";
    valorEl.textContent = "0";

    const detalleEl = document.createElement("p");
    detalleEl.className = "text-sm mt-1";
    detalleEl.style.color = "var(--color-texto-secundario)";

    tarjeta.append(tituloEl, valorEl, detalleEl);
    contenedor.appendChild(tarjeta);
    return { valorEl, detalleEl };
  }

  return {
    total: crearTarjeta("Encuestas respondidas"),
    promedio: crearTarjeta("Promedio general"),
    recomendacion: crearTarjeta("Recomendarían el servicio"),
  };
}

function actualizarResumen(resumen) {
  animarNumero(refsResumen.total.valorEl, resumen.totalEncuestas, { decimales: 0 });

  const estado = calcularEstado(resumen.promedioGeneral);
  animarNumero(refsResumen.promedio.valorEl, resumen.promedioGeneral, { decimales: 1 });
  refsResumen.promedio.detalleEl.textContent = estado.texto;
  refsResumen.promedio.detalleEl.style.color = estado.color;

  const totalRecomendacion = resumen.recomendacion.si + resumen.recomendacion.no + resumen.recomendacion.talVez;
  const porcentajeSi = totalRecomendacion ? (resumen.recomendacion.si / totalRecomendacion) * 100 : 0;
  animarNumero(refsResumen.recomendacion.valorEl, porcentajeSi, { decimales: 0, sufijo: "%" });
  refsResumen.recomendacion.detalleEl.textContent =
    `Sí: ${resumen.recomendacion.si} · No: ${resumen.recomendacion.no} · Tal vez: ${resumen.recomendacion.talVez}`;
}

function renderRankingTecnicos(tecnicos) {
  const contenedor = document.getElementById("ranking-tecnicos");
  contenedor.innerHTML = "";

  if (tecnicos.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "text-sm py-6 text-center";
    vacio.style.color = "var(--color-texto-secundario)";
    vacio.textContent = "No hay encuestas para los filtros seleccionados.";
    contenedor.appendChild(vacio);
    return;
  }

  const ordenados = [...tecnicos].sort((a, b) => b.promedio - a.promedio);

  ordenados.forEach((tecnico, indice) => {
    const estado = calcularEstado(tecnico.promedio);

    const fila = document.createElement("div");
    fila.className = "flex items-center justify-between py-3";
    fila.style.borderBottom = "1px solid var(--color-borde)";
    if (!prefiereMovimientoReducido) {
      fila.style.animation = `aparecer 0.4s ease ${indice * 0.05}s both`;
    }

    const izquierda = document.createElement("div");
    const nombre = document.createElement("p");
    nombre.style.color = "var(--color-texto)";
    nombre.style.fontWeight = "500";
    nombre.textContent = tecnico.nombre;

    const cantidad = document.createElement("p");
    cantidad.className = "text-sm";
    cantidad.style.color = "var(--color-texto-secundario)";
    cantidad.textContent = `${tecnico.totalEncuestas} encuestas`;

    izquierda.append(nombre, cantidad);

    const derecha = document.createElement("div");
    derecha.className = "text-right";
    derecha.style.color = estado.color;
    derecha.style.fontFamily = "var(--font-display)";
    derecha.style.fontWeight = "700";
    derecha.textContent = tecnico.promedio.toFixed(1);

    const etiquetaEstado = document.createElement("p");
    etiquetaEstado.className = "text-xs";
    etiquetaEstado.style.color = estado.color;
    etiquetaEstado.textContent = estado.texto;
    derecha.appendChild(etiquetaEstado);

    fila.append(izquierda, derecha);
    contenedor.appendChild(fila);
  });
}

function opcionesEjesVerticales() {
  return {
    x: {
      ticks: { color: "#8B93A6", maxRotation: 40, minRotation: 40, autoSkip: false },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { color: "#8B93A6" },
      grid: { color: "#2A3654" },
    },
  };
}

function crearOActualizarBarras(chartExistente, idCanvas, datos, color) {
  if (chartExistente) {
    chartExistente.data.labels = datos.map((d) => d.etiqueta);
    chartExistente.data.datasets[0].data = datos.map((d) => d.cantidad);
    chartExistente.update();
    return chartExistente;
  }

  const ctx = document.getElementById(idCanvas);
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: datos.map((d) => d.etiqueta),
      datasets: [{ data: datos.map((d) => d.cantidad), backgroundColor: color, borderRadius: 6 }],
    },
    options: {
      responsive: true,
      animation: prefiereMovimientoReducido ? false : { duration: 600, easing: "easeOutQuart" },
      plugins: { legend: { display: false } },
      scales: opcionesEjesVerticales(),
    },
  });
}


function crearOActualizarTendencia(chartExistente, datos) {
  if (chartExistente) {
    chartExistente.data.labels = datos.map((d) => d.etiqueta);
    chartExistente.data.datasets[0].data = datos.map((d) => Number(d.promedio.toFixed(2)));
    chartExistente.update();
    return chartExistente;
  }

  const ctx = document.getElementById("chart-tendencia");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: datos.map((d) => d.etiqueta),
      datasets: [
        {
          data: datos.map((d) => Number(d.promedio.toFixed(2))),
          borderColor: "#FFA11F",
          backgroundColor: "rgba(255, 161, 31, 0.15)",
          pointBackgroundColor: "#FFA11F",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      animation: prefiereMovimientoReducido ? false : { duration: 700, easing: "easeOutQuart" },
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#8B93A6" }, grid: { display: false } },
        y: { min: 1, max: 5, ticks: { color: "#8B93A6" }, grid: { color: "#2A3654" } },
      },
    },
  });
}

function renderClientesEncuestados(clientes) {
  const cuerpo = document.getElementById("tabla-clientes-encuestados");
  cuerpo.innerHTML = "";

  if (clientes.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 7;
    celda.className = "text-center py-6 text-sm";
    celda.style.color = "var(--color-texto-secundario)";
    celda.textContent = "No hay clientes para los filtros seleccionados.";
    fila.appendChild(celda);
    cuerpo.appendChild(fila);
  } else {
    clientes.forEach((cliente) => {
      const fila = document.createElement("tr");
      fila.style.borderBottom = "1px solid var(--color-borde)";

      const celdaNombre = document.createElement("td");
      celdaNombre.className = "py-2 pr-4";
      celdaNombre.style.color = "var(--color-texto)";
      celdaNombre.textContent = cliente.nombre;

      const celdaCedula = document.createElement("td");
      celdaCedula.className = "py-2 pr-4 dato-tecnico";
      celdaCedula.textContent = cliente.cedula;

      const celdaContrato = document.createElement("td");
      celdaContrato.className = "py-2 pr-4 dato-tecnico";
      celdaContrato.textContent = cliente.contrato;

      const celdaDireccion = document.createElement("td");
      celdaDireccion.className = "py-2 pr-4";
      celdaDireccion.style.color = "var(--color-texto-secundario)";
      celdaDireccion.textContent = cliente.direccion;

      const celdaServicio = document.createElement("td");
      celdaServicio.className = "py-2 pr-4";
      celdaServicio.style.color = "var(--color-texto-secundario)";
      celdaServicio.textContent = TIPOS_SERVICIO[cliente.tipoServicio] ?? cliente.tipoServicio;

      const celdaTecnico = document.createElement("td");
      celdaTecnico.className = "py-2 pr-4";
      celdaTecnico.style.color = "var(--color-texto-secundario)";
      celdaTecnico.textContent = cliente.tecnico;

      const celdaEstado = document.createElement("td");
      celdaEstado.className = "py-2";
      const esRespondida = cliente.estado === "respondida";
      celdaEstado.style.color = esRespondida ? "var(--color-acento-2)" : "var(--color-texto-secundario)";
      celdaEstado.textContent = esRespondida ? "Respondida" : "Pendiente";

      fila.append(celdaNombre, celdaCedula, celdaContrato, celdaDireccion, celdaServicio, celdaTecnico, celdaEstado);
      cuerpo.appendChild(fila);
    });
  }

  const contador = document.getElementById("contador-clientes");
  contador.textContent = `${clientes.length} cliente${clientes.length === 1 ? "" : "s"}`;
}

function leerFiltros() {
  return {
    desde: document.getElementById("filtro-desde").value || undefined,
    hasta: document.getElementById("filtro-hasta").value || undefined,
    tecnico: document.getElementById("filtro-tecnico").value || undefined,
    tipoServicio: document.getElementById("filtro-servicio").value || undefined,
  };
}

async function poblarSelectTecnicos(demo) {
  const select = document.getElementById("filtro-tecnico");
  const tecnicos = demo ? await obtenerTecnicosDemo() : await apiFetch("/tecnicos");

  select.innerHTML = '<option value="">Todos los técnicos</option>';
  tecnicos.forEach((nombre) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    select.appendChild(option);
  });
}

function poblarSelectServicios() {
  const select = document.getElementById("filtro-servicio");
  select.innerHTML = '<option value="">Todos los servicios</option>';
  Object.entries(TIPOS_SERVICIO).forEach(([clave, nombre]) => {
    const option = document.createElement("option");
    option.value = clave;
    option.textContent = nombre;
    select.appendChild(option);
  });
}

async function cargarYRenderizarTodo(demo) {
  const filtros = leerFiltros();
  const busqueda = document.getElementById("busqueda-cliente").value.trim();
  const estadoEnvio = document.getElementById("filtro-estado-envio").value || undefined;

  const queryBase = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== undefined));
  const query = new URLSearchParams(queryBase);
  const queryClientes = new URLSearchParams({ ...queryBase, ...(busqueda && { busqueda }), ...(estadoEnvio && { estado: estadoEnvio }) });

  const [resumen, tecnicos, fallas, tendencia, clientes] = await Promise.all([
    demo ? obtenerResumenDashboardDemo(filtros) : apiFetch(`/dashboard/resumen?${query}`),
    demo ? obtenerRankingTecnicosDemo(filtros) : apiFetch(`/dashboard/tecnicos?${query}`),
    demo ? obtenerFallasComunesDemo(filtros) : apiFetch(`/dashboard/fallas-comunes?${query}`),
    demo ? obtenerTendenciaDemo(filtros) : apiFetch(`/dashboard/tendencia?${query}`),
    demo
      ? obtenerClientesEncuestadosDemo({ ...filtros, busqueda, estado: estadoEnvio })
      : apiFetch(`/dashboard/clientes?${queryClientes}`),
  ]);

  actualizarResumen(resumen);
  renderRankingTecnicos(tecnicos);
  chartFallasInternet = crearOActualizarBarras(chartFallasInternet, "chart-fallas-internet", fallas.internet, "#FFA11F");
  chartFallasTelevision = crearOActualizarBarras(chartFallasTelevision, "chart-fallas-television", fallas.television, "#29D3C8");
  chartTendencia = crearOActualizarTendencia(chartTendencia, tendencia);
  renderClientesEncuestados(clientes);
}

async function iniciar() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    window.location.href = "./login.html";
  });

  const demo = esSesionDemo();
  refsResumen = crearTarjetasResumen();

  poblarSelectServicios();
  await poblarSelectTecnicos(demo);

  ["filtro-desde", "filtro-hasta", "filtro-tecnico", "filtro-servicio", "filtro-estado-envio"].forEach((id) => {
    document.getElementById(id).addEventListener("change", () => cargarYRenderizarTodo(demo));
  });

  document.getElementById("busqueda-cliente").addEventListener(
    "input",
    debounce(() => cargarYRenderizarTodo(demo), 300)
  );

  document.getElementById("btn-limpiar-filtros").addEventListener("click", () => {
    document.getElementById("filtro-desde").value = "";
    document.getElementById("filtro-hasta").value = "";
    document.getElementById("filtro-tecnico").value = "";
    document.getElementById("filtro-servicio").value = "";
    document.getElementById("busqueda-cliente").value = "";
    document.getElementById("filtro-estado-envio").value = "";
    cargarYRenderizarTodo(demo);
  });

  await cargarYRenderizarTodo(demo);
}

iniciar();