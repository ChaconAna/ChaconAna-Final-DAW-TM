'use strict';

// Endpoint o dirección URL base de la API
var urlBaseApi = 'https://futbolle-daw-uai-2026.onrender.com/api/players';


//Realiza una petición GET al servidor para obtener un jugador secreto aleatorio.
function obtenerJugadorAleatorio(callbackExito, callbackError) {
    fetch(urlBaseApi + '/random')
        .then(procesarRespuesta)
        .then(callbackExito)
        .catch(callbackError);
}

//Consulta al servidor por una lista de jugadores que coincidan con la búsqueda ingresada.
function buscarJugadores(texto, callbackExito, callbackError) {
    fetch(urlBaseApi + '/search?q=' + encodeURIComponent(texto) + '&limit=8')
        .then(procesarRespuesta)
        .then(callbackExito)
        .catch(callbackError);
}

//Función auxiliar que valida el estado de la respuesta HTTP devuelta por Fetch.
function procesarRespuesta(respuesta) {
    if (!respuesta.ok) {
        throw new Error('Error al consultar el servidor');
    }
    return respuesta.json();
}