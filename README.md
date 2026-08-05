# Futbolle - Juego de Adivinanza de Jugadores

**Futbolle** es una aplicación web interactiva inspirada en los juegos de adivinanza diarios, adaptada al universo del fútbol. El objetivo consiste en descubrir un jugador secreto en un máximo de **8 intentos**, utilizando pistas visuales, comparaciones de atributos y datos obtenidos en tiempo real mediante el consumo de una API.

## Características Principales
- Búsqueda con Autocompletado: Filtrado dinámico de jugadores mientras escribís, aparece después de escribir las primeras 2 letas.
- Niveles de Dificultad:
  - Fácil: Muestra una imagen del jugador con un efecto de desenfoque que disminuye progresivamente después de cada intento incorrecto.
  - Medio: Revelación progresiva de atributos (Edad, Altura, etc).
  - Difícil: No proporciona pistas previas, únicamente muestra el resultado de cada intento mediante la grilla comparativa.
- Feedback Visual Comparativo: Cada intento genera una tabla de comparación que resalta en verde los atributos correctos y en rojo los incorrectos, incorporando flechas (`↑` y `↓`) para indicar si los valores numéricos son mayores o menores que los del jugador objetivo
- Persistencia de Datos (`localStorage`): Guarda el historial de partidas (resultado, puntaje, tiempo e intentos) con opción de ordenamiento por fecha o rendimiento.
- Modo Claro / Oscuro: Permite ALTERNAR el tema visual de la aplicación en tiempo real, mejorando la experiencia de uso mediante la manipulación dinámica del DOM.
- Formulario de Contacto Validado: Incluye validación del lado del cliente mediante **Expresiones Regulares (RegEx)** y permite el envío del mensaje utilizando el cliente de correo predeterminado a través de `mailto:`

## Tecnologías Utilizadas
- HTML5: Utilizado para construir la estructura semántica de la aplicación, incorporando modales nativos y el atributo `novalidate` para gestionar las validaciones personalizadas del formulario.
- CSS3: Empleado para el diseño visual y responsivo mediante Flexbox, variables CSS, filtros como `blur`, posicionamiento con `z-index` y adaptación a distintos dispositivos mediante Media Queries.
- JavaScript: Responsable de la lógica de la aplicación, incluyendo el uso del modo estricto (`'use strict'`), consumo de datos con **Fetch API**, manipulación dinámica del DOM, gestión de eventos e interacción con el navegador.

## Estructura del Proyecto
Futbolle/
    index.html           # Pantalla principal del juego y modales
    contacto.html        # Formulario de contacto
    README.md            # Documentación del proyecto
    CSS/
        reset.css        # Normalización de estilos cross-browser
        styles.css       # Estilos globales, temas y diseño adaptativo
    JS/
        api.js           # Módulo para peticiones Fetch a la API externa
        game.js          # Lógica principal del juego, pistas y temporizador
        contact.js       # Validaciones RegEx del formulario de contacto