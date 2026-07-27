'use strict';

function getRandomPlayer(onSuccess, onError) {
  var url = 'https://futbolle-daw-uai-2026.onrender.com/api/players/random';

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Error al obtener el jugador aleatorio de la API.');
      }
      return response.json();
    })
    .then(function (data) {
      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
    })
    .catch(function (error) {
      if (typeof onError === 'function') {
        onError(error.message || 'Ocurrió un fallo en la conexión con el servidor.');
      }
    });
}

function searchPlayers(query, onSuccess, onError) {
  var url;

  if (!query || query.trim().length < 2) {
    if (typeof onSuccess === 'function') {
      onSuccess([]);
    }
    return;
  }

  url = 'https://futbolle-daw-uai-2026.onrender.com/api/players?q=' + encodeURIComponent(query.trim()) + '&limit=8';

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Error al realizar la búsqueda de jugadores.');
      }
      return response.json();
    })
    .then(function (data) {
      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
    })
    .catch(function (error) {
      if (typeof onError === 'function') {
        onError(error.message || 'Ocurrió un fallo en la conexión al buscar jugadores.');
      }
    });
}