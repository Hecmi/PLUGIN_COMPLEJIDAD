let elements = document.querySelectorAll('*');
let width = document.documentElement.scrollWidth;
let height = document.documentElement.scrollHeight;

let total_area = 0;

// Total de los centroides en los ejes x e y
let total_centroid_x = 0; 
let total_centroid_y =  0;

for (let element of elements) {
    let rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.left < 0) {
        continue;
    }

    let area = rect.width * rect.height;
    total_area += area;

    // Calcular el centroide (centro) del elemento
    let centroid_x = rect.left + rect.width / 2;
    let centroid_y = rect.top + rect.height / 2;

    // Sumar la contribución de este elemento al centroide ponderado
    total_centroid_x += centroid_x * area;
    total_centroid_y += centroid_y * area;
}

// Calcular el centroide total de la página
let balance_centroid_x = total_centroid_x / total_area;
let balance_centroid_y = total_centroid_y / total_area;

// Calcular la distancia del centro de la página (ideal) al centroide total
let center_x = width / 2;
let center_y = height / 2;

let distance_x = Math.abs(balance_centroid_x - center_x);
let distance_y = Math.abs(balance_centroid_y - center_y);

// Mostrar los resultados
console.log(`Centro de la página (ideal): (${center_x}, ${center_y})`);
console.log(`Centroide total de la página: (${balance_centroid_x.toFixed(2)}, ${balance_centroid_y.toFixed(2)})`);
console.log(`Distancia al centro (horizontal): ${distance_x.toFixed(2)}`);
console.log(`Distancia al centro (vertical): ${distance_y.toFixed(2)}`);

let overall_balance = (distance_x + distance_y) / (width + height);
console.log(`Equilibrio total: ${overall_balance.toFixed(4)}`);

if (overall_balance < 0.1) {
    console.log('La página está equilibrada visualmente.');
} else if (overall_balance < 0.3) {
    console.log('La página tiene un equilibrio visual moderado.');
} else {
    console.log('La página tiene un desequilibrio visual significativo.');
}
