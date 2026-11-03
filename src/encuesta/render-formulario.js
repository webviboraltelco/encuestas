// archivo: src/encuesta/render-formulario.js
import { PREGUNTAS_POR_SERVICIO, PREGUNTA_RECOMENDACION, ESCALA_SATISFACCION } from "../config/preguntas.js";
import { apiFetch } from "../shared/api.js";
import { enviarRespuestas } from "./enviar-respuestas.js";
import { esTokenDemo, obtenerEncuestaDemo } from "../shared/mock-api.js";

let preguntas = [];
let respuestas = {}; 
let paginaActual = 1; 
let mitad = 0; 
let token = null;

function obtenerTokenDeUrl() {
  return new URLSearchParams(window.location.search).get("token");
}

function construirListaPreguntas(tipoServicio) {
  const preguntasBase = PREGUNTAS_POR_SERVICIO[tipoServicio];
  if (!preguntasBase) {
    throw new Error(`Tipo de servicio desconocido: ${tipoServicio}`);
  }
  return [...preguntasBase, PREGUNTA_RECOMENDACION];
}

function preguntasDePagina(pagina) {
  return pagina === 1 ? preguntas.slice(0, mitad) : preguntas.slice(mitad);
}

function crearOpciones(preguntaId, opciones, valorGuardado) {
  const grupo = document.createElement("div");
  grupo.className = "flex gap-3 flex-wrap";

  opciones.forEach((opcion) => {
    const label = document.createElement("label");
    label.className = "opcion-boton";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `pregunta-${preguntaId}`;
    input.value = opcion;
    input.required = true;
    input.className = "sr-only";
    if (valorGuardado === opcion) input.checked = true;

    label.append(input, document.createTextNode(opcion));
    grupo.appendChild(label);
  });

  return grupo;
}

function actualizarBarras(grupo, valorSeleccionado) {
  grupo.querySelectorAll(".barra-senal").forEach((label, indice) => {
    const valorDeEstaBarra = indice + 1;
    label.classList.toggle("activa", valorDeEstaBarra <= valorSeleccionado);
  });
}

function crearEscala(preguntaId, valorGuardado) {
  const grupo = document.createElement("div");
  grupo.className = "flex items-end gap-2";

  const alturas = { 1: 14, 2: 20, 3: 26, 4: 32, 5: 38 };

  for (let valor = 1; valor <= 5; valor++) {
    const etiqueta = ESCALA_SATISFACCION.find((e) => e.valor === valor).etiqueta;

    const label = document.createElement("label");
    label.className = "barra-senal";
    label.style.height = `${alturas[valor]}px`;
    label.title = etiqueta;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `pregunta-${preguntaId}`;
    input.value = valor;
    input.required = true;
    input.className = "sr-only";
    if (String(valorGuardado) === String(valor)) input.checked = true;

    label.appendChild(input);
    grupo.appendChild(label);

    input.addEventListener("change", () => actualizarBarras(grupo, valor));
  }

  if (valorGuardado) actualizarBarras(grupo, Number(valorGuardado));

  return grupo;
}

function crearTextarea(preguntaId, valorGuardado) {
  const textarea = document.createElement("textarea");
  textarea.name = `pregunta-${preguntaId}`;
  textarea.rows = 3;
  textarea.className = "campo-texto-libre";
  textarea.placeholder = "Escribe aquí (opcional)";
  if (valorGuardado) textarea.value = valorGuardado;
  return textarea;
}

function crearCampoPregunta(pregunta) {
  const contenedor = document.createElement("div");

  const etiqueta = document.createElement("p");
  etiqueta.className = "pregunta-titulo mb-3";
  etiqueta.textContent = pregunta.texto;
  contenedor.appendChild(etiqueta);

  const valorGuardado = respuestas[pregunta.id];

  switch (pregunta.tipo) {
    case "si_no":
      contenedor.appendChild(crearOpciones(pregunta.id, ["Sí", "No"], valorGuardado));
      break;
    case "opcion_multiple":
      contenedor.appendChild(crearOpciones(pregunta.id, pregunta.opciones, valorGuardado));
      break;
    case "escala_1_5":
      contenedor.appendChild(crearEscala(pregunta.id, valorGuardado));
      break;
    case "texto_libre":
      contenedor.appendChild(crearTextarea(pregunta.id, valorGuardado));
      break;
    default:
      throw new Error(`Tipo de pregunta no soportado: ${pregunta.tipo}`);
  }

  return contenedor;
}

function actualizarProgreso(pagina) {
  const porcentaje = (pagina / 2) * 100;
  document.getElementById("barra-progreso").style.width = `${porcentaje}%`;

  const inicio = pagina === 1 ? 1 : mitad + 1;
  const fin = pagina === 1 ? mitad : preguntas.length;
  document.getElementById("texto-progreso").textContent =
    `Página ${pagina} de 2 · Preguntas ${inicio}-${fin} de ${preguntas.length}`;
}

function actualizarBotones(pagina) {
  document.getElementById("btn-atras").style.visibility = pagina === 1 ? "hidden" : "visible";
  document.getElementById("btn-siguiente").textContent =
    pagina === 2 ? "Enviar respuestas ›" : "Siguiente ›";
}

function renderPagina(pagina) {
  const contenedor = document.getElementById("contenedor-pregunta");
  contenedor.innerHTML = "";

  preguntasDePagina(pagina).forEach((pregunta) => {
    contenedor.appendChild(crearCampoPregunta(pregunta));
  });

  actualizarProgreso(pagina);
  actualizarBotones(pagina);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function guardarRespuestasDePagina(pagina) {
  preguntasDePagina(pagina).forEach((pregunta) => {
    const campo = document.querySelector(
      `[name="pregunta-${pregunta.id}"]:checked, textarea[name="pregunta-${pregunta.id}"]`
    );
    if (campo) {
      respuestas[pregunta.id] = campo.value;
    }
  });
}

function irAtras() {
  if (paginaActual === 1) return;
  guardarRespuestasDePagina(paginaActual);
  paginaActual = 1;
  renderPagina(paginaActual);
}

function mostrarMensajeFinal(elemento, mensaje) {
  elemento.textContent = mensaje;
  elemento.classList.remove("hidden");
}

async function manejarSiguienteOEnviar(evento) {
  evento.preventDefault();
  guardarRespuestasDePagina(paginaActual);

  if (paginaActual === 1) {
    paginaActual = 2;
    renderPagina(paginaActual);
    return;
  }

  const btn = document.getElementById("btn-siguiente");
  btn.disabled = true;
  btn.textContent = "Enviando...";

  const respuestasFinales = preguntas.map((pregunta) => ({
    pregunta_id: pregunta.id,
    valor: respuestas[pregunta.id] ?? null,
  }));

  try {
    await enviarRespuestas(token, respuestasFinales);
    evento.currentTarget.classList.add("hidden");
    mostrarMensajeFinal(
      document.getElementById("estado-final"),
      "¡Gracias por tu respuesta! Tu opinión nos ayuda a mejorar."
    );
  } catch (error) {
    btn.disabled = false;
    btn.textContent = "Enviar respuestas ›";
    alert("No pudimos enviar tus respuestas. Intenta de nuevo.");
  }
}

async function iniciar() {
  const estadoCarga = document.getElementById("estado-carga");
  const form = document.getElementById("form-encuesta");
  const estadoFinal = document.getElementById("estado-final");
  token = obtenerTokenDeUrl();

  if (!token) {
    estadoCarga.textContent = "Este enlace no es válido. Verifica que copiaste la URL completa.";
    estadoCarga.classList.add("texto-error");
    return;
  }

  let encuesta;
  try {
    encuesta = esTokenDemo(token)
      ? await obtenerEncuestaDemo(token)
      : await apiFetch(`/encuestas/${token}`);
  } catch (error) {
    estadoCarga.textContent = "No pudimos cargar la encuesta. El enlace pudo haber expirado.";
    estadoCarga.classList.add("texto-error");
    return;
  }

  estadoCarga.classList.add("hidden");

  if (encuesta.respondida) {
    mostrarMensajeFinal(estadoFinal, "Esta encuesta ya fue respondida. ¡Gracias!");
    return;
  }

  preguntas = construirListaPreguntas(encuesta.tipo_servicio);
  mitad = Math.ceil(preguntas.length / 2);

  form.classList.remove("hidden");
  renderPagina(1);

  document.getElementById("btn-atras").addEventListener("click", irAtras);
  form.addEventListener("submit", manejarSiguienteOEnviar);
}

iniciar();