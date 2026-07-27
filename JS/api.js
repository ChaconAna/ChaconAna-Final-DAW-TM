'use strict';

// Imagen de silueta futbolística en PNG real (evita que el Blur desvanezca la foto)
var defaultAvatar = 'https://i.imgur.com/2X8s19G.png';

var localPlayersFallback = [
  { 
    id: 1, 
    name: "Lionel Messi", 
    nationality: "Argentina", 
    club: "Inter Miami", 
    position: "Delantero", 
    age: 39, 
    overall: 90, 
    heightCm: 170, 
    photo: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=400&auto=format&fit=crop" 
  },
  { 
    id: 2, 
    name: "Cristiano Ronaldo", 
    nationality: "Portugal", 
    club: "Al Nassr", 
    position: "Delantero", 
    age: 41, 
    overall: 88, 
    heightCm: 187, 
    photo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop" 
  },
  { 
    id: 3, 
    name: "Kylian Mbappé", 
    nationality: "Francia", 
    club: "Real Madrid", 
    position: "Delantero", 
    age: 27, 
    overall: 91, 
    heightCm: 178, 
    photo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&auto=format&fit=crop" 
  },
  { 
    id: 4, 
    name: "Kevin De Bruyne", 
    nationality: "Bélgica", 
    club: "Manchester City", 
    position: "Mediocampista", 
    age: 35, 
    overall: 89, 
    heightCm: 181, 
    photo: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=400&auto=format&fit=crop" 
  },
  { 
    id: 5, 
    name: "Virgil van Dijk", 
    nationality: "Países Bajos", 
    club: "Liverpool", 
    position: "Defensa", 
    age: 35, 
    overall: 87, 
    heightCm: 193, 
    photo: "https://images.unsplash.com/photo-1543351611-7247fe970001?w=400&auto=format&fit=crop" 
  },
  { 
    id: 6, 
    name: "Luka Modrić", 
    nationality: "Croacia", 
    club: "Real Madrid", 
    position: "Mediocampista", 
    age: 40, 
    overall: 86, 
    heightCm: 172, 
    photo: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400&auto=format&fit=crop" 
  },
  { 
    id: 7, 
    name: "Jude Bellingham", 
    nationality: "Inglaterra", 
    club: "Real Madrid", 
    position: "Mediocampista", 
    age: 23, 
    overall: 89, 
    heightCm: 186, 
    photo: "https://images.unsplash.com/photo-1560272564-6694e93e062e?w=400&auto=format&fit=crop" 
  }
];

var playersCache = null;

function fetchAllPlayers(onSuccess, onError) {
  if (playersCache) {
    if (typeof onSuccess === 'function') onSuccess(playersCache);
    return;
  }

  fetch('https://futbolle-daw-uai-2026.onrender.com/players')
    .then(function (res) {
      if (!res.ok) throw new Error('404');
      return res.json();
    })
    .catch(function () {
      return fetch('https://futbolle-daw-uai-2026.onrender.com/api/players')
        .then(function (res) {
          if (!res.ok) throw new Error('404');
          return res.json();
        });
    })
    .then(function (data) {
      var list = Array.isArray(data) ? data : (data.data || []);
      if (list.length > 0) {
        playersCache = list;
        if (typeof onSuccess === 'function') onSuccess(playersCache);
      } else {
        throw new Error('Lista vacía');
      }
    })
    .catch(function () {
      console.log('Modo Offline: Usando base de datos local de jugadores.');
      playersCache = localPlayersFallback;
      if (typeof onSuccess === 'function') onSuccess(playersCache);
    });
}

function getRandomPlayer(onSuccess, onError) {
  fetchAllPlayers(function (list) {
    var randomIdx = Math.floor(Math.random() * list.length);
    if (typeof onSuccess === 'function') onSuccess(list[randomIdx]);
  }, onError);
}

function searchPlayers(query, onSuccess, onError) {
  var cleanQuery = String(query).trim().toLowerCase();

  if (!cleanQuery) {
    if (typeof onSuccess === 'function') onSuccess([]);
    return;
  }

  fetchAllPlayers(function (list) {
    var filtrados = list.filter(function (p) {
      return p.name && p.name.toLowerCase().indexOf(cleanQuery) !== -1;
    });
    if (typeof onSuccess === 'function') onSuccess(filtrados);
  }, onError);
}