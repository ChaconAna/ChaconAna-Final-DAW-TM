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
var searchDebounceTimeout = null;

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

function showModal(title, message) {
  if (modalTitle && modalMessage && modalContainer) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalContainer.classList.remove('hidden');
  }
}

function hideModal() {
  if (modalContainer) {
    modalContainer.classList.add('hidden');
  }
}

function startTimer() {
  stopTimer();
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

    if (gameTimerElement) {
      gameTimerElement.textContent = formattedMinutes + ':' + formattedSeconds;
    }
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
  var basePoints = difficulty === 'easy' ? 60 : (difficulty === 'medium' ? 80 : 100);
  var timeBonus = timeInSeconds < 60 ? 20 : (timeInSeconds < 120 ? 10 : 0);
  var finalScore = basePoints - ((attemptsUsed - 1) * 10) + timeBonus;

  return finalScore < 10 ? 10 : finalScore;
}

function saveGameToHistory(isWin, attemptsUsed, timeInSeconds, score) {
  var history = JSON.parse(localStorage.getItem('futbolle_history') || '[]');
  var now = new Date();

  var newRecord = {
    playerHuman: playerHumanName,
    secretPlayerName: secretPlayer ? secretPlayer.name : 'Desconocido',
    result: isWin ? 'Ganó' : 'Perdió',
    attempts: attemptsUsed,
    score: score,
    duration: gameTimerElement ? gameTimerElement.textContent : '00:00',
    date: now.toLocaleString()
  };

  history.push(newRecord);
  localStorage.setItem('futbolle_history', JSON.stringify(history));
}

function updateCluesUI() {
  var blurClasses;
  var attemptsUsed;
  var photoUrl;

  if (!secretPlayer) return;

  attemptsUsed = 8 - attemptsLeft;

  if (selectedDifficulty === 'easy') {
    if (clueContainer) clueContainer.classList.remove('hidden');
    if (photoClueWrapper) photoClueWrapper.classList.remove('hidden');
    if (textClueWrapper) textClueWrapper.classList.add('hidden');

    if (secretPlayerPhoto) {
      // Búsqueda inteligente de la URL de la imagen independientemente del nombre del atributo
      photoUrl = secretPlayer.photo || secretPlayer.photo_url || secretPlayer.image || secretPlayer.img_url || secretPlayer.avatar;

      if (photoUrl && photoUrl.startsWith('//')) {
        photoUrl = 'https:' + photoUrl;
      }

      // Si falla la imagen por error de red o link roto, muestra un avatar con iniciales de respuesto
      secretPlayerPhoto.onerror = function() {
        this.onerror = null;
        this.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(secretPlayer.name) + '&background=1e293b&color=38bdf8&size=128';
      };

      secretPlayerPhoto.src = photoUrl || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(secretPlayer.name) + '&background=1e293b&color=38bdf8&size=128');
      
      blurClasses = ['blur-max', 'blur-high', 'blur-high', 'blur-mid', 'blur-mid', 'blur-low', 'blur-low', 'blur-none'];
      secretPlayerPhoto.className = 'secret-photo ' + (blurClasses[attemptsUsed] || 'blur-none');
    }
  } else if (selectedDifficulty === 'medium') {
    if (clueContainer) clueContainer.classList.remove('hidden');
    if (photoClueWrapper) photoClueWrapper.classList.add('hidden');
    if (textClueWrapper) textClueWrapper.classList.remove('hidden');

    if (textClueContent) {
      if (attemptsUsed >= 4) {
        textClueContent.textContent = 'Edad: ' + secretPlayer.age + ' | Altura: ' + secretPlayer.heightCm + 'cm | Overall: ' + secretPlayer.overall;
      } else if (attemptsUsed >= 2) {
        textClueContent.textContent = 'Edad: ' + secretPlayer.age + ' | Altura: ' + secretPlayer.heightCm + 'cm';
      } else {
        textClueContent.textContent = 'Se irán revelando atributos a medida que agotes intentos...';
      }
    }
  } else {
    if (clueContainer) clueContainer.classList.add('hidden');
  }
}

function resetGame() {
  stopTimer();
  timerSeconds = 0;
  if (gameTimerElement) gameTimerElement.textContent = '00:00';
  attemptsLeft = 8;
  if (attemptsLeftElement) attemptsLeftElement.textContent = attemptsLeft;
  guessedPlayerIds = [];
  selectedPlayerToSubmit = null;
  
  if (searchInput) {
    searchInput.value = '';
    searchInput.disabled = false;
  }
  if (attemptsContainer) attemptsContainer.innerHTML = '';
  if (autocompleteList) {
    autocompleteList.innerHTML = '';
    autocompleteList.classList.add('hidden');
  }

  getRandomPlayer(
    function (player) {
      secretPlayer = player;
      updateCluesUI();
      startTimer();
    },
    function () {
      showModal('Error de Conexión', 'No se pudo cargar el jugador secreto. Reintenta.');
    }
  );
}

function handleStartGame() {
  if (!nameInput) return;

  playerHumanName = nameInput.value.trim();
  if (difficultySelect) {
    selectedDifficulty = difficultySelect.value;
  }

  if (playerHumanName.length < 3) {
    showModal('Atención', 'Por favor ingresa un nombre válido con al menos 3 caracteres.');
    return;
  }

  if (playerInputContainer) playerInputContainer.classList.add('hidden');
  if (gameBoardSection) gameBoardSection.classList.remove('hidden');

  resetGame();
}

function renderAutocompleteResults(players) {
  if (!autocompleteList) return;

  autocompleteList.innerHTML = '';

  if (!players || players.length === 0) {
    autocompleteList.classList.add('hidden');
    return;
  }

  players.forEach(function (player) {
    var li = document.createElement('li');
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
  var cell = document.createElement('div');
  cell.className = 'cell ' + (isMatch ? 'cell-match' : 'cell-mismatch');
  var symbol = '';

  if (comparisonType === 'numeric' && !isMatch) {
    symbol = secretValue > attemptedValue ? ' ↑' : ' ↓';
  }

  cell.textContent = text + symbol;
  return cell;
}

function processAttempt() {
  var row;
  var attemptsUsed;
  var score;

  if (!selectedPlayerToSubmit) return;

  if (!secretPlayer) {
    showModal('Cargando', 'Obteniendo datos del jugador secreto...');
    return;
  }

  if (guessedPlayerIds.indexOf(selectedPlayerToSubmit.id) !== -1) {
    showModal('Intento Duplicado', 'Ya probaste con este jugador.');
    selectedPlayerToSubmit = null;
    if (searchInput) searchInput.value = '';
    return;
  }

  guessedPlayerIds.push(selectedPlayerToSubmit.id);
  attemptsLeft -= 1;
  if (attemptsLeftElement) attemptsLeftElement.textContent = attemptsLeft;

  updateCluesUI();

  row = document.createElement('div');
  row.className = 'attempt-row';

  row.appendChild(createCell(selectedPlayerToSubmit.name, selectedPlayerToSubmit.id === secretPlayer.id, 'exact'));
  row.appendChild(createCell(selectedPlayerToSubmit.nationality, selectedPlayerToSubmit.nationality === secretPlayer.nationality, 'exact'));
  row.appendChild(createCell(selectedPlayerToSubmit.club, selectedPlayerToSubmit.club === secretPlayer.club, 'exact'));
  row.appendChild(createCell(selectedPlayerToSubmit.position, selectedPlayerToSubmit.position === secretPlayer.position, 'exact'));
  row.appendChild(createCell(selectedPlayerToSubmit.age + ' años', selectedPlayerToSubmit.age === secretPlayer.age, 'numeric', selectedPlayerToSubmit.age, secretPlayer.age));
  row.appendChild(createCell(selectedPlayerToSubmit.overall.toString(), selectedPlayerToSubmit.overall === secretPlayer.overall, 'numeric', selectedPlayerToSubmit.overall, secretPlayer.overall));
  row.appendChild(createCell(selectedPlayerToSubmit.heightCm + ' cm', selectedPlayerToSubmit.heightCm === secretPlayer.heightCm, 'numeric', selectedPlayerToSubmit.heightCm, secretPlayer.heightCm));

  if (attemptsContainer) {
    attemptsContainer.insertBefore(row, attemptsContainer.firstChild);
  }

  attemptsUsed = 8 - attemptsLeft;

  if (selectedPlayerToSubmit.id === secretPlayer.id) {
    stopTimer();
    score = calculateScore(true, attemptsUsed, timerSeconds, selectedDifficulty);
    saveGameToHistory(true, attemptsUsed, timerSeconds, score);
    showModal('¡Ganaste!', '¡Felicidades ' + playerHumanName + '! Ganaste en ' + attemptsUsed + ' intento(s). Puntaje: ' + score);
    if (searchInput) searchInput.disabled = true;
  } else if (attemptsLeft <= 0) {
    stopTimer();
    score = calculateScore(false, 8, timerSeconds, selectedDifficulty);
    saveGameToHistory(false, 8, timerSeconds, score);
    showModal('¡Game Over!', 'Agotaste tus intentos. Era: ' + secretPlayer.name);
    if (searchInput) searchInput.disabled = true;
  }

  selectedPlayerToSubmit = null;
  if (searchInput) searchInput.value = '';
}

function handleSearchInput() {
  var query;
  if (!searchInput) return;

  query = searchInput.value;

  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout);

  if (query.trim().length < 2) {
    if (autocompleteList) {
      autocompleteList.innerHTML = '';
      autocompleteList.classList.add('hidden');
    }
    return;
  }

  searchDebounceTimeout = setTimeout(function () {
    searchPlayers(
      query,
      function (results) {
        renderAutocompleteResults(results);
      },
      function () {
        if (autocompleteList) autocompleteList.classList.add('hidden');
      }
    );
  }, 250);
}

function renderHistoryTable() {
  var history;
  var sortBy;

  if (!historyTableBody) return;

  history = JSON.parse(localStorage.getItem('futbolle_history') || '[]');
  sortBy = sortSelect ? sortSelect.value : 'date';

  if (sortBy === 'attempts') {
    history.sort(function (a, b) { return a.attempts - b.attempts; });
  } else {
    history.reverse();
  }

  historyTableBody.innerHTML = '';

  if (history.length === 0) {
    historyTableBody.innerHTML = '<tr><td colspan="6">No hay partidas registradas aun.</td></tr>';
    return;
  }

  history.forEach(function (item) {
    var tr = document.createElement('tr');
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
  if (historyModalContainer) historyModalContainer.classList.remove('hidden');
}

function hideHistoryModal() {
  if (historyModalContainer) historyModalContainer.classList.add('hidden');
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  if (btnToggleTheme) {
    btnToggleTheme.textContent = document.body.classList.contains('light-mode') ? 'Modo Oscuro' : 'Modo Claro';
  }
}

// Listeners
if (btnStartGame) btnStartGame.addEventListener('click', handleStartGame);
if (btnRestart) btnRestart.addEventListener('click', resetGame);
if (btnCloseModal) btnCloseModal.addEventListener('click', hideModal);
if (searchInput) searchInput.addEventListener('input', handleSearchInput);
if (btnShowHistory) btnShowHistory.addEventListener('click', showHistoryModal);
if (btnCloseHistoryModal) btnCloseHistoryModal.addEventListener('click', hideHistoryModal);
if (sortSelect) sortSelect.addEventListener('change', renderHistoryTable);
if (btnToggleTheme) btnToggleTheme.addEventListener('click', toggleTheme);