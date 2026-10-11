export const INITIAL_DATA = {
  coach: {
    name: "Nicolás Larroca",
    role: "Preparador Físico & Entrenador Personal",
    alias: "PF.LARROCA.FIT",
    cbu: "0000003100012345678901",
    bank: "Banco Galicia",
    phone: "+5491134567890",
    email: "profe.larroca@nexcoach.fit",
    currency: "ARS",
    currencySymbol: "$",
    mpPublicKey: "APP_USR-783921092-PROFE-LARROCA",
    mpCheckoutLink: "https://mpago.la/2q9Kz1X"
  },

  students: [
    {
      id: "std-1",
      name: "Agostina Baju",
      email: "agostina.baju@example.com",
      phone: "+5491155443322",
      age: 19,
      gender: "Femenino",
      height: 164, // cm
      currentWeight: 58.2, // kg
      targetWeight: 64.5,
      currentIMC: 21.9,
      targetIMC: 24.0,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      planId: "plan-2",
      status: "active",
      startDate: "2026-02-01",
      notes: "Objetivo: Aumento de masa muscular (hipertrofia glúteos e isquios) y ganancia de fuerza.",
      avgFatigue: 7.2,
      weeklyHours: 6.5,
      monthlyHours: 26,
      paymentStatus: "paid",
      lastPaymentDate: "2026-10-04",
      nextDueDate: "2026-11-05"
    },
    {
      id: "std-2",
      name: "Mateo Rodríguez",
      email: "mateo.rodriguez@example.com",
      phone: "+5491166778899",
      age: 26,
      gender: "Masculino",
      height: 178,
      currentWeight: 76.5,
      targetWeight: 80.0,
      currentIMC: 24.1,
      targetIMC: 25.2,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      planId: "plan-2",
      status: "active",
      startDate: "2026-03-15",
      notes: "Acondicionamiento físico general y fuerza de tren superior.",
      avgFatigue: 6.8,
      weeklyHours: 5.0,
      monthlyHours: 20,
      paymentStatus: "pending",
      lastPaymentDate: "2026-09-08",
      nextDueDate: "2026-10-10"
    },
    {
      id: "std-3",
      name: "Sofía Gómez",
      email: "sofia.gomez@example.com",
      phone: "+5491199887766",
      age: 23,
      gender: "Femenino",
      height: 168,
      currentWeight: 63.0,
      targetWeight: 60.0,
      currentIMC: 22.3,
      targetIMC: 21.2,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      planId: "plan-1",
      status: "active",
      startDate: "2026-01-10",
      notes: "Definición y resistencia cardiovascular.",
      avgFatigue: 8.0,
      weeklyHours: 4.5,
      monthlyHours: 18,
      paymentStatus: "overdue",
      lastPaymentDate: "2026-09-02",
      nextDueDate: "2026-10-05"
    },
    {
      id: "std-4",
      name: "Lucas Benítez",
      email: "lucas.benitez@example.com",
      phone: "+5491144332211",
      age: 31,
      gender: "Masculino",
      height: 182,
      currentWeight: 84.0,
      targetWeight: 82.0,
      currentIMC: 25.4,
      targetIMC: 24.8,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      planId: "plan-3",
      status: "active",
      startDate: "2026-05-01",
      notes: "Powerlifting y fuerza máxima.",
      avgFatigue: 7.5,
      weeklyHours: 6.0,
      monthlyHours: 24,
      paymentStatus: "paid",
      lastPaymentDate: "2026-10-02",
      nextDueDate: "2026-11-02"
    }
  ],

  plans: [
    {
      id: "plan-1",
      name: "Personalizado 3x Semana",
      price: 38000,
      billingFrequency: "Mensual",
      description: "Rutina adaptada 3 días semanales con control mensual de cargas y medidas."
    },
    {
      id: "plan-2",
      name: "Personalizado 5x Semana (Full)",
      price: 46000,
      billingFrequency: "Mensual",
      description: "Rutina completa de 5 días con seguimiento continuo de RPE, videoteca y sobrecarga."
    },
    {
      id: "plan-3",
      name: "Entrenamiento Remoto / Online",
      price: 32000,
      billingFrequency: "Mensual",
      description: "Planificación mensual a distancia con videos explicativos y feedback digital."
    }
  ],

  payments: [
    {
      id: "pay-101",
      studentId: "std-1",
      studentName: "Agostina Baju",
      monthPeriod: "Octubre 2026",
      amount: 46000,
      dueDate: "2026-10-05",
      paidDate: "2026-10-04",
      status: "paid",
      method: "Transferencia Bancaria",
      receiptUrl: "comprobante_baju_oct26.pdf",
      notes: "Abonado en término vía transferencia Galicia."
    },
    {
      id: "pay-102",
      studentId: "std-4",
      studentName: "Lucas Benítez",
      monthPeriod: "Octubre 2026",
      amount: 32000,
      dueDate: "2026-10-05",
      paidDate: "2026-10-02",
      status: "paid",
      method: "Mercado Pago",
      receiptUrl: "comprobante_lucas_oct26.pdf",
      notes: "Abonado con CVU Mercado Pago."
    },
    {
      id: "pay-103",
      studentId: "std-2",
      studentName: "Mateo Rodríguez",
      monthPeriod: "Octubre 2026",
      amount: 46000,
      dueDate: "2026-10-10",
      paidDate: null,
      status: "pending",
      method: "Efectivo",
      receiptUrl: null,
      notes: "Prometió abonar en la clase del lunes."
    },
    {
      id: "pay-104",
      studentId: "std-3",
      studentName: "Sofía Gómez",
      monthPeriod: "Octubre 2026",
      amount: 38000,
      dueDate: "2026-10-05",
      paidDate: null,
      status: "overdue",
      method: "Transferencia Bancaria",
      receiptUrl: null,
      notes: "Vencido hace 5 días. Enviar recordatorio WhatsApp."
    },
    {
      id: "pay-105",
      studentId: "std-1",
      studentName: "Agostina Baju",
      monthPeriod: "Septiembre 2026",
      amount: 46000,
      dueDate: "2026-09-05",
      paidDate: "2026-09-05",
      status: "paid",
      method: "Transferencia Bancaria",
      receiptUrl: "comprobante_baju_sep26.pdf",
      notes: "Pagado puntualmente."
    }
  ],

  // Medidas corporales (expresado en cm de la planilla de Agostina Baju)
  anthropometry: [
    { mesociclo: "Mesociclo 1", gemelos: 35, muslos: 51, gluteos: 96, abdomen: 86, hombros: 100, biceps: 29, pecho: 94 },
    { mesociclo: "Mesociclo 2", gemelos: 34, muslos: 53, gluteos: 95, abdomen: 89, hombros: 105, biceps: 28, pecho: 96 },
    { mesociclo: "Mesociclo 3", gemelos: 35, muslos: 53, gluteos: 98, abdomen: 80, hombros: 101, biceps: 29, pecho: 90 },
    { mesociclo: "Mesociclo 4", gemelos: 34, muslos: 54, gluteos: 95, abdomen: 81, hombros: 95,  biceps: 27, pecho: 90 },
    { mesociclo: "Mesociclo 5", gemelos: 34, muslos: 54, gluteos: 93, abdomen: 75, hombros: 100, biceps: 28, pecho: 90 },
    { mesociclo: "Mesociclo 6", gemelos: 34, muslos: 52, gluteos: 96, abdomen: 79, hombros: 100, biceps: 28, pecho: 90 }
  ],

  // Evolución de Fuerza y Kilos Movidos
  strengthProgression: [
    { mes: "Mes 1", pressPlano: 34.5, remoBarra: 32.0, sentadillaProfunda: 55.0, pesoMuerto: 40.0, despegueHex: 30.0, sentadillaMedia: 62.0, totalKilos: 219 },
    { mes: "Mes 2", pressPlano: 36.0, remoBarra: 33.5, sentadillaProfunda: 58.0, pesoMuerto: 42.5, despegueHex: 32.5, sentadillaMedia: 70.0, totalKilos: 272 },
    { mes: "Mes 3", pressPlano: 37.5, remoBarra: 35.0, sentadillaProfunda: 60.0, pesoMuerto: 45.0, despegueHex: 35.0, sentadillaMedia: 72.5, totalKilos: 285 },
    { mes: "Mes 4", pressPlano: 38.0, remoBarra: 36.0, sentadillaProfunda: 62.5, pesoMuerto: 47.0, despegueHex: 37.5, sentadillaMedia: 75.0, totalKilos: 296 },
    { mes: "Mes 5", pressPlano: 40.0, remoBarra: 37.5, sentadillaProfunda: 65.0, pesoMuerto: 50.0, despegueHex: 40.0, sentadillaMedia: 77.5, totalKilos: 310 },
    { mes: "Mes 6", pressPlano: 42.5, remoBarra: 39.0, sentadillaProfunda: 67.5, pesoMuerto: 52.5, despegueHex: 42.5, sentadillaMedia: 80.0, totalKilos: 324 }
  ],

  // Pesaje histórico
  weightHistory: [
    { date: "Feb 2026", weight: 59.0, imc: 21.9 },
    { date: "Mar 2026", weight: 58.95, imc: 21.9 },
    { date: "Abr 2026", weight: 61.9, imc: 23.0 },
    { date: "May 2026", weight: 58.1, imc: 21.6 },
    { date: "Jul 2026", weight: 58.4, imc: 21.7 },
    { date: "Sep 2026", weight: 58.2, imc: 21.6 }
  ],

  // Videoteca con los enlaces reales a YouTube Shorts del Prof. Nicolás Larroca
  videoLibrary: [
    {
      id: "vid-1",
      name: "Sentadilla con barra hexagonal",
      category: "Tren Inferior",
      url: "https://www.youtube.com/shorts/9EC044QlmtE",
      youtubeId: "9EC044QlmtE",
      cue: "Mantener pecho erguido y empujar con toda la planta del pie."
    },
    {
      id: "vid-2",
      name: "Remo al mentón con barra W",
      category: "Tren Superior",
      url: "https://www.youtube.com/shorts/Mol4rBxo-Bc",
      youtubeId: "Mol4rBxo-Bc",
      cue: "Codos por encima de la barra en la fase concéntrica."
    },
    {
      id: "vid-3",
      name: "Sentadilla con banda elástica en rodillas",
      category: "Glúteos & Cadera",
      url: "https://youtu.be/eDMDEWmJhlI",
      youtubeId: "eDMDEWmJhlI",
      cue: "Presionar hacia afuera con las rodillas para activar glúteo medio."
    },
    {
      id: "vid-4",
      name: "Flexiones de brazo en banco plano",
      category: "Pecho & Tríceps",
      url: "https://www.youtube.com/shorts/EGIJZA29Ubg",
      youtubeId: "EGIJZA29Ubg",
      cue: "Core firme, codos a 45 grados respecto al torso."
    },
    {
      id: "vid-5",
      name: "Sentadilla + Press con mancuerna",
      category: "Complejo / Funcional",
      url: "https://www.youtube.com/shorts/49Gvoqy9T4E",
      youtubeId: "49Gvoqy9T4E",
      cue: "Aprovechar la inercia de la subida para proyectar el press sobre la cabeza."
    },
    {
      id: "vid-6",
      name: "Press Arnold con mancuernas",
      category: "Hombros",
      url: "https://www.youtube.com/shorts/wpsaMyaEJk4",
      youtubeId: "wpsaMyaEJk4",
      cue: "Rotación suave de muñecas controlando la bajada."
    },
    {
      id: "vid-7",
      name: "Patadas de glúteos en polea baja",
      category: "Glúteos & Isquios",
      url: "https://youtube.com/shorts/BV4pXzrAwmU",
      youtubeId: "BV4pXzrAwmU",
      cue: "Alineación pélvica, apretar un segundo en la contracción máxima."
    },
    {
      id: "vid-8",
      name: "Curl de bíceps concentrado sentada",
      category: "Bíceps",
      url: "https://www.youtube.com/shorts/NKehjTZEc7s",
      youtubeId: "NKehjTZEc7s",
      cue: "Fijar el codo contra el muslo interno sin balancear el torso."
    },
    {
      id: "vid-9",
      name: "Jumping Jacks (Cardio / Activación)",
      category: "Calentamiento & Cardio",
      url: "https://www.youtube.com/shorts/yg3KQQn3QWg",
      youtubeId: "yg3KQQn3QWg",
      cue: "Caída suave amortiguando con la punta de los pies."
    },
    {
      id: "vid-10",
      name: "Patada de burro en polea baja",
      category: "Glúteos",
      url: "https://youtube.com/shorts/35_gCUE3SmM",
      youtubeId: "35_gCUE3SmM",
      cue: "Extensión pura de cadera sin arquear la zona lumbar."
    },
    {
      id: "vid-11",
      name: "Flexiones de tríceps con rodillas apoyadas",
      category: "Tríceps & Pecho",
      url: "https://www.youtube.com/shorts/mnHrBtulTcM",
      youtubeId: "mnHrBtulTcM",
      cue: "Codos pegados a los dorsales para máxima activación de tríceps."
    },
    {
      id: "vid-12",
      name: "Movilidad Articular Tren Inferior",
      category: "Movilidad",
      url: "https://www.youtube.com/shorts/VHkqEiJvtHQ",
      youtubeId: "VHkqEiJvtHQ",
      cue: "Rangos completos de movimiento sin forzar dolor."
    },
    {
      id: "vid-13",
      name: "Péndulo para piernas",
      category: "Tren Inferior",
      url: "https://www.youtube.com/shorts/TRTu6qAy1yU",
      youtubeId: "TRTu6qAy1yU",
      cue: "Control excéntrico en todo el recorrido."
    },
    {
      id: "vid-14",
      name: "Búlgaras con mancuerna",
      category: "Tren Inferior",
      url: "https://www.youtube.com/shorts/cytfxsIK_Hk",
      youtubeId: "cytfxsIK_Hk",
      cue: "Torso ligeramente inclinado para mayor reclutamiento de glúteos."
    }
  ],

  // Mesociclos y Rutinas estructuradas
  mesocycles: [
    {
      id: "meso-1",
      name: "Mesociclo 1 (Febrero)",
      focus: "Adaptación Anatómica, Base de Fuerza & Activación de Glúteos",
      days: [
        {
          id: "day-1-1",
          name: "Lunes",
          focus: "Movilidad, Cadena Posterior y Cuádriceps",
          blocks: [
            {
              id: "b1",
              title: "Bloque 1: Activación y Fuerza Básica",
              rounds: 3,
              exercises: [
                { id: "e1", name: "Movilidad articular de rodilla, cintura y tronco", setsReps: "5 min", videoId: "vid-12", defaultWeight: "0 kg" },
                { id: "e2", name: "Camilla boca abajo", setsReps: "3x10", defaultWeight: "25 kg" },
                { id: "e3", name: "Peso muerto con barra recta", setsReps: "3x10", defaultWeight: "40 kg" },
                { id: "e4", name: "Prensa 90°", setsReps: "4x10", defaultWeight: "80 kg" }
              ]
            },
            {
              id: "b2",
              title: "Bloque 2: Cuádriceps y Cadera",
              rounds: 3,
              exercises: [
                { id: "e5", name: "Camilla sentada", setsReps: "4x12", defaultWeight: "30 kg" },
                { id: "e6", name: "Sentadilla profunda", setsReps: "2x10, 2x8, 2x6 (Piramidal)", defaultWeight: "55 kg" },
                { id: "e7", name: "Sentadilla con barra hexagonal", setsReps: "3x10", videoId: "vid-1", defaultWeight: "35 kg" },
                { id: "e8", name: "Prensa 45°", setsReps: "4x12", defaultWeight: "100 kg" }
              ]
            },
            {
              id: "b3",
              title: "Bloque 3: Glúteo & Acondicionamiento",
              rounds: 3,
              exercises: [
                { id: "e9", name: "Tríceps patada de burro con polea baja", setsReps: "3x10", videoId: "vid-10", defaultWeight: "10 kg" },
                { id: "e10", name: "Flexiones de brazo cerradas con apoyo de rodillas", setsReps: "4x10", videoId: "vid-11", defaultWeight: "Corporal" },
                { id: "e11", name: "Polea alta extensiones de codo agarre cerrado", setsReps: "4x10", defaultWeight: "15 kg" }
              ]
            }
          ]
        },
        {
          id: "day-1-2",
          name: "Martes",
          focus: "Hombros, Espalda y Pecho",
          blocks: [
            {
              id: "b4",
              title: "Bloque 1: Tracción y Espalda",
              rounds: 3,
              exercises: [
                { id: "e12", name: "Dominadas acostada bajo la barra", setsReps: "3x10", defaultWeight: "Corporal" },
                { id: "e13", name: "Remo a un brazo con mancuerna", setsReps: "3x8 (c/l)", defaultWeight: "14 kg" },
                { id: "e14", name: "Remo bajo en polea con barra", setsReps: "4x10", defaultWeight: "30 kg" },
                { id: "e15", name: "Jalón al pecho polea alta", setsReps: "4x12", defaultWeight: "35 kg" }
              ]
            },
            {
              id: "b5",
              title: "Bloque 2: Deltoides y Trapecios",
              rounds: 3,
              exercises: [
                { id: "e16", name: "Vuelos laterales a un brazo", setsReps: "3x8 (c/l)", defaultWeight: "6 kg" },
                { id: "e17", name: "Remo al mentón con barra W", setsReps: "3x10", videoId: "vid-2", defaultWeight: "18 kg" },
                { id: "e18", name: "Press Arnold con mancuernas", setsReps: "4x10", videoId: "vid-6", defaultWeight: "8 kg" }
              ]
            }
          ]
        },
        {
          id: "day-1-3",
          name: "Miércoles",
          focus: "Glúteos, Aductores y Core",
          blocks: [
            {
              id: "b6",
              title: "Bloque 1: Core y Abdominales",
              rounds: 3,
              exercises: [
                { id: "e19", name: "Abdominales bolita", setsReps: "3x12", defaultWeight: "Corporal" },
                { id: "e20", name: "Abdominales cortitos tocando tobillos", setsReps: "3x15", defaultWeight: "Corporal" },
                { id: "e21", name: "Escaladores", setsReps: "3x20", defaultWeight: "Corporal" }
              ]
            },
            {
              id: "b7",
              title: "Bloque 2: Glúteo Focalizado",
              rounds: 3,
              exercises: [
                { id: "e22", name: "Sentadilla con banda elástica en rodillas", setsReps: "3x10", videoId: "vid-3", defaultWeight: "Banda media" },
                { id: "e23", name: "Subidas laterales glúteos c/ banda elástica", setsReps: "3x12 (c/l)", defaultWeight: "Banda" },
                { id: "e24", name: "Elevaciones de pelvis en máquina", setsReps: "2x8, 2x10, 2x12", defaultWeight: "50 kg" },
                { id: "e25", name: "Patada en polea baja", setsReps: "4x10 (c/l)", videoId: "vid-7", defaultWeight: "15 kg" }
              ]
            }
          ]
        },
        {
          id: "day-1-4",
          name: "Jueves",
          focus: "Pecho, Hombro y Tríceps",
          blocks: [
            {
              id: "b8",
              title: "Bloque 1: Fuerza Pectoral",
              rounds: 3,
              exercises: [
                { id: "e26", name: "Flexiones de brazo en banco plano", setsReps: "3x10", videoId: "vid-4", defaultWeight: "Corporal" },
                { id: "e27", name: "Banco plano con barra", setsReps: "4x8", defaultWeight: "34.5 kg" },
                { id: "e28", name: "Aperturas en banco inclinado", setsReps: "3x12", defaultWeight: "8 kg" }
              ]
            }
          ]
        },
        {
          id: "day-1-5",
          name: "Viernes",
          focus: "Circuito Metabólico y Potencia",
          blocks: [
            {
              id: "b9",
              title: "Bloque Funcional Completo (X 3 SERIES)",
              rounds: 3,
              exercises: [
                { id: "e29", name: "Sentadilla + press con mancuerna", setsReps: "10 reps", videoId: "vid-5", defaultWeight: "8 kg c/u" },
                { id: "e30", name: "Despegue con barra hexagonal", setsReps: "8 reps", videoId: "vid-1", defaultWeight: "35 kg" },
                { id: "e31", name: "Abdominales completos", setsReps: "10 reps", defaultWeight: "Corporal" },
                { id: "e32", name: "Espinales", setsReps: "15 reps", defaultWeight: "Corporal" },
                { id: "e33", name: "Jumping Jacks", setsReps: "20 reps", videoId: "vid-9", defaultWeight: "Corporal" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "meso-7",
      name: "Mesociclo 7 (Septiembre)",
      focus: "Hipertrofia Avanzada & Resistencia a la Fatiga",
      days: [
        {
          id: "day-7-1",
          name: "Lunes",
          focus: "Femorales, Glúteos y Gemelos",
          blocks: [
            {
              id: "b10",
              title: "Bloque 1: Isquios & Péndulo",
              rounds: 4,
              exercises: [
                { id: "e34", name: "Movilidad articular de rodilla, cintura y tronco", setsReps: "5 min", videoId: "vid-12", defaultWeight: "0 kg" },
                { id: "e35", name: "Péndulo para piernas", setsReps: "4x12", videoId: "vid-13", defaultWeight: "35 kg" },
                { id: "e36", name: "Peso muerto con barra recta", setsReps: "4x8", defaultWeight: "52.5 kg" },
                { id: "e37", name: "Búlgaras para glúteos c/ mancuerna", setsReps: "4x10", videoId: "vid-14", defaultWeight: "12 kg" }
              ]
            }
          ]
        },
        {
          id: "day-7-2",
          name: "Martes",
          focus: "Pecho, Hombros y Bíceps",
          blocks: [
            {
              id: "b11",
              title: "Bloque 1: Fuerza Pectoral y Deltoides",
              rounds: 3,
              exercises: [
                { id: "e38", name: "Banco plano con barra", setsReps: "2x10, 3x6", defaultWeight: "42.5 kg" },
                { id: "e39", name: "Banco inclinado press alternado", setsReps: "3x10", defaultWeight: "12 kg" },
                { id: "e40", name: "Vuelos laterales", setsReps: "12 reps", defaultWeight: "7 kg" },
                { id: "e41", name: "Curl de bíceps concentrado sentada", setsReps: "3x10", videoId: "vid-8", defaultWeight: "8 kg" }
              ]
            }
          ]
        }
      ]
    }
  ],

  // 1. VIDEOS SUBIDOS POR ALUMNOS Y FEEDBACK DE TÉCNICA DEL PROFESOR
  techniqueSubmissions: [
    {
      id: "tech-1",
      studentId: "std-1",
      studentName: "Agostina Baju",
      exerciseName: "Sentadilla Profunda (Serie 3 a 58kg)",
      submittedDate: "2026-10-09",
      videoUrl: "https://www.youtube.com/shorts/9EC044QlmtE",
      youtubeId: "9EC044QlmtE",
      studentNotes: "Sentí que en las últimas 2 repeticiones la rodilla derecha se me metía un poco hacia adentro (valgo). ¿Cómo ves la profundidad?",
      status: "reviewed", // 'pending' | 'reviewed'
      rating: "Muy Buena", // 'Excelente' | 'Muy Buena' | 'A Corregir'
      coachFeedback: "¡Gran profundidad Agos! Llegaste bien paralelo. Para evitar el valgo en las repeticiones finales, concéntrate en empujar el suelo 'abriendo las rodillas' como si quisieras romper una toalla en el suelo. Muy buen control del torso.",
      reviewedAt: "2026-10-10"
    },
    {
      id: "tech-2",
      studentId: "std-1",
      studentName: "Agostina Baju",
      exerciseName: "Despegue con Barra Hexagonal (35kg)",
      submittedDate: "2026-10-07",
      videoUrl: "https://www.youtube.com/shorts/Mol4rBxo-Bc",
      youtubeId: "Mol4rBxo-Bc",
      studentNotes: "¿Está bien la posición de la cadera al arrancar?",
      status: "reviewed",
      rating: "Excelente",
      coachFeedback: "Postura impecable. Espalda neutra y el empuje de piernas fue sincronizado. Mantén ese mismo tempo en el mesociclo siguiente.",
      reviewedAt: "2026-10-08"
    },
    {
      id: "tech-3",
      studentId: "std-2",
      studentName: "Mateo Rodríguez",
      exerciseName: "Press Banco Plano (60kg)",
      submittedDate: "2026-10-11",
      videoUrl: "https://www.youtube.com/shorts/EGIJZA29Ubg",
      youtubeId: "EGIJZA29Ubg",
      studentNotes: "Siento molestia en el hombro anterior al bajar.",
      status: "pending",
      rating: null,
      coachFeedback: null,
      reviewedAt: null
    }
  ],

  // 2. PLANTILLAS DE RUTINAS REUTILIZABLES (ROUTINE TEMPLATES)
  routineTemplates: [
    {
      id: "tmpl-1",
      name: "Hipertrofia Glúteos & Isquios (4 Días)",
      category: "Especialización Femenina",
      level: "Intermedio / Avanzado",
      durationWeeks: 4,
      description: "Enfocado en máxima ganancia de masa muscular en tren inferior, con 2 días de cadera/glúteo y 2 días de tren superior compensatorio.",
      daysCount: 4,
      totalExercises: 22
    },
    {
      id: "tmpl-2",
      name: "Fuerza Básica & Potencia (5 Días)",
      category: "Fuerza & Rendimiento",
      level: "Avanzado",
      durationWeeks: 6,
      description: "Estructura basada en los ejercicios de competición (Sentadilla profunda, Peso muerto, Banco plano) con sobrecarga calculada.",
      daysCount: 5,
      totalExercises: 26
    },
    {
      id: "tmpl-3",
      name: "Acondicionamiento Funcional & Core (3 Días)",
      category: "Salud & Movilidad",
      level: "Principiante / Intermedio",
      durationWeeks: 4,
      description: "Circuitos metabólicos para quemar grasa, ganar resistencia y mejorar postura y estabilidad del core.",
      daysCount: 3,
      totalExercises: 18
    }
  ],

  // 3. SEGUIMIENTO DE HÁBITOS DIARIOS & NUTRICIÓN
  habitsData: {
    studentId: "std-1",
    waterLiters: 2.5,
    waterTarget: 3.0,
    proteinGrams: 105,
    proteinTarget: 120,
    dailySteps: 9200,
    stepsTarget: 10000,
    sleepHours: 7.5,
    sleepTarget: 8.0,
    weeklyCompliance: 89, // %
    checklist: [
      { id: "h1", label: "Tomar 3 litros de agua", done: true },
      { id: "h2", label: "Consumir al menos 110g de proteína", done: true },
      { id: "h3", label: "Dormir al menos 7.5 horas", done: true },
      { id: "h4", label: "Completar 10.000 pasos diarios", done: false },
      { id: "h5", label: "Suplementación (Creatina + Multivitamínico)", done: true }
    ],
    mealsPhotos: [
      { id: "m1", title: "Almuerzo Post-Entreno", desc: "Pechuga de pollo, arroz yamani, palta y ensalada de hojas verdes", time: "13:30 hs" },
      { id: "m2", title: "Merienda Proteica", desc: "Yogur griego con frutos rojos y nueces", time: "17:00 hs" }
    ]
  },

  // 4. GAMIFICACIÓN, RÉCORDS PERSONALES (PRs) & MEDALLAS
  gamification: {
    studentId: "std-1",
    totalXP: 2450,
    level: 5,
    levelTitle: "Atleta Avanzada NexCoach",
    personalRecords: [
      { exercise: "Sentadilla Profunda", weight: 67.5, previous: 55.0, date: "Mes 6", achieved: true },
      { exercise: "Peso Muerto", weight: 52.5, previous: 40.0, date: "Mes 6", achieved: true },
      { exercise: "Sentadilla Media", weight: 80.0, previous: 62.0, date: "Mes 6", achieved: true },
      { exercise: "Press Banco Plano", weight: 42.5, previous: 34.5, date: "Mes 6", achieved: true },
      { exercise: "Kilos Movidos Totales", weight: 324, previous: 219, date: "Mes 6", achieved: true }
    ],
    badges: [
      {
        id: "badge-1",
        title: "Reina de la Sentadilla",
        desc: "Superó los 65 kg en Sentadilla Profunda con técnica aprobada.",
        icon: "Crown",
        unlocked: true,
        date: "2026-08-15"
      },
      {
        id: "badge-2",
        title: "Club de los 300 Kilos",
        desc: "Alcanzó más de 300 kg de volumen total en levantamientos.",
        icon: "Flame",
        unlocked: true,
        date: "2026-07-20"
      },
      {
        id: "badge-3",
        title: "Disciplina Imparable",
        desc: "6 Mesociclos consecutivos con más del 90% de asistencia.",
        icon: "Award",
        unlocked: true,
        date: "2026-09-01"
      },
      {
        id: "badge-4",
        title: "Técnica Perfecta",
        desc: "5 videos de técnica calificados como 'Excelente' por el Profe.",
        icon: "Sparkles",
        unlocked: true,
        date: "2026-10-08"
      },
      {
        id: "badge-5",
        title: "Glúteos de Acero",
        desc: "Hip Thrust con más de 60 kg x 25 repeticiones.",
        icon: "Zap",
        unlocked: true,
        date: "2026-08-28"
      }
    ]
  }
};
