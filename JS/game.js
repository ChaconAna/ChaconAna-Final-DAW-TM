'use strict';

// Variables globales
var secretPlayer = null;
var attemptsLeft = 8;
var guessedPlayerIds = [];
var selectedPlayerToSubmit = null;
var timerInterval = null;
var timerSeconds = 0;
var isTimerRunning = false;
var playerHumanName = '';
var selectedDifficulty = 'easy';

// Elementos del DOM
var nameInput = document.getElementById('player-name-input');
var difficultySelect = document.getElementById('difficulty-select');
var btnStartGame = document.getElementById('btn-start-game');
var gameBoardSection = document.getElementById('game-board');
var playerInputContainer = document.querySelector('.player-input-container');
var attemptsLeftElement = document.getElementById('attempts-left');
var gameTimerElement = document.getElementById('game-timer');
var btnRestart = document.getElementById('btn-restart');
var btnShowHistory = document.getElementById('btn-show-history');
var searchInput = document.getElementById('search-input');
var autocompleteList = document.getElementById('autocomplete-list');
var attemptsContainer = document.getElementById('attempts-container');

var clueContainer = document.getElementById('clue-container');
var photoClueWrapper = document.getElementById('photo-clue-wrapper');
var secretPlayerPhoto = document.getElementById('secret-player-photo');
var textClueWrapper = document.getElementById('text-clue-wrapper');
var textClueContent = document.getElementById('text-clue-content');

var modalContainer = document.getElementById('modal-container');
var modalTitle = document.getElementById('modal-title');
var modalMessage = document.getElementById('modal-message');
var btnCloseModal = document.getElementById('btn-close-modal');

var historyModalContainer = document.getElementById('history-modal-container');
var btnCloseHistoryModal = document.getElementById('btn-close-history-modal');
var sortSelect = document.getElementById('sort-select');
var historyTableBody = document.getElementById('history-table-body');
var btnToggleTheme = document.getElementById('btn-toggle-theme');

// Declaración de Funciones
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

function calculateScore(isWin, attemptsUsed, timeInSeconds, difficulty) {
  var basePoints;
  var timeBonus;
  var finalScore;

  if (!isWin) {
    return 0;
  }

  if (difficulty === 'easy') {
    basePoints = 60;
  } else if (difficulty === 'medium') {
    basePoints = 80;
  } else {
    basePoints = 100;
  }

  if (timeInSeconds < 60) {
    timeBonus = 20;
  } else if (timeInSeconds < 120) {
    timeBonus = 10;
  } else {
    timeBonus = 0;
  }

  finalScore = basePoints - ((attemptsUsed - 1) * 10) + timeBonus;

  if (finalScore < 10) {
    finalScore = 10;
  }

  return finalScore;
}

function saveGameToHistory(isWin, attemptsUsed, timeInSeconds, score) {
  var history;
  var newRecord;
  var now;

  history = JSON.parse(localStorage.getItem('futbolle_history') || '[]');
  now = new Date();

  newRecord = {
    playerHuman: playerHumanName,
    secretPlayerName: secretPlayer.name,
    result: isWin ? 'Ganó' : 'Perdió',
    attempts: attemptsUsed,
    score: score,
    duration: gameTimerElement.textContent,
    date: now.toLocaleString()
  };

  history.push(newRecord);
  localStorage.setItem('futbolle_history', JSON.stringify(history));
}

function updateCluesUI() {
  var blurClasses;
  var attemptsUsed;

  attemptsUsed = 8 - attemptsLeft;

  if (selectedDifficulty === 'easy') {
    clueContainer.classList.remove('hidden');
    photoClueWrapper.classList.remove('hidden');
    textClueWrapper.classList.add('hidden');

    secretPlayerPhoto.src = secretPlayer.photo;
    blurClasses = ['blur-max', 'blur-high', 'blur-high', 'blur-mid', 'blur-mid', 'blur-low', 'blur-low', 'blur-none'];
    secretPlayerPhoto.className = 'secret-photo ' + (blurClasses[attemptsUsed] || 'blur-none');
  } else if (selectedDifficulty === 'medium') {
    clueContainer.classList.remove('hidden');
    photoClueWrapper.classList.add('hidden');
    textClueWrapper.classList.remove('hidden');

    if (attemptsUsed >= 4) {
      textClueContent.textContent = 'Edad: ' + secretPlayer.age + ' | Altura: ' + secretPlayer.heightCm + 'cm | Overall: ' + secretPlayer.overall;
    } else if (attemptsUsed >= 2) {
      textClueContent.textContent = 'Edad: ' + secretPlayer.age + ' | Altura: ' + secretPlayer.heightCm + 'cm';
    } else {
      textClueContent.textContent = 'Se irán revelando atributos a medida que agotes intentos...';
    }
  } else {
    clueContainer.classList.add('hidden');
  }
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
  searchInput.disabled = false;
  attemptsContainer.innerHTML = '';
  autocompleteList.innerHTML = '';
  autocompleteList.classList.add('hidden');

  getRandomPlayer(
    function (player) {
      secretPlayer = player;
      updateCluesUI();
    },
    function (errorMessage) {
      showModal('Error de Red', errorMessage);
    }
  );
}

function handleStartGame() {
  playerHumanName = nameInput.value.trim();
  selectedDifficulty = difficultySelect.value;

  if (playerHumanName.length < 3) {
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
  var attemptsUsed;
  var score;

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

  updateCluesUI();

  row = document.createElement('div');
  row.className = 'attempt-row';

  row.appendChild(createCell(selectedPlayerToSubmit.name, selectedPlayerToSubmit.id === secretPlayer.id, 'exact', selectedPlayerToSubmit.id, secretPlayer.id));
  row.appendChild(createCell(selectedPlayerToSubmit.nationality, selectedPlayerToSubmit.nationality === secretPlayer.nationality, 'exact', selectedPlayerToSubmit.nationality, secretPlayer.nationality));
  row.appendChild(createCell(selectedPlayerToSubmit.club, selectedPlayerToSubmit.club === secretPlayer.club, 'exact', selectedPlayerToSubmit.club, secretPlayer.club));
  row.appendChild(createCell(selectedPlayerToSubmit.position, selectedPlayerToSubmit.position === secretPlayer.position, 'exact', selectedPlayerToSubmit.position, secretPlayer.position));
  row.appendChild(createCell(selectedPlayerToSubmit.age + ' años', selectedPlayerToSubmit.age === secretPlayer.age, 'numeric', selectedPlayerToSubmit.age, secretPlayer.age));
  row.appendChild(createCell(selectedPlayerToSubmit.overall.toString(), selectedPlayerToSubmit.overall === secretPlayer.overall, 'numeric', selectedPlayerToSubmit.overall, secretPlayer.overall));
  row.appendChild(createCell(selectedPlayerToSubmit.heightCm + ' cm', selectedPlayerToSubmit.heightCm === secretPlayer.heightCm, 'numeric', selectedPlayerToSubmit.heightCm, secretPlayer.heightCm));

  attemptsContainer.insertBefore(row, attemptsContainer.firstChild);

  attemptsUsed = 8 - attemptsLeft;

  if (selectedPlayerToSubmit.id === secretPlayer.id) {
    stopTimer();
    score = calculateScore(true, attemptsUsed, timerSeconds, selectedDifficulty);
    saveGameToHistory(true, attemptsUsed, timerSeconds, score);
    showModal('¡Ganaste!', '¡Felicidades ' + playerHumanName + '! Has adivinado a ' + secretPlayer.name + ' en ' + attemptsUsed + ' intento(s). Puntaje: ' + score);
    searchInput.disabled = true;
  } else if (attemptsLeft <= 0) {
    stopTimer();
    score = calculateScore(false, 8, timerSeconds, selectedDifficulty);
    saveGameToHistory(false, 8, timerSeconds, score);
    showModal('¡Game Over!', 'Agotaste tus 8 intentos. El jugador era: ' + secretPlayer.name);
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

function renderHistoryTable() {
  var history;
  var sortBy;

  history = JSON.parse(localStorage.getItem('futbolle_history') || '[]');
  sortBy = sortSelect.value;

  if (sortBy === 'attempts') {
    history.sort(function (a, b) {
      return a.attempts - b.attempts;
    });
  } else {
    history.reverse();
  }

  historyTableBody.innerHTML = '';

  if (history.length === 0) {
    historyTableBody.innerHTML = '<tr><td colspan="6">No hay partidas registradas aun.</td></tr>';
    return;
  }

  history.forEach(function (item) {
    var tr;
    tr = document.createElement('tr');
    tr.innerHTML = '<td>' + item.playerHuman + ' (' + item.secretPlayerName + ')</td>' +
                   '<td>' + item.result + '</td>' +
                   '<td>' + item.attempts + '</td>' +
                   '<td>' + item.score + '</td>' +
                   '<td>' + item.duration + '</td>' +
                   '<td>' + item.date + '</td>';
    historyTableBody.appendChild(tr);
  });
}

function showHistoryModal() {
  renderHistoryTable();
  historyModalContainer.classList.remove('hidden');
}

function hideHistoryModal() {
  historyModalContainer.classList.add('hidden');
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  if (document.body.classList.contains('light-mode')) {
    btnToggleTheme.textContent = 'Modo Oscuro';
  } else {
    btnToggleTheme.textContent = 'Modo Claro';
  }
}

// Eventos
btnStartGame.addEventListener('click', handleStartGame);
btnRestart.addEventListener('click', resetGame);
btnCloseModal.addEventListener('click', hideModal);
searchInput.addEventListener('input', handleSearchInput);
btnShowHistory.addEventListener('click', showHistoryModal);
btnCloseHistoryModal.addEventListener('click', hideHistoryModal);
sortSelect.addEventListener('change', renderHistoryTable);
btnToggleTheme.addEventListener('click', toggleTheme);