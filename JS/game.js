'use strict';

// Variables globales
var secretPlayer = null;
var attemptsLeft = 8;
var guessedPlayerIds = [];
var selectedPlayerToSubmit = null;
var timerInterval = null;
var timerSeconds = 0;
var isTimerRunning = false;

// Elementos del DOM
var nameInput = document.getElementById('player-name-input');
var btnStartGame = document.getElementById('btn-start-game');
var gameBoardSection = document.getElementById('game-board');
var playerInputContainer = document.querySelector('.player-input-container');
var attemptsLeftElement = document.getElementById('attempts-left');
var gameTimerElement = document.getElementById('game-timer');
var btnRestart = document.getElementById('btn-restart');
var searchInput = document.getElementById('search-input');
var autocompleteList = document.getElementById('autocomplete-list');
var attemptsContainer = document.getElementById('attempts-container');
var modalContainer = document.getElementById('modal-container');
var modalTitle = document.getElementById('modal-title');
var modalMessage = document.getElementById('modal-message');
var btnCloseModal = document.getElementById('btn-close-modal');

// Declaración de funciones
function showModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalContainer.classList.remove('hidden');
}

function hideModal() {
  modalContainer.classList.add('hidden');
}

function startTimer() {
  if (isTimerRunning) {
    return;
  }
  isTimerRunning = true;
  timerInterval = setInterval(function () {
    var minutes;
    var seconds;
    var formattedMinutes;
    var formattedSeconds;

    timerSeconds += 1;
    minutes = Math.floor(timerSeconds / 60);
    seconds = timerSeconds % 60;

    formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    gameTimerElement.textContent = formattedMinutes + ':' + formattedSeconds;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isTimerRunning = false;
}

function resetGame() {
  stopTimer();
  timerSeconds = 0;
  gameTimerElement.textContent = '00:00';
  attemptsLeft = 8;
  attemptsLeftElement.textContent = attemptsLeft;
  guessedPlayerIds = [];
  selectedPlayerToSubmit = null;
  searchInput.value = '';
  attemptsContainer.innerHTML = '';
  autocompleteList.innerHTML = '';
  autocompleteList.classList.add('hidden');

  getRandomPlayer(
    function (player) {
      secretPlayer = player;
    },
    function (errorMessage) {
      showModal('Error de Red', errorMessage);
    }
  );
}

function handleStartGame() {
  var playerName;
  playerName = nameInput.value.trim();

  if (playerName.length < 3) {
    showModal('Atención', 'Por favor ingresa un nombre válido con al menos 3 caracteres.');
    return;
  }

  playerInputContainer.classList.add('hidden');
  gameBoardSection.classList.remove('hidden');
  resetGame();
}

function renderAutocompleteResults(players) {
  autocompleteList.innerHTML = '';

  if (!players || players.length === 0) {
    autocompleteList.classList.add('hidden');
    return;
  }

  players.forEach(function (player) {
    var li;
    li = document.createElement('li');
    li.textContent = player.name + ' (' + player.club + ')';

    li.addEventListener('click', function () {
      selectedPlayerToSubmit = player;
      searchInput.value = player.name;
      autocompleteList.innerHTML = '';
      autocompleteList.classList.add('hidden');
      processAttempt();
    });

    autocompleteList.appendChild(li);
  });

  autocompleteList.classList.remove('hidden');
}

function createCell(text, isMatch, comparisonType, attemptedValue, secretValue) {
  var cell;
  var symbol;

  cell = document.createElement('div');
  cell.className = 'cell ' + (isMatch ? 'cell-match' : 'cell-mismatch');
  symbol = '';

  if (comparisonType === 'numeric' && !isMatch) {
    if (secretValue > attemptedValue) {
      symbol = ' ↑';
    } else {
      symbol = ' ↓';
    }
  }

  cell.textContent = text + symbol;
  return cell;
}

function processAttempt() {
  var row;
  var isSameName;

  if (!selectedPlayerToSubmit) {
    showModal('Atención', 'Debes seleccionar un jugador de la lista desplegable.');
    return;
  }

  isSameName = guessedPlayerIds.indexOf(selectedPlayerToSubmit.id) !== -1;
  if (isSameName) {
    showModal('Intento Duplicado', 'Ya has intentado con este jugador en esta partida.');
    selectedPlayerToSubmit = null;
    searchInput.value = '';
    return;
  }

  if (!isTimerRunning) {
    startTimer();
  }

  guessedPlayerIds.push(selectedPlayerToSubmit.id);
  attemptsLeft -= 1;
  attemptsLeftElement.textContent = attemptsLeft;

  row = document.createElement('div');
  row.className = 'attempt-row';

  // 1. Nombre
  row.appendChild(createCell(selectedPlayerToSubmit.name, selectedPlayerToSubmit.id === secretPlayer.id, 'exact', selectedPlayerToSubmit.id, secretPlayer.id));
  // 2. Nacionalidad
  row.appendChild(createCell(selectedPlayerToSubmit.nationality, selectedPlayerToSubmit.nationality === secretPlayer.nationality, 'exact', selectedPlayerToSubmit.nationality, secretPlayer.nationality));
  // 3. Club
  row.appendChild(createCell(selectedPlayerToSubmit.club, selectedPlayerToSubmit.club === secretPlayer.club, 'exact', selectedPlayerToSubmit.club, secretPlayer.club));
  // 4. Posición
  row.appendChild(createCell(selectedPlayerToSubmit.position, selectedPlayerToSubmit.position === secretPlayer.position, 'exact', selectedPlayerToSubmit.position, secretPlayer.position));
  // 5. Edad
  row.appendChild(createCell(selectedPlayerToSubmit.age + ' años', selectedPlayerToSubmit.age === secretPlayer.age, 'numeric', selectedPlayerToSubmit.age, secretPlayer.age));
  // 6. Overall
  row.appendChild(createCell(selectedPlayerToSubmit.overall.toString(), selectedPlayerToSubmit.overall === secretPlayer.overall, 'numeric', selectedPlayerToSubmit.overall, secretPlayer.overall));
  // 7. Altura
  row.appendChild(createCell(selectedPlayerToSubmit.heightCm + ' cm', selectedPlayerToSubmit.heightCm === secretPlayer.heightCm, 'numeric', selectedPlayerToSubmit.heightCm, secretPlayer.heightCm));

  attemptsContainer.insertBefore(row, attemptsContainer.firstChild);

  if (selectedPlayerToSubmit.id === secretPlayer.id) {
    stopTimer();
    showModal('¡Ganaste!', '¡Felicidades! Has adivinado al jugador secreto (' + secretPlayer.name + ') en ' + (8 - attemptsLeft) + ' intento(s).');
    searchInput.disabled = true;
  } else if (attemptsLeft <= 0) {
    stopTimer();
    showModal('¡Game Over!', 'Has agotado los 8 intentos. El jugador secreto era: ' + secretPlayer.name);
    searchInput.disabled = true;
  }

  selectedPlayerToSubmit = null;
  searchInput.value = '';
}

function handleSearchInput() {
  var query;
  query = searchInput.value;

  if (query.trim().length < 2) {
    autocompleteList.innerHTML = '';
    autocompleteList.classList.add('hidden');
    return;
  }

  searchPlayers(
    query,
    function (results) {
      renderAutocompleteResults(results);
    },
    function (errorMessage) {
      showModal('Error de Búsqueda', errorMessage);
    }
  );
}

// Asignación de Eventos
btnStartGame.addEventListener('click', handleStartGame);
btnRestart.addEventListener('click', resetGame);
btnCloseModal.addEventListener('click', hideModal);
searchInput.addEventListener('input', handleSearchInput);