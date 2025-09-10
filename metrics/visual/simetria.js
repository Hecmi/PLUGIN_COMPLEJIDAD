function getLayoutRegions() {
    let elements = [...document.body.getElementsByTagName("*")];
    return elements.map(el => {
        let rect = el.getBoundingClientRect();
        return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
        };
    });
}

function calculateSymmetry(regions) {
    let X = [[0, 0], [0, 0]], Y = [[0, 0], [0, 0]],
        B = [[0, 0], [0, 0]], H = [[0, 0], [0, 0]],
        T = [[0, 0], [0, 0]], R = [[0, 0], [0, 0]];
    
    let frameWidth = window.innerWidth;
    let frameHeight = window.innerHeight;
    let frameCenterX = frameWidth / 2;
    let frameCenterY = frameHeight / 2;
    
    regions.forEach(r => {
        let proportions = [[0, 0], [0, 0]];
        
        let totalArea = r.width * r.height || 1;
        
        // Calcular proporción en cada cuadrante
        // Cuadrante superior izquierdo
        proportions[0][0] = Math.max(0, Math.min(frameCenterX, r.right) - Math.max(0, r.left)) * Math.max(0, Math.min(frameCenterY, r.bottom) - Math.max(0, r.top)) / totalArea;
        // Cuadrante superior derecho
        proportions[0][1] = Math.max(0, Math.min(frameCenterX, r.right) - Math.max(0, r.left)) * Math.max(0, r.bottom - frameCenterY) / totalArea;
        // Cuadrante inferior izquierdo
        proportions[1][0] = Math.max(0, r.right - frameCenterX) * Math.max(0, Math.min(frameCenterY, r.bottom) - Math.max(0, r.top)) / totalArea;
        // Cuadrante inferior derecho
        proportions[1][1] = Math.max(0, r.right - frameCenterX) * Math.max(0, r.bottom - frameCenterY) / totalArea;
        
        // Acumular los valores para cada componente:
        // X e Y corresponden a la distancia horizontal y vertical de cada región con respecto al centro de la pantalla
        // B y H son el alto y ancho del elemento en cada región
        // R es la distancia euclidiana con respecto al centro de la página
        // T es la disstancia total del centro y el elemento
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let proportion = proportions[i][j];
                X[i][j] += proportion * Math.abs(r.centerX - frameCenterX);
                Y[i][j] += proportion * Math.abs(r.centerY - frameCenterY);
                B[i][j] += proportion * r.width;
                H[i][j] += proportion * r.height;
                R[i][j] += proportion * Math.sqrt(Math.pow(r.centerX - frameCenterX, 2) + Math.pow(r.centerY - frameCenterY, 2));
                
                if (r.centerX !== frameCenterX || r.centerY !== frameCenterY) {
                    T[i][j] += proportion * (Math.abs(r.centerY - frameCenterY) + Math.abs(r.centerX - frameCenterX));
                }
            }
        }
    });

    function normalize(matrix) {
        let max = Math.max(...matrix.flat(), 1);
        return matrix.map(row => row.map(value => value / max));
    }

    // [X, Y, B, H, T, R] = [X, Y, B, H, T, R].map(normalize);

    // let SymmetryV = (Math.abs(X[0][0] - X[1][0]) + Math.abs(X[0][1] - X[1][1])) / 12;
    // let SymmetryH = (Math.abs(Y[0][0] - Y[0][1]) + Math.abs(Y[1][0] - Y[1][1])) / 12;
    // let SymmetryR = (Math.abs(R[0][0] - R[1][1]) + Math.abs(R[1][0] - R[0][1])) / 12;

    // Inicializar valores de simetría
    let SymmetryV = 0;
    let SymmetryH = 0;
    let SymmetryR = 0;

    // Aplicar normalización y calcular simetría
    [X, Y, B, H, T, R].forEach(M => {
         // Normalizar cada matriz
        M = normalize(M);

        // Acumular valores de simetría
        SymmetryV += (Math.abs(M[0][0] - M[1][0]) + Math.abs(M[0][1] - M[1][1])) / 12;
        SymmetryH += (Math.abs(M[0][0] - M[0][1]) + Math.abs(M[1][0] - M[1][1])) / 12;
        SymmetryR += (Math.abs(M[0][0] - M[1][1]) + Math.abs(M[1][0] - M[0][1])) / 12;
    });

    
    return (SymmetryV + SymmetryH + SymmetryR) / 3;
}

let regions = getLayoutRegions();
let symmetryScore = calculateSymmetry(regions);

console.log("Valor de simetría:", symmetryScore);

if (symmetryScore < 0.3) {
    console.log("La página es altamente simétrica");
}
else if (symmetryScore < 0.7) {
    console.log("La página esta considerablemente simétrica");
}
else {
    console.log("La página no es simétrica");
}
