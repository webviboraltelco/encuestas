// archivo: src/encuesta/enviar-respuestas.js
import { apiFetch } from "../shared/api.js";
import { esTokenDemo, enviarRespuestasDemo } from "../shared/mock-api.js";

export function enviarRespuestas(token, respuestas) {
  if (esTokenDemo(token)) {
    return enviarRespuestasDemo(token, respuestas);
  }
  return apiFetch(`/encuestas/${token}/respuestas`, {
    method: "POST",
    body: JSON.stringify({ respuestas }),
  });
}