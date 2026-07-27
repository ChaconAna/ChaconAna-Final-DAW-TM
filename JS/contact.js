'use strict';

// Variables globales
var contactForm = document.getElementById('contact-form');
var contactNameInput = document.getElementById('contact-name');
var contactEmailInput = document.getElementById('contact-email');
var contactMessageInput = document.getElementById('contact-message');

var modalContainer = document.getElementById('modal-container');
var modalTitle = document.getElementById('modal-title');
var modalMessage = document.getElementById('modal-message');
var btnCloseModal = document.getElementById('btn-close-modal');

// Funciones
function showModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalContainer.classList.remove('hidden');
}

function hideModal() {
  modalContainer.classList.add('hidden');
}

function isAlphanumeric(text) {
  var regex;
  regex = /^[a-zA-Z0-9]+$/;
  return regex.test(text);
}

function isValidEmail(email) {
  var regex;
  regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function handleFormSubmit(event) {
  var nameValue;
  var emailValue;
  var messageValue;
  var mailtoUrl;

  event.preventDefault();

  nameValue = contactNameInput.value.trim();
  emailValue = contactEmailInput.value.trim();
  messageValue = contactMessageInput.value.trim();

  if (!nameValue || !isAlphanumeric(nameValue)) {
    showModal('Error de Validación', 'El nombre debe ser alfanumérico (solo letras y números, sin espacios ni caracteres especiales).');
    return;
  }

  if (!emailValue || !isValidEmail(emailValue)) {
    showModal('Error de Validación', 'Por favor ingresa un correo electrónico válido.');
    return;
  }

  if (!messageValue || messageValue.length <= 5) {
    showModal('Error de Validación', 'El mensaje debe tener más de 5 caracteres.');
    return;
  }

  // Si todas las validaciones pasan, se abre el cliente predeterminado de correos
  mailtoUrl = 'mailto:Tomas.ariaskarle@uai.edu.ar?subject=Consulta Futbolle de ' + encodeURIComponent(nameValue) + '&body=' + encodeURIComponent('De: ' + emailValue + '\n\nMensaje:\n' + messageValue);

  window.location.href = mailtoUrl;

  showModal('Éxito', 'Se abrirá tu aplicación de correo para enviar el mensaje.');
  contactForm.reset();
}

// Asignación de Eventos
contactForm.addEventListener('submit', handleFormSubmit);
btnCloseModal.addEventListener('click', hideModal);