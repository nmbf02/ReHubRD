/**
 * Guías de apoyo y recursos para personas en recuperación.
 * República Dominicana.
 */

export interface GuiaRecurso {
  id: string;
  titulo: string;
  descripcion: string;
  pasos?: string[];
  contactos?: { nombre: string; valor: string; tipo: "tel" | "web" | "otros" }[];
  nota?: string;
}

export const GUIAS_APOYO: Record<string, GuiaRecurso> = {
  transporte: {
    id: "transporte",
    titulo: "Necesito ir a un lugar y no sé cómo",
    descripcion:
      "Opciones para desplazarte cuando tienes limitaciones de movilidad o necesitas transporte accesible.",
    pasos: [
      "Movep: servicio de transporte especializado para personas con discapacidad o movilidad reducida. Vehículos adaptados para sillas de ruedas. Busca «Movep RD» para contactar.",
      "OMSA: autobuses metropolitanos en Santo Domingo y otras ciudades. Consulta rutas en omsa.gob.do.",
      "Metro y Teleférico: transporte público en Santo Domingo. Puede haber opciones accesibles según la estación.",
      "Si tienes seguro/ARS: consulta si cubren transporte médico o ambulancias para citas.",
      "Familia o vecinos: no dudes en pedir ayuda para traslados a citas médicas. Muchas personas están dispuestas a apoyar.",
    ],
    contactos: [
      { nombre: "FIMOVIT (transporte)", tipo: "web", valor: "fimovit.gob.do" },
      { nombre: "OMSA", tipo: "web", valor: "omsa.gob.do" },
    ],
    nota: "Si estás sola o sola, programa los traslados con anticipación y ten un plan B.",
  },
  medicamentos: {
    id: "medicamentos",
    titulo: "Necesito comprar un medicamento y no sé cómo",
    descripcion:
      "Opciones para conseguir medicamentos sin tener que ir presencialmente a la farmacia.",
    pasos: [
      "Ten tu receta médica a mano (foto o original).",
      "PedidosYa: app/ web pedidosya.com.do — muchas farmacias asociadas ofrecen delivery.",
      "Uber Eats: en zonas urbanas, algunas farmacias entregan por esta plataforma.",
      "Farmacias con delivery propio: pregunta en tu farmacia habitual si hacen envíos a domicilio.",
      "Si tienes ARS o seguro: revisa si tu plan incluye farmacia a domicilio o convenios.",
      "Si no puedes pagar: consulta en tu centro de salud si hay programas de apoyo para medicamentos.",
    ],
    contactos: [
      { nombre: "PedidosYa", tipo: "web", valor: "pedidosya.com.do" },
    ],
    nota: "No compres medicamentos sin receta. Si no tienes cómo moverte, prioriza farmacias con delivery.",
  },
  sola: {
    id: "sola",
    titulo: "No puedo moverme y estoy sola o solo",
    descripcion:
      "Recursos para cuando te sientes aislado o aislada y necesitas apoyo logístico o emocional.",
    pasos: [
      "Línea de salud mental 809-200-1400: atención psicológica gratuita, confidencial. Horario ampliado. No estás sola.",
      "Línea 811: número nacional de salud mental (en transición). Gratuito y confidencial.",
      "Registra un contacto de emergencia en tu perfil ReHub (Mi perfil → Contexto social). Una persona de confianza que pueda ayudarte.",
      "Vecinos o familia: aunque sea por teléfono, mantener contacto ayuda. Pide que te llamen o te visiten si es posible.",
      "Iglesias y organizaciones comunitarias: muchas ofrecen acompañamiento o pueden canalizarte a recursos.",
      "ARS / centro de salud: pregunta por servicios de atención domiciliaria o enfermería a domicilio si aplica.",
      "Grupos de WhatsApp o redes: buscar grupos de personas en recuperación o con condiciones similares puede dar apoyo emocional.",
    ],
    contactos: [
      { nombre: "Salud mental (gratuito)", tipo: "tel", valor: "809-200-1400" },
      { nombre: "Línea nacional salud mental", tipo: "tel", valor: "811" },
    ],
    nota: "Pedir ayuda no es debilidad. Mereces acompañamiento en tu proceso.",
  },
  apoyoEmocional: {
    id: "apoyo-emocional",
    titulo: "Necesito apoyo emocional o alguien con quien hablar",
    descripcion:
      "Recursos gratuitos y confidenciales para tu bienestar emocional.",
    pasos: [
      "Línea «Cuida tu Salud Mental» 809-200-1400: primera ayuda psicológica, crisis, ansiedad, duelo. Gratuita y confidencial.",
      "811: línea nacional de salud mental. Psicólogos clínicos disponibles.",
      "ISAMT (Instituto de Salud Mental): terapia por teléfono y WhatsApp.",
      "Centro de Bienestar Integral UASD: opciones de apoyo psicológico.",
      "Actualiza tu estado emocional en el Seguimiento de ReHub para que tu plan priorice recursos adaptados a ti.",
    ],
    contactos: [
      { nombre: "Cuida tu Salud Mental", tipo: "tel", valor: "809-200-1400" },
      { nombre: "Línea nacional", tipo: "tel", valor: "811" },
    ],
    nota: "Hablar con un profesional puede hacer una gran diferencia. Es confidencial.",
  },
  tramites: {
    id: "tramites",
    titulo: "Documentos y trámites post-alta",
    descripcion:
      "Qué documentos reunir y cómo gestionar trámites con empleador, ARS y seguros.",
    pasos: [
      "Documentos básicos: informe de alta médica, recetas actuales, resultados de estudios recientes.",
      "Para tu empleador: certificado médico, licencia médica. El empleador debe registrar la licencia en virtual.sisalril.gob.do para el subsidio por incapacidad.",
      "Para ARS: verifica tu afiliación en virtual.sisalril.gob.do. Necesitarás estar al día para trámites de salud.",
      "Accidente laboral: si fue en el trabajo, el IDOPPRIL (idoppril.gob.do) gestiona indemnización cuando hay pérdida de capacidad entre 15% y 50%.",
      "Guarda copias de todo en un lugar seguro (fotos en el celular, carpeta física).",
    ],
    contactos: [
      { nombre: "SISALRIL", tipo: "web", valor: "virtual.sisalril.gob.do" },
      { nombre: "IDOPPRIL (accidentes laborales)", tipo: "web", valor: "idoppril.gob.do" },
    ],
  },
  accesibilidad: {
    id: "accesibilidad",
    titulo: "Accesibilidad en el hogar y adaptaciones",
    descripcion:
      "Ideas para hacer tu hogar más manejable si tienes limitaciones de movilidad.",
    pasos: [
      "Elimina obstáculos: cables, muebles en pasillos, alfombras que resbalan.",
      "Iluminación: mejora la luz en pasillos, baño y áreas de paso.",
      "Baño: barras de apoyo, alfombrilla antideslizante, silla para ducha si el médico lo recomienda.",
      "Consulta con tu médico o fisioterapeuta qué adaptaciones son recomendables para tu caso.",
      "Algunas ARS o programas sociales ofrecen apoyo para adaptaciones. Pregunta en tu centro de salud.",
    ],
  },
  fisioterapia: {
    id: "fisioterapia",
    titulo: "Necesito fisioterapia o rehabilitación",
    descripcion: "Cómo acceder a rehabilitación física después del alta.",
    pasos: [
      "Tu médico tratante puede indicar sesiones de fisioterapia. Pide la referencia por escrito.",
      "Consulta si tu ARS o seguro cubre fisioterapia y en qué centros. Revisa tu póliza o llama a la ARS.",
      "Hospitales públicos y centros de salud ofrecen rehabilitación. Pregunta en tu centro más cercano.",
      "Algunos centros privados tienen convenios con ARS. Pide lista de prestadores a tu aseguradora.",
      "En casa: sigue los ejercicios que te indique el fisioterapeuta. La constancia acelera la recuperación.",
    ],
    contactos: [
      { nombre: "SISALRIL (ver ARS)", tipo: "web", valor: "virtual.sisalril.gob.do" },
    ],
  },
  derechosLaborales: {
    id: "derechos-laborales",
    titulo: "No puedo trabajar y necesito saber mis derechos",
    descripcion: "Información sobre incapacidad, subsidios y protección laboral.",
    pasos: [
      "Subsidio por incapacidad: si cotizas al SDSS y la incapacidad supera 4 días, tu empleador registra la licencia en SISALRIL. Tienes derecho al subsidio.",
      "La licencia debe ser expedida por un médico. Guárdala y asegúrate de que tu empleador la registre.",
      "No te pueden despedir por estar en incapacidad médica mientras la licencia sea válida.",
      "Si fue accidente laboral: IDOPPRIL gestiona indemnización. Consulta idoppril.gob.do.",
      "Si tienes dudas, el Ministerio de Trabajo puede orientarte sobre tus derechos.",
    ],
    contactos: [
      { nombre: "SISALRIL", tipo: "web", valor: "virtual.sisalril.gob.do" },
      { nombre: "IDOPPRIL", tipo: "web", valor: "idoppril.gob.do" },
    ],
  },
  citaMedica: {
    id: "cita-medica",
    titulo: "Tengo una cita médica y no sé qué llevar",
    descripcion: "Qué documentos y preparación necesitas para tu cita.",
    pasos: [
      "Identificación (cédula o documento de identidad).",
      "Carnet de tu ARS o seguro, si tienes.",
      "Informe de alta o resumen de tu situación actual (si es seguimiento).",
      "Lista de medicamentos que tomas actualmente.",
      "Recetas y resultados de estudios recientes (radiografías, análisis).",
      "Anota preguntas antes de ir: dudas sobre tratamiento, efectos secundarios, cuándo volver.",
      "Si necesitas transporte, coordínalo con anticipación (Movep, familia, vecinos).",
    ],
  },
  segundoDiagnostico: {
    id: "segundo-diagnostico",
    titulo: "Necesito una segunda opinión médica",
    descripcion: "Cómo buscar otro criterio médico de forma informada.",
    pasos: [
      "Pide copia de tu historial, informe de alta, estudios y recetas a tu centro actual.",
      "Consulta con tu ARS si cubren segunda opinión y en qué especialistas.",
      "Busca un especialista en el área que te preocupa (traumatología, neurología, etc.).",
      "Lleva toda tu documentación a la nueva consulta.",
      "Es tu derecho buscar claridad. Un segundo criterio puede darte tranquilidad o nuevas opciones.",
    ],
  },
  noEntiendoInforme: {
    id: "no-entiendo-informe",
    titulo: "No entiendo mi informe médico",
    descripcion: "Cómo interpretar documentos médicos y qué hacer.",
    pasos: [
      "Pide una cita de seguimiento o consulta para que el médico te explique en palabras sencillas.",
      "Anota las palabras que no entiendas y pregúntalas en la próxima visita.",
      "Puedes pedir que un familiar o persona de confianza te acompañe para escuchar.",
      "Algunos centros tienen trabajadores sociales que pueden orientar.",
      "En ReHub, usa las Notas de tu perfil para escribir dudas y llevarlas a la cita.",
    ],
  },
  ayudaPagarMedicamentos: {
    id: "ayuda-pagar-medicamentos",
    titulo: "Necesito ayuda para pagar mis medicamentos",
    descripcion: "Opciones cuando no puedes costear el tratamiento.",
    pasos: [
      "Consulta en tu centro de salud si hay programas de medicamentos gratuitos o subsidios.",
      "Algunas ARS tienen farmacias o convenios con precios reducidos. Pregunta.",
      "Fundaciones y organizaciones (ej. de cáncer, diabetes) a veces apoyan con medicamentos.",
      "Iglesias y grupos comunitarios pueden tener redes de apoyo.",
      "Pregunta al médico si hay alternativas genéricas más económicas.",
    ],
  },
  volverTrabajo: {
    id: "volver-trabajo",
    titulo: "Quiero volver al trabajo pero no sé cómo",
    descripcion: "Pasos para una reintegración laboral segura.",
    pasos: [
      "Obtén el alta médica o autorización de tu médico para reintegrarte.",
      "Comunica por escrito a tu empleador la fecha prevista y si necesitas adaptaciones.",
      "Si tienes limitaciones: pregunta por horarios flexibles, teletrabajo o ajustes razonables.",
      "Empieza de forma gradual si es posible (medio tiempo, pocas horas) hasta adaptarte.",
      "Consulta en el Ministerio de Trabajo sobre derechos de reintegración y adaptación.",
    ],
  },
  miedoConducir: {
    id: "miedo-conducir",
    titulo: "Tengo miedo de salir o de conducir otra vez",
    descripcion: "Después de un accidente de tránsito, el miedo es normal. Recursos para manejarlo.",
    pasos: [
      "Es una reacción esperada. No estás «mal» por sentir miedo.",
      "Línea 809-200-1400 o 811: apoyo psicológico gratuito para ansiedad y estrés post-traumático.",
      "Vuelve a la rutina de forma gradual: primero como pasajero, luego en trayectos cortos si aplica.",
      "Habla con tu médico si el miedo te impide hacer cosas necesarias. Puede canalizar apoyo.",
      "Grupos de personas que vivieron situaciones similares pueden ayudar. Busca en redes o pregúntale a tu psicólogo.",
    ],
    contactos: [
      { nombre: "Salud mental", tipo: "tel", valor: "809-200-1400" },
      { nombre: "Línea 811", tipo: "tel", valor: "811" },
    ],
  },
  cuidador: {
    id: "cuidador",
    titulo: "Necesito un cuidador o persona que me ayude en casa",
    descripcion: "Opciones para atención y acompañamiento domiciliario.",
    pasos: [
      "Consulta con tu ARS si cubren enfermería o atención domiciliaria.",
      "Algunos hospitales tienen programas de continuidad de cuidados a domicilio.",
      "Agencias de cuidado: busca opciones en tu zona. Pide referencias.",
      "Familia o red cercana: a veces un familiar puede ayudar de forma temporal o coordinada.",
      "Programas sociales o de la iglesia: pueden tener redes de voluntarios para acompañamiento.",
    ],
  },
  abrumado: {
    id: "abrumado",
    titulo: "Me siento abrumado y no sé por dónde empezar",
    descripcion: "Cuando todo parece demasiado. Un paso a la vez.",
    pasos: [
      "Respira. No tienes que resolver todo hoy.",
      "Elige UNA cosa urgente: ¿qué es lo que más te afecta ahora? (medicamento, cita, trámite, apoyo emocional).",
      "En ReHub, ve a Recursos y selecciona esa situación. Sigue solo el primer paso.",
      "Línea 809-200-1400: hablar con alguien puede ayudarte a ordenar las ideas.",
      "Actualiza tu Seguimiento: registrar cómo te sientes permite que el plan te guíe mejor.",
    ],
    contactos: [
      { nombre: "Cuida tu Salud Mental", tipo: "tel", valor: "809-200-1400" },
    ],
  },
  hablarFamilia: {
    id: "hablar-familia",
    titulo: "Necesito hablar con mi familia sobre mi situación",
    descripcion: "Cómo comunicar tu estado y necesidades a tu entorno cercano.",
    pasos: [
      "Elige un momento tranquilo. No hace falta decirlo todo de una vez.",
      "Sé claro sobre qué necesitas: «Necesito que me acompañen a la cita» o «Necesito que me llamen más seguido».",
      "Si te cuesta, escribe antes lo que quieres decir. Puedes leer o enviar un mensaje.",
      "Un psicólogo o trabajador social puede ayudarte a preparar esa conversación (línea 809-200-1400).",
      "No todas las familias reaccionan igual. Si alguien no entiende, busca apoyo en otros.",
    ],
  },
  problemasDormir: {
    id: "problemas-dormir",
    titulo: "Tengo problemas para dormir",
    descripcion: "El sueño favorece la recuperación. Ideas para mejorar el descanso.",
    pasos: [
      "Rutina: intenta acostarte y levantarte a horas similares.",
      "Evita pantallas 1 hora antes de dormir. Reduce café y estimulantes por la tarde.",
      "Haz algo relajante antes de dormir: lectura ligera, respiración 4-7-8, música suave.",
      "Si el dolor te impide dormir, coméntalo al médico. Puede ajustar medicación o horarios.",
      "Ansiedad y estrés afectan el sueño. La línea 809-200-1400 puede orientarte.",
    ],
    contactos: [
      { nombre: "Salud mental", tipo: "tel", valor: "809-200-1400" },
    ],
  },
  adaptarTrabajo: {
    id: "adaptar-trabajo",
    titulo: "Necesito adaptar mi trabajo a mis limitaciones",
    descripcion: "Ajustes razonables y teletrabajo para seguir trabajando.",
    pasos: [
      "Obtén un informe médico que indique tus limitaciones actuales y recomendaciones.",
      "Solicita por escrito a tu empleador adaptaciones (horario flexible, teletrabajo, cambios de puesto temporal).",
      "El Ministerio de Trabajo orienta sobre ajustes razonables para personas con limitaciones.",
      "Si tienes ARS laboral, consulta si ofrecen programas de reintegración con adaptaciones.",
      "Documenta toda comunicación con tu empleador (emails, cartas) por si la necesitas después.",
    ],
  },
  contactarOtros: {
    id: "contactar-otros",
    titulo: "Quiero contactar con otras personas en recuperación",
    descripcion: "Grupos de apoyo y comunidades que entienden lo que vives.",
    pasos: [
      "Busca en redes sociales grupos de «recuperación post-accidente», «rehabilitación RD» o similares.",
      "Pregunta en tu centro de salud o hospital si conocen grupos de apoyo.",
      "Algunas ONG y fundaciones organizan encuentros o talleres para personas en situación similar.",
      "Compartir experiencias puede reducir la sensación de aislamiento y dar ideas prácticas.",
      "Siempre verifica que el grupo sea serio y respetuoso antes de compartir información personal.",
    ],
  },
  asesoriaLegal: {
    id: "asesoria-legal",
    titulo: "Necesito asesoría legal (accidente con terceros)",
    descripcion: "Cuando hubo otros involucrados y quieres conocer tus opciones.",
    pasos: [
      "Guarda toda la documentación: informe policial, informes médicos, fotos, testimonios.",
      "No firmes acuerdos ni renuncias sin consultar antes con un abogado.",
      "La Defensoría del Pueblo o colegios de abogados a veces ofrecen orientación gratuita.",
      "Si el accidente fue de tránsito, el seguro del vehículo puede tener procedimientos específicos.",
      "Un abogado especializado en daños y perjuicios puede evaluar tu caso.",
    ],
    nota: "ReHub no ofrece asesoría legal. Esta guía es orientación general. Consulta con un profesional.",
  },
  dolorCronico: {
    id: "dolor-cronico",
    titulo: "El dolor no me deja llevar una vida normal",
    descripcion: "Orientación cuando el dolor persiste y afecta tu día a día.",
    pasos: [
      "Comunica al médico que el dolor no mejora. Puede ajustar tratamiento o derivar a dolor crónico.",
      "Algunos centros tienen unidades de dolor. Pregunta en tu hospital o ARS.",
      "Fisioterapia y ejercicios adecuados pueden ayudar. Sigue las indicaciones del especialista.",
      "El estrés y la ansiedad intensifican el dolor. La línea 809-200-1400 puede apoyarte.",
      "En ReHub, actualiza tu Seguimiento con cómo te sientes. El plan puede priorizar recursos de apoyo.",
    ],
    contactos: [
      { nombre: "Salud mental", tipo: "tel", valor: "809-200-1400" },
    ],
  },
  emergenciaMedica: {
    id: "emergencia-medica",
    titulo: "Creo que es una emergencia médica",
    descripcion: "Cuándo actuar de inmediato y a quién llamar.",
    pasos: [
      "Emergencias generales: 911 (bomberos, ambulancia, policía).",
      "Si es algo que empeora rápido (dificultad para respirar, dolor fuerte de pecho, desmayo, sangrado importante): llama 911 o ve al servicio de urgencias más cercano.",
      "Si tienes dudas, llama a tu ARS o al consultorio de tu médico. Muchos tienen líneas de orientación.",
      "Ten a mano: documento de identidad, carnet ARS, lista de medicamentos y alergias.",
      "Si estás sola o solo, avisa a tu contacto de emergencia (del perfil ReHub) para que sepa a dónde te llevan.",
    ],
    contactos: [
      { nombre: "Emergencias", tipo: "tel", valor: "911" },
    ],
  },
  nutricion: {
    id: "nutricion",
    titulo: "Necesito orientación sobre alimentación en mi recuperación",
    descripcion: "La alimentación influye en la recuperación. Ideas generales.",
    pasos: [
      "Consulta con tu médico o un nutricionista. Tu caso puede requerir dieta específica.",
      "En general: proteína ayuda a la reparación de tejidos; frutas y verduras dan vitaminas; evita excesos de azúcar y comida procesada.",
      "Si tienes limitaciones para cocinar: opciones de comida a domicilio (PedidosYa), o pide ayuda a familia/vecinos para preparar comidas.",
      "Hidratación: el agua es importante. Ten una botella cerca.",
      "Si no puedes comer bien por dolor o medicación, coméntalo al médico.",
    ],
  },
};

export const SECCIONES_RECURSOS = [
  {
    id: "transporte",
    emoji: "🚗",
    titulo: "Necesito ir a un lugar",
    resumen: "Transporte y cómo desplazarte",
  },
  {
    id: "medicamentos",
    emoji: "💊",
    titulo: "Necesito medicamentos",
    resumen: "Delivery y opciones de farmacia",
  },
  {
    id: "sola",
    emoji: "🤝",
    titulo: "Estoy sola o solo",
    resumen: "Apoyo cuando no tienes quién te ayude",
  },
  {
    id: "apoyoEmocional",
    emoji: "💚",
    titulo: "Necesito apoyo emocional",
    resumen: "Líneas de ayuda y acompañamiento",
  },
  {
    id: "tramites",
    emoji: "📋",
    titulo: "Trámites y documentos",
    resumen: "ARS, SISALRIL, empleador",
  },
  {
    id: "accesibilidad",
    emoji: "🏠",
    titulo: "Accesibilidad en casa",
    resumen: "Adaptaciones en el hogar",
  },
  {
    id: "fisioterapia",
    emoji: "🦿",
    titulo: "Fisioterapia o rehabilitación",
    resumen: "Cómo acceder a sesiones",
  },
  {
    id: "derechosLaborales",
    emoji: "⚖️",
    titulo: "Mis derechos laborales",
    resumen: "Incapacidad, subsidios",
  },
  {
    id: "citaMedica",
    emoji: "📅",
    titulo: "Qué llevar a una cita médica",
    resumen: "Documentos y preparación",
  },
  {
    id: "segundoDiagnostico",
    emoji: "🩺",
    titulo: "Segunda opinión médica",
    resumen: "Otro criterio profesional",
  },
  {
    id: "noEntiendoInforme",
    emoji: "📄",
    titulo: "No entiendo mi informe médico",
    resumen: "Interpretar documentos",
  },
  {
    id: "ayudaPagarMedicamentos",
    emoji: "💵",
    titulo: "Ayuda para pagar medicamentos",
    resumen: "Programas y opciones",
  },
  {
    id: "volverTrabajo",
    emoji: "💼",
    titulo: "Volver al trabajo",
    resumen: "Reintegración laboral",
  },
  {
    id: "miedoConducir",
    emoji: "🚙",
    titulo: "Miedo a salir o conducir",
    resumen: "Después del accidente",
  },
  {
    id: "cuidador",
    emoji: "👩‍⚕️",
    titulo: "Necesito un cuidador",
    resumen: "Atención en casa",
  },
  {
    id: "abrumado",
    emoji: "😓",
    titulo: "Me siento abrumado",
    resumen: "No sé por dónde empezar",
  },
  {
    id: "hablarFamilia",
    emoji: "👨‍👩‍👧",
    titulo: "Hablar con mi familia",
    resumen: "Comunicar mi situación",
  },
  {
    id: "problemasDormir",
    emoji: "😴",
    titulo: "Problemas para dormir",
    resumen: "Mejorar el descanso",
  },
  {
    id: "adaptarTrabajo",
    emoji: "🔧",
    titulo: "Adaptar mi trabajo",
    resumen: "Ajustes y teletrabajo",
  },
  {
    id: "contactarOtros",
    emoji: "👥",
    titulo: "Contactar con otros en recuperación",
    resumen: "Grupos de apoyo",
  },
  {
    id: "asesoriaLegal",
    emoji: "⚖️",
    titulo: "Asesoría legal",
    resumen: "Accidente con terceros",
  },
  {
    id: "dolorCronico",
    emoji: "🩹",
    titulo: "El dolor no me deja",
    resumen: "Dolor persistente",
  },
  {
    id: "emergenciaMedica",
    emoji: "🚨",
    titulo: "¿Es una emergencia?",
    resumen: "Cuándo actuar ya",
  },
  {
    id: "nutricion",
    emoji: "🥗",
    titulo: "Alimentación en recuperación",
    resumen: "Orientación nutricional",
  },
] as const;
