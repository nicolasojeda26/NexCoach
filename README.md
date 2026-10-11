# NexCoach — App de Entrenamientos Personalizados & Gestión Integral

Aplicación web y PWA mobile-first completa para preparadores físicos y alumnos, desarrollada a partir de la metodología de entrenamiento del **Prof. Nicolás Larroca** (*Agostina Baju 2026*).

---

## 🌟 Todas las Funcionalidades Implementadas

### 1. Panel del Profesor vs. Portal del Alumno (Selector de Rol)
- **Modo Profe**: Gestión integral de alumnos, control de caja y cobranzas, revisión de técnica en video, asignación de plantillas y seguimiento biométrico.
- **Modo Alumna**: Modo "Entrenar Hoy" en vivo con steppers de carga, cronómetro con audio, autogestión de cuota con 1-tap copy y checklist de hábitos.

### 2. Control de Pagos & Finanzas del Profesor
- **Dashboard de Caja Mensual**: Total cobrado, pendiente de cobro, vencido en mora y tasa de efectividad (%).
- **Cobro por WhatsApp en 1 Clic**: Envío directo de recordatorio con datos bancarios (Alias, CBU, Banco) y monto.
- **Integración con Mercado Pago**: Modal con QR, link de checkout y botón de simulación de cobro aprobado (Webhook) con confetti.
- **Vista de Autoservicio del Alumno ("Mi Cuota")**: Botones para copiar Alias y CBU al portapapeles y notificar el pago al profesor.

### 3. Modo "Entrenar Hoy" (Live Workout)
- Interfaz táctil optimizada para celular en el gimnasio.
- **Steppers de Carga**: Botones rápidos `[-5]`, `[-1]`, `[+1]`, `[+5]` kg para registrar el peso real sin abrir teclados.
- **Casillas de Series Grandes**: Checkboxes táctiles con brillo esmeralda al completarse.
- **Cronómetro de Descanso con Audio**: Alertas sonoras (Web Audio API) con presets de 30s, 60s, 90s, 120s.
- **Temporizador de Sesión**: Cronómetro en vivo de duración del entrenamiento.
- **Escala de Esfuerzo (RPE 1-10)** y animación de confetti al finalizar la sesión.

### 4. Corrección de Técnica por Video
- **Envío del Alumno**: Formulario para cargar enlace de video (YouTube Shorts, Drive, Loom, etc.) y describir sensaciones o dudas.
- **Revisión del Profesor**: Calificación (Excelente, Muy Buena, A Corregir), devolución escrita con marcas de tiempo y botón para enviar la corrección por WhatsApp en 1 toque.

### 5. Exportación de Informe Mensual en PDF
- Modal con diseño listo para imprimir o guardar como PDF (formato A4) con:
  - Ficha biométrica y deltas de perímetros corporales en los 12 mesociclos.
  - Progresión de fuerza y +48% de kilos movidos.
  - Conclusiones y firma digital del Preparador Físico.

### 6. Biblioteca de Plantillas de Rutinas Reutilizables
- Catálogo de plantillas preconfiguradas (*"Hipertrofia Glúteos 4D"*, *"Fuerza Básica 5D"*, *"Funcional 3D"*).
- Acción de **Clonado en 1 Clic** para asignar la estructura a cualquier alumno y mesociclo.

### 7. Módulo de Hábitos Diarios & Nutrición
- **Hidratación**: Contador interactivo de agua con botones de +250ml / +500ml y barra hacia la meta de 3 Litros.
- **Proteína**: Contador de gramos con botones rápidos (+15g / +30g) hacia la meta de 120g.
- **Pasos Diarios & Sueño**: Indicadores de actividad NEAT y descanso nocturno.
- **Checklist Diario**: Creatina, hidratación, comidas y horas de sueño.
- **Diario Fotográfico de Comidas**: Registro visual de platos para supervisión del profe.

### 8. Gamificación, Récords Personales (PRs) & Medallas
- Medallas desbloqueadas (*"Reina de la Sentadilla"*, *"Club de los 300 Kilos"*, *"Disciplina Imparable"*).
- Nivel de atleta y puntos de experiencia (XP).
- Historial comparativo de marcas personales (PRs).

### 9. Antropometría (12 Mesociclos) & Fuerza (RMs)
- Medición de 7 perímetros anatómicos en cm con gráficos comparativos de barras.
- Historial de levantamientos (*Press plano, Sentadilla profunda, Remo con barra, Peso muerto, Despegue hexagonal*).
- **Calculadora rápida de 1RM** con fórmula de Epley.

### 10. Videoteca Técnica de YouTube Shorts
- Galería clasificada por grupos musculares con reproducción en ventana modal sin salir de la app.

---

## 📱 PWA & Acceso Móvil

- Optimizado para pantallas táctiles (*touch-action: manipulation*, `-webkit-tap-highlight-color: transparent`).
- Soporte para instalación como PWA en Android y iOS con `manifest.json`.

---

## 💻 Instrucciones de Uso

La aplicación está disponible localmente en:
`http://localhost:5173/`

Para compilar el proyecto:
```bash
npm run build
```
