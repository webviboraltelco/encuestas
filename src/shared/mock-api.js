
import { TIPOS_SERVICIO } from "../config/preguntas.js";

const respondidosEnEstaSesion = new Set();

export function esTokenDemo(token) {
  return token?.startsWith("demo-");
}

export async function obtenerEncuestaDemo(token) {
  const tipoServicio = token.replace("demo-", "");

  if (!TIPOS_SERVICIO[tipoServicio]) {
    throw new Error(
      `Tipo de servicio de prueba desconocido: "${tipoServicio}". Usa uno de: ${Object.keys(TIPOS_SERVICIO).join(", ")}`
    );
  }

  return {
    cliente: "Cliente de prueba",
    tecnico: "Técnico de prueba",
    tipo_servicio: tipoServicio,
    respondida: respondidosEnEstaSesion.has(token),
  };
}

export async function enviarRespuestasDemo(token, respuestas) {
  console.log("Respuestas simuladas:", { token, respuestas });
  respondidosEnEstaSesion.add(token);
  return { ok: true };
}


const CREDENCIALES_DEMO = {
  gerencia: { password: "demo", rol: "gerencia" },
  jefe: { password: "demo", rol: "jefe_tecnicos" },
};

export function esLoginDemo(usuario) {
  return Object.prototype.hasOwnProperty.call(CREDENCIALES_DEMO, usuario);
}

export async function iniciarSesionDemo(usuario, password) {
  const credencial = CREDENCIALES_DEMO[usuario];
  if (!credencial || credencial.password !== password) {
    throw new Error("Usuario o contraseña incorrectos");
  }
  return { token: `demo-token-${credencial.rol}`, rol: credencial.rol };
}

export function esSesionDemo() {
  return localStorage.getItem("token")?.startsWith("demo-token-");
}


function crearGeneradorAleatorio(semilla) {
  let estado = semilla;
  return function () {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TECNICOS_DEMO = [
  { nombre: "Juan Pérez", promedioBase: 4.7 },
  { nombre: "Carlos Ruiz", promedioBase: 4.5 },
  { nombre: "Andrés Gómez", promedioBase: 3.8 },
  { nombre: "Luis Torres", promedioBase: 3.2 },
  { nombre: "Mateo Ríos", promedioBase: 2.6 },
];

const OPCIONES_FALLA_INTERNET = [
  "Sin conexión total",
  "Conexión intermitente (se va y vuelve)",
  "Lenta pero estable",
  "Buena velocidad pero mala señal WiFi",
];

const OPCIONES_FALLA_TELEVISION = [
  "Sin señal",
  "Imagen con cortes o pixelada",
  "Faltan canales contratados",
  "Se congela o se reinicia solo",
];

const TIPOS_CON_FALLA_INTERNET = ["revision_internet", "revision_radio_enlace"];
const TIPOS_CON_FALLA_TELEVISION = ["revision_television"];

function elegirConPeso(opciones, pesos, aleatorio) {
  const r = aleatorio();
  let acumulado = 0;
  for (let i = 0; i < opciones.length; i++) {
    acumulado += pesos[i];
    if (r <= acumulado) return opciones[i];
  }
  return opciones[opciones.length - 1];
}

function generarEncuestasDemo() {
  const aleatorio = crearGeneradorAleatorio(20261029);
  const tiposServicio = Object.keys(TIPOS_SERVICIO);
  const meses = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
  const registros = [];

  TECNICOS_DEMO.forEach((tecnico) => {
    meses.forEach((mes) => {
      const cantidadEnElMes = 3 + Math.floor(aleatorio() * 4);
      for (let i = 0; i < cantidadEnElMes; i++) {
        const tipoServicio = tiposServicio[Math.floor(aleatorio() * tiposServicio.length)];
        const dia = String(1 + Math.floor(aleatorio() * 27)).padStart(2, "0");
        const ruido = (aleatorio() - 0.5) * 1.6;
        const promedio = Math.min(5, Math.max(1, Math.round((tecnico.promedioBase + ruido) * 2) / 2));

        let recomendacion;
        const r = aleatorio();
        if (promedio >= 4) recomendacion = r < 0.8 ? "si" : r < 0.85 ? "no" : "tal_vez";
        else if (promedio >= 3) recomendacion = r < 0.55 ? "si" : r < 0.75 ? "no" : "tal_vez";
        else recomendacion = r < 0.25 ? "si" : r < 0.75 ? "no" : "tal_vez";

        let fallaInternet = null;
        let fallaTelevision = null;
        if (TIPOS_CON_FALLA_INTERNET.includes(tipoServicio)) {
          fallaInternet = elegirConPeso(OPCIONES_FALLA_INTERNET, [0.2, 0.4, 0.25, 0.15], aleatorio);
        } else if (TIPOS_CON_FALLA_TELEVISION.includes(tipoServicio)) {
          fallaTelevision = elegirConPeso(OPCIONES_FALLA_TELEVISION, [0.25, 0.4, 0.2, 0.15], aleatorio);
        }

        registros.push({
          tecnico: tecnico.nombre,
          tipoServicio,
          fecha: `${mes}-${dia}`,
          promedio,
          recomendacion,
          fallaInternet,
          fallaTelevision,
        });
      }
    });
  });

  return registros;
}

const MOCK_ENCUESTAS = generarEncuestasDemo();

function filtrarRegistros(filtros = {}) {
  return MOCK_ENCUESTAS.filter((r) => {
    if (filtros.tecnico && r.tecnico !== filtros.tecnico) return false;
    if (filtros.tipoServicio && r.tipoServicio !== filtros.tipoServicio) return false;
    if (filtros.desde && r.fecha < filtros.desde) return false;
    if (filtros.hasta && r.fecha > filtros.hasta) return false;
    return true;
  });
}

export async function obtenerTecnicosDemo() {
  return TECNICOS_DEMO.map((t) => t.nombre);
}

export async function obtenerResumenDashboardDemo(filtros) {
  const registros = filtrarRegistros(filtros);
  const totalEncuestas = registros.length;
  const promedioGeneral = totalEncuestas
    ? registros.reduce((suma, r) => suma + r.promedio, 0) / totalEncuestas
    : 0;

  const recomendacion = { si: 0, no: 0, talVez: 0 };
  registros.forEach((r) => {
    if (r.recomendacion === "si") recomendacion.si++;
    else if (r.recomendacion === "no") recomendacion.no++;
    else recomendacion.talVez++;
  });

  return { totalEncuestas, promedioGeneral, recomendacion };
}

export async function obtenerRankingTecnicosDemo(filtros) {
  const registros = filtrarRegistros(filtros);
  const porTecnico = new Map();

  registros.forEach((r) => {
    if (!porTecnico.has(r.tecnico)) porTecnico.set(r.tecnico, []);
    porTecnico.get(r.tecnico).push(r.promedio);
  });

  return Array.from(porTecnico.entries()).map(([nombre, promedios]) => ({
    nombre,
    totalEncuestas: promedios.length,
    promedio: promedios.reduce((a, b) => a + b, 0) / promedios.length,
  }));
}

export async function obtenerFallasComunesDemo(filtros) {
  const registros = filtrarRegistros(filtros);

  function contarPor(campo, opciones) {
    const conteos = Object.fromEntries(opciones.map((o) => [o, 0]));
    registros.forEach((r) => {
      if (r[campo] && conteos[r[campo]] !== undefined) conteos[r[campo]]++;
    });
    return opciones.map((etiqueta) => ({ etiqueta, cantidad: conteos[etiqueta] }));
  }

  return {
    internet: contarPor("fallaInternet", OPCIONES_FALLA_INTERNET),
    television: contarPor("fallaTelevision", OPCIONES_FALLA_TELEVISION),
  };
}

const NOMBRES_MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export async function obtenerTendenciaDemo(filtros) {
  const registros = filtrarRegistros(filtros);
  const porMes = new Map();

  registros.forEach((r) => {
    const mes = r.fecha.slice(0, 7);
    if (!porMes.has(mes)) porMes.set(mes, []);
    porMes.get(mes).push(r.promedio);
  });

  return Array.from(porMes.keys())
    .sort()
    .map((mes) => {
      const promedios = porMes.get(mes);
      const [anio, numMes] = mes.split("-");
      return {
        etiqueta: `${NOMBRES_MES[Number(numMes) - 1]} ${anio}`,
        promedio: promedios.reduce((a, b) => a + b, 0) / promedios.length,
      };
    });
}

function generarEnviosDemo() {
  const aleatorio = crearGeneradorAleatorio(20261030);
  const nombres = ["Mariana", "Santiago", "Valentina", "Camilo", "Isabella", "Nicolás", "Daniela", "Sebastián", "Laura", "Andrés", "Juliana", "Felipe", "Natalia", "Esteban", "Carolina", "Diego", "Manuela", "Simón", "Paula", "Julián"];
  const apellidos = ["Gómez", "Rodríguez", "Hernández", "López", "Martínez", "García", "Ramírez", "Torres", "Flórez", "Ospina", "Vélez", "Zuluaga", "Arango", "Correa", "Giraldo", "Restrepo", "Quintero", "Henao"];
  const viasCalle = ["Calle", "Carrera", "Transversal"];
  const barrios = ["El Progreso", "San José", "La Chamba", "El Rosario", "Alto Bonito", "Centro", "La Inmaculada", "Bellavista", "El Jardín"];
  const tiposServicio = Object.keys(TIPOS_SERVICIO);
  const meses = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];

  const registros = [];
  const cantidadTotal = 70;

  for (let i = 0; i < cantidadTotal; i++) {
    const nombre = `${nombres[Math.floor(aleatorio() * nombres.length)]} ${apellidos[Math.floor(aleatorio() * apellidos.length)]} ${apellidos[Math.floor(aleatorio() * apellidos.length)]}`;
    const cedula = String(10000000 + Math.floor(aleatorio() * 89999999));
    const contrato = `CT-2026-${String(1000 + i).padStart(5, "0")}`;
    const via = viasCalle[Math.floor(aleatorio() * viasCalle.length)];
    const numeroVia = 1 + Math.floor(aleatorio() * 40);
    const numeroCasa = 1 + Math.floor(aleatorio() * 99);
    const complemento = 1 + Math.floor(aleatorio() * 99);
    const barrio = barrios[Math.floor(aleatorio() * barrios.length)];
    const direccion = `${via} ${numeroVia} # ${numeroCasa}-${complemento}, Barrio ${barrio}, El Carmen de Viboral`;
    const tipoServicio = tiposServicio[Math.floor(aleatorio() * tiposServicio.length)];
    const tecnico = TECNICOS_DEMO[Math.floor(aleatorio() * TECNICOS_DEMO.length)].nombre;
    const mes = meses[Math.floor(aleatorio() * meses.length)];
    const dia = String(1 + Math.floor(aleatorio() * 27)).padStart(2, "0");
    const estado = aleatorio() < 0.68 ? "respondida" : "pendiente";

    registros.push({
      nombre,
      cedula,
      contrato,
      direccion,
      tipoServicio,
      tecnico,
      fechaEnvio: `${mes}-${dia}`,
      estado,
    });
  }

  return registros;
}

const ENVIOS_DEMO = generarEnviosDemo();

export async function obtenerClientesEncuestadosDemo(filtros = {}) {
  const busqueda = (filtros.busqueda || "").toLowerCase();

  return ENVIOS_DEMO.filter((r) => {
    if (filtros.tecnico && r.tecnico !== filtros.tecnico) return false;
    if (filtros.tipoServicio && r.tipoServicio !== filtros.tipoServicio) return false;
    if (filtros.desde && r.fechaEnvio < filtros.desde) return false;
    if (filtros.hasta && r.fechaEnvio > filtros.hasta) return false;
    if (filtros.estado && r.estado !== filtros.estado) return false;
    if (busqueda) {
      const coincide =
        r.nombre.toLowerCase().includes(busqueda) ||
        r.cedula.includes(busqueda) ||
        r.contrato.toLowerCase().includes(busqueda);
      if (!coincide) return false;
    }
    return true;
  }).sort((a, b) => (a.fechaEnvio < b.fechaEnvio ? 1 : -1));
}