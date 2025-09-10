// Función para preprocessa el texto para obtener palabras relevantes, 
// eliminando ruido y palabras vacías
function preprocessText(text, stopwords = new Set()) {
  // Normalizar el texto a minúsculas y descomponerlo
  text = text.toLowerCase().normalize("NFKD").replace(/[\p{P}\p{S}]/gu, '');

  // Dividir el texto en palabras usando espacios
  // Eliminar palabras de menos de 3 caracteres y stopwords
  // Limpiar espacios en cada palabra
  const words = text.split(/\s+/u)
    .filter(word => word.length > 2 && !stopwords.has(word))
    .map(word => word.trim()); 
  
    return words;
}

// Dividir el texto en oraciones para la extracción de frases clave
function splitSentences(text) {
  // Identificar finales de oración (puntos, exclamaciones, interrogaciones)
  //const sentenceEndings = /[!?.]+(?:\s|$)/gu;
  //const sentenceEndings = /(?<=[.!?])(?=\s*[A-ZÁÉÍÓÚÑ])/gu
  const sentenceEndings = /(?<=[.!?])\s*/gu

  // Dividir el texto, limpiar espacios y filtra oraciones vacías
  // Eliminar espacios al inicio y final de cada oración
  // Excluir oraciones vacías
  return text.split(sentenceEndings)
    .map(s => s.trim()) 
    .filter(s => s.length > 0);
}

// Construir el grafo de co-ocurrencia (Nodos: palabras, aristas: relaciones dentro de una ventana)
function buildGraph(words, windowSize = 4) {
  const graph = {};
  const wordSet = new Set(words);

  // Inicializar cada palabra como un nodo con puntaje inicial y un objeto para aristas
  // Donde: score: puntaje inicial, edges: conexiones con otras palabras
  wordSet.forEach(word => {
    graph[word] = { score: 1, edges: {} };
  });

  // Crear aristas basadas en la co-ocurrencia dentro de la ventana de texto
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < Math.min(i + windowSize, words.length); j++) {
      const word1 = words[i]; // Palabra actual
      const word2 = words[j]; // Palabra dentro de la ventana
      if (word1 !== word2) { 
        // Incrementa el peso de la arista bidireccional entre el par de palabras
        graph[word1].edges[word2] = (graph[word1].edges[word2] || 0) + 1;
        graph[word2].edges[word1] = (graph[word2].edges[word1] || 0) + 1;
      }
    }
  }

  return graph;
}

// Aplicar el algoritmo TextRank para calcular puntajes de importancia de cada palabra
function textRank(graph, dampingFactor = 0.85, maxIterations = 100, threshold = 0.0001) {
    // Variable para almacenar los puntajes actuales de cada palabra
    let scores = {};

    // Almacenar los puntajes de la iteración anterior
    let previousScores = {}; 

    // Inicializar puntajes en 1.0 para todas las palabras
    Object.keys(graph).forEach(word => {
        scores[word] = 1.0;
    });

    // Itera hasta convergencia o máximo de iteraciones
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let maxChange = 0; // Seguimiento del cambio máximo para verificar convergencia

        // Actualiza el puntaje de cada palabra
        Object.keys(graph).forEach(word => {
            let sumScores = 0;

            // Iterar sobre los vecinos de la palabra actual
            Object.keys(graph[word].edges).forEach(neighbor => {
                // Peso de la arista al vecino
                const weight = graph[word].edges[neighbor]; 

                // Sumar los pesos de todas las aristas del vecino (para normalización)
                const neighborEdgesSum = Object.values(graph[neighbor].edges).reduce((sum, val) => sum + val, 0) || 1;

                // Agregar la contribución del vecino al puntaje
                sumScores += (weight / neighborEdgesSum) * scores[neighbor];
            });

            // Guardar el puntaje anterior
            previousScores[word] = scores[word]; 

            // Aplicar la fórmula de TextRank: (1-d) + d * suma de contribuciones
            scores[word] = (1 - dampingFactor) + dampingFactor * sumScores;

            // Calcular el cambio máximo para verificar su convergencia
            maxChange = Math.max(maxChange, Math.abs(scores[word] - previousScores[word]));
        });

        // Detener si los puntajes convergen
        if (maxChange < threshold) {
            break;
        }
    }

    return scores;
}

// Funcón para extraer las palabras clave relevantes basadas en los puntajes del algoritmo
function extractKeywords(text, options = {}) {
  // Configurar opciones por defecto y personalizadas
  const {
    stopwords = new Set(), 
    topN = 5,                   // Número de palabras clave a retornar
    windowSize = 4              // Tamaño de la ventana de co-ocurrencia
  } = options;

  // 1. Preprocesar el texto
  const words = preprocessText(text, stopwords); 

  // Retornar lista vacía si no hay palabras válidas
  if (words.length === 0) return []; 

  // 2. Construir el grafo
  const graph = buildGraph(words, windowSize);

  // 3. Calcular puntajes
  const scores = textRank(graph); 

  // 4. Ordenar palabras por puntaje y selecciona las top N
  // Ordenar descendentemente por puntaje
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1]) 
    .slice(0, topN)
    .map(([word, score]) => ({ word, score }));
}

// Extraer las frases relevantes
function extractKeyPhrases(text, options = {}) {
  const {
    stopwords = new Set(),
    topN = 3,       // Número de frases clave a retornar
    windowSize = 4 // Tamaño de la ventana de co-ocurrencia
  } = options;

  // Segmentar las oraciones
  const sentences = splitSentences(text); 
  // Preprocesar el texto completo
  const words = preprocessText(text, stopwords); 
  if (words.length === 0 || sentences.length === 0) return []; 

   // Construir el grafo
  const graph = buildGraph(words, windowSize);

  // Calcular los puntajes de palabras
  const wordScores = textRank(graph); 

  // Obtener la puntuación cada oración basado en los puntajes de sus palabras
  const sentenceScores = sentences.map(sentence => {
    // Preprocesar las palabras de la oración
    const sentenceWords = preprocessText(sentence, stopwords); 

    // Calcular el puntaje promedio de la oración
    const score = sentenceWords.reduce((sum, word) => sum + (wordScores[word] || 0), 0)// / (sentenceWords.length || 1);
    return { sentence, score };
  });

  // Ordenar oraciones por puntaje y selecciona las topN
  return sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, topN) 
    .map(({ sentence, score }) => ({ sentence, score }));
}

class TextRank {
  // Constructor que inicializa opciones configurables
  constructor(options = {}) {
    this.options = {
      stopwords: new Set(), // Palabras vacías personalizables
      topNKeywords: 5,      // Número de palabras clave a extraer
      topNPhrases: 3,       // Número de frases clave a extraer
      windowSize: 4,        // Tamaño de la ventana de co-ocurrencia
      dampingFactor: 0.85,  // Factor de amortiguación para TextRank
      maxIterations: 100,   // Máximo de iteraciones para convergencia
      threshold: 0.0001,    // Umbral de convergencia
      ...options            // Sobrescribir con opciones personalizadas
    };
  }

  // Extraer palabras usando las opciones configuradas
  extractKeywords(text) {
    return extractKeywords(text, {
      stopwords: this.options.stopwords,
      topN: this.options.topNKeywords,
      windowSize: this.options.windowSize
    });
  }

  // Extraer frases usando las opciones configuradas
  extractKeyPhrases(text) {
    return extractKeyPhrases(text, {
      stopwords: this.options.stopwords,
      topN: this.options.topNPhrases,
      windowSize: this.options.windowSize
    });
  }

  // Procesar el texto y retorna palabras clave y frases clave
  process(text) {
    // Obtener las palabras importantes
    const keywords = this.extractKeywords(text); 

    // Obtener las frases importantes
    const keyPhrases = this.extractKeyPhrases(text);

    return { keywords, keyPhrases };
  }
}