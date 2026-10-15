// Funciones para manejar localStorage
const guardarEnStorage = (clave, valor) => {
    localStorage.setItem(clave, JSON.stringify(valor));
};

const obtenerDeStorage = (clave) => {
    return JSON.parse(localStorage.getItem(clave)) || [];
};

const limpiarStorage = (clave) => {
    localStorage.removeItem(clave);
};