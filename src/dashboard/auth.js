
import { apiFetch } from "../shared/api.js";
import { esLoginDemo, iniciarSesionDemo } from "../shared/mock-api.js";

function mostrarError(elemento, mensaje) {
  elemento.textContent = mensaje;
  elemento.classList.remove("hidden");
}

async function manejarEnvio(evento) {
  evento.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error-login");
  const btn = document.getElementById("btn-ingresar");

  errorEl.classList.add("hidden");
  btn.disabled = true;
  btn.textContent = "Ingresando...";

  try {
    const resultado = esLoginDemo(usuario)
      ? await iniciarSesionDemo(usuario, password)
      : await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ usuario, password }),
        });

    localStorage.setItem("token", resultado.token);
    if (resultado.rol) localStorage.setItem("rol", resultado.rol);

    window.location.href = "./dashboard.html";
  } catch (error) {
    btn.disabled = false;
    btn.textContent = "Ingresar";
    mostrarError(errorEl, "Usuario o contraseña incorrectos.");
  }
}

document.getElementById("form-login").addEventListener("submit", manejarEnvio);