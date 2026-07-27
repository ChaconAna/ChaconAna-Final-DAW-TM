'use strict';

// URL base oficial indicada en la consigna/PDF
var urlBaseApi = 'https://futbolle-daw-uai-2026.onrender.com/api/players';

function obtenerJugadorAleatorio(callbackExito, callbackError) {
    fetch(urlBaseApi + '/random')
        .then(procesarRespuesta)
        .then(callbackExito)
        .catch(callbackError);
}

function buscarJugadores(texto, callbackExito, callbackError) {
    fetch(urlBaseApi + '/search?q=' + encodeURIComponent(texto) + '&limit=8')
        .then(procesarRespuesta)
        .then(callbackExito)
        .catch(callbackError);
}

function procesarRespuesta(respuesta) {
    if (!respuesta.ok) {
        throw new Error('Error al consultar el servidor');
    }
    return respuesta.json();
}