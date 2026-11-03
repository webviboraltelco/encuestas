export const TIPOS_SERVICIO = {
  instalacion_internet: "Instalación de internet",
  revision_internet: "Revisión de internet (sin servicio, intermitente o lento)",
  instalacion_television: "Instalación de televisión",
  revision_television: "Revisión de televisión (sin servicio o con fallas)",
  revision_radio_enlace: "Revisión de internet por radio enlace",
  traslado_servicios: "Traslado de servicios",
  revision_dominical: "Revisión dominical",
};

export const ESCALA_SATISFACCION = [
  { valor: 5, etiqueta: "Excelente" },
  { valor: 4, etiqueta: "Bueno" },
  { valor: 3, etiqueta: "Aceptable" },
  { valor: 2, etiqueta: "Deficiente" },
  { valor: 1, etiqueta: "Muy deficiente" },
];

export const PREGUNTA_RECOMENDACION = {
  id: 900,
  texto: "¿Recomendaría los servicios de Viboral Telecomunicaciones a un familiar o amigo?",
  tipo: "opcion_multiple",
  opciones: ["Sí", "No", "Tal vez"],
};

export const PREGUNTAS_POR_SERVICIO = {
  instalacion_internet: [
    { id: 101, texto: "¿El técnico se presentó de manera cordial y respetuosa?", tipo: "si_no" },
    { id: 102, texto: "¿La visita fue realizada en el horario acordado?", tipo: "si_no" },
    { id: 103, texto: "¿Le explicaron claramente el proceso de instalación?", tipo: "si_no" },
    { id: 104, texto: "¿La velocidad que le mostraron al probar el servicio le pareció adecuada?", tipo: "si_no" },
    { id: 105, texto: "¿Le indicaron dónde ubicar el router para tener buena señal WiFi en toda la casa/negocio?", tipo: "si_no" },
    { id: 106, texto: "¿Probaron la conexión en más de un dispositivo antes de irse el técnico?", tipo: "si_no" },
    { id: 107, texto: "¿Le explicaron el nombre y contraseña de la red WiFi?", tipo: "si_no" },
    { id: 108, texto: "¿Le explicaron la diferencia entre las redes WiFi de 2.4GHz y 5GHz, y cuál le conviene usar según sus dispositivos?", tipo: "si_no" },
    { id: 109, texto: "¿El cableado quedó ordenado y estéticamente instalado?", tipo: "si_no" },
    { id: 110, texto: "¿El área de trabajo quedó limpia al finalizar?", tipo: "si_no" },
    { id: 111, texto: "¿Las dudas fueron resueltas satisfactoriamente?", tipo: "si_no" },
    { id: 112, texto: "Califique su satisfacción general con la instalación.", tipo: "escala_1_5" },
    { id: 113, texto: "¿Qué aspecto podríamos mejorar?", tipo: "texto_libre" },
  ],

  revision_internet: [
    { id: 201, texto: "¿La atención fue oportuna?", tipo: "si_no" },
    {
      id: 202,
      texto: "¿Cuál describe mejor el problema que tenía?",
      tipo: "opcion_multiple",
      opciones: ["Sin conexión total", "Conexión intermitente (se va y vuelve)", "Lenta pero estable", "Buena velocidad pero mala señal WiFi"],
    },
    { id: 203, texto: "¿El técnico identificó claramente la causa de la falla?", tipo: "si_no" },
    { id: 204, texto: "¿Le explicó el trabajo realizado?", tipo: "si_no" },
    { id: 205, texto: "¿Notó mejoría en videollamadas o juegos en línea después de la visita?", tipo: "si_no" },
    { id: 206, texto: "¿La señal WiFi llega bien a todas las áreas donde la necesita?", tipo: "si_no" },
    { id: 207, texto: "¿El técnico fue amable y respetuoso?", tipo: "si_no" },
    { id: 208, texto: "Califique la solución brindada.", tipo: "escala_1_5" },
    { id: 209, texto: "Califique la atención recibida.", tipo: "escala_1_5" },
    { id: 210, texto: "¿Qué aspecto podríamos mejorar?", tipo: "texto_libre" },
  ],

  instalacion_television: [
    { id: 301, texto: "¿La instalación se realizó en la fecha y hora acordadas?", tipo: "si_no" },
    { id: 302, texto: "¿Los puntos de TV quedaron funcionando correctamente?", tipo: "si_no" },
    { id: 303, texto: "¿El técnico explicó el uso del servicio?", tipo: "si_no" },
    { id: 304, texto: "¿Recibió orientación sobre canales y configuración?", tipo: "si_no" },
    { id: 305, texto: "¿Le indicaron en qué número de canal quedó ubicado su canal favorito?", tipo: "si_no" },
    { id: 306, texto: "¿El cableado quedó organizado?", tipo: "si_no" },
    { id: 307, texto: "¿El técnico fue amable y respetuoso?", tipo: "si_no" },
    { id: 308, texto: "¿Quedó satisfecho con la calidad de imagen y señal?", tipo: "si_no" },
    { id: 309, texto: "Califique la atención recibida.", tipo: "escala_1_5" },
    { id: 310, texto: "Califique el servicio instalado.", tipo: "escala_1_5" },
    { id: 311, texto: "¿Qué aspecto podríamos mejorar?", tipo: "texto_libre" },
  ],

  revision_television: [
    { id: 701, texto: "¿La atención fue oportuna?", tipo: "si_no" },
    {
      id: 702,
      texto: "¿Cuál era el problema?",
      tipo: "opcion_multiple",
      opciones: ["Sin señal", "Imagen con cortes o pixelada", "Faltan canales contratados", "Se congela o se reinicia solo"],
    },
    { id: 703, texto: "¿El técnico identificó claramente la causa de la falla?", tipo: "si_no" },
    { id: 704, texto: "¿Le explicó el trabajo realizado?", tipo: "si_no" },
    { id: 705, texto: "¿La calidad de imagen quedó nítida después de la visita?", tipo: "si_no" },
    { id: 706, texto: "¿El técnico fue amable y respetuoso?", tipo: "si_no" },
    { id: 707, texto: "Califique la solución brindada.", tipo: "escala_1_5" },
    { id: 708, texto: "Califique la atención recibida.", tipo: "escala_1_5" },
    { id: 709, texto: "¿Qué aspecto podríamos mejorar?", tipo: "texto_libre" },
  ],

  revision_radio_enlace: [
    { id: 401, texto: "¿La atención fue oportuna?", tipo: "si_no" },
    { id: 402, texto: "¿El técnico identificó la falla reportada?", tipo: "si_no" },
    { id: 403, texto: "¿Recibió explicación sobre las pruebas realizadas?", tipo: "si_no" },
    { id: 404, texto: "¿El problema quedó solucionado?", tipo: "si_no" },
    { id: 405, texto: "¿Ha notado que el servicio empeora con lluvia, viento fuerte o niebla?", tipo: "si_no" },
    { id: 406, texto: "¿El equipo (antena/radio) quedó orientado de forma que usted pueda ver si se desalinea?", tipo: "si_no" },
    { id: 407, texto: "¿El técnico mostró conocimiento técnico?", tipo: "si_no" },
    { id: 408, texto: "Califique la atención general.", tipo: "escala_1_5" },
    { id: 409, texto: "Califique la solución brindada.", tipo: "escala_1_5" },
    { id: 410, texto: "¿Qué aspecto podríamos mejorar?", tipo: "texto_libre" },
  ],

  traslado_servicios: [
    { id: 501, texto: "¿La reubicación del servicio se realizó según lo acordado?", tipo: "si_no" },
    { id: 502, texto: "¿La velocidad de internet en la nueva ubicación es igual o mejor que en la anterior?", tipo: "si_no" },
    { id: 503, texto: "¿La señal WiFi cubre las mismas áreas que necesitaba en la ubicación anterior?", tipo: "si_no" },
    { id: 504, texto: "¿Recibió información clara sobre el procedimiento?", tipo: "si_no" },
    { id: 505, texto: "¿El técnico fue amable y respetuoso?", tipo: "si_no" },
    { id: 506, texto: "¿La instalación quedó organizada y segura?", tipo: "si_no" },
    { id: 507, texto: "¿Sus dudas fueron resueltas?", tipo: "si_no" },
    { id: 508, texto: "Califique la atención general.", tipo: "escala_1_5" },
    { id: 509, texto: "Califique el servicio prestado.", tipo: "escala_1_5" },
    { id: 510, texto: "¿Qué aspecto podríamos mejorar?", tipo: "texto_libre" },
  ],

  revision_dominical: [
    { id: 601, texto: "¿La atención fue oportuna?", tipo: "si_no" },
    { id: 602, texto: "¿El técnico atendió adecuadamente la novedad reportada?", tipo: "si_no" },
    {
      id: 603,
      texto: "¿Cuál servicio presentaba la novedad atendida?",
      tipo: "opcion_multiple",
      opciones: ["Internet", "Televisión", "Ambos", "Otro"],
    },
    { id: 604, texto: "¿La falla quedó solucionada?", tipo: "si_no" },
    { id: 605, texto: "¿El técnico fue amable y respetuoso?", tipo: "si_no" },
    { id: 606, texto: "Califique la calidad de la solución.", tipo: "escala_1_5" },
    { id: 607, texto: "Califique la atención general.", tipo: "escala_1_5" },
    { id: 608, texto: "¿Qué aspecto podríamos mejorar?", tipo: "texto_libre" },
  ],
};