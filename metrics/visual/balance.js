let elements = document.querySelectorAll('*');
let width = document.documentElement.scrollWidth;
let height = document.documentElement.scrollHeight;

let half_width = width / 2;
let half_height = height / 2;

let total_area = 0;
let left_area = 0;
let right_area = 0;
let top_area = 0;
let bottom_area = 0;

for (let element of elements) {
    let rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.left < 0) {
        continue;
    }

    let area = rect.width * rect.height;
    total_area += area;

    // Segmentar el balance horizontalmente (izquierda y derecha)
    let overlap_left = Math.max(0, Math.min(rect.right, half_width) - rect.left);
    let overlap_right = Math.max(0, Math.min(rect.right, width) - Math.max(rect.left, half_width));

    // Segmenetar el balance verticalmente (arriba y abajo)
    let overlap_top = Math.max(0, Math.min(rect.bottom, half_height) - rect.top);
    let overlap_bottom = Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, half_height));

    // Incrementar el área correspondiente a cada sector
    left_area += area * (overlap_left / rect.width);
    right_area += area * (overlap_right / rect.width);
    top_area += area * (overlap_top / rect.height);
    bottom_area += area * (overlap_bottom / rect.height);
}

let horizontal_balance = Math.abs(left_area - right_area) / total_area;
let vertical_balance = Math.abs(top_area - bottom_area) / total_area;

let balance = (horizontal_balance + vertical_balance) / 2;

console.log(`Área total de la página: ${total_area}`);
console.log(`Área en la mitad izquierda: ${left_area}`);
console.log(`Área en la mitad derecha: ${right_area}`);
console.log(`Área en la mitad superior: ${top_area}`);
console.log(`Área en la mitad inferior: ${bottom_area}`);

console.log(`Balance visual horizontal: ${horizontal_balance.toFixed(4)}`);
console.log(`Balance visual vertical: ${vertical_balance.toFixed(4)}`);
console.log(`Balance promedio: ${balance.toFixed(4)}`);

// if (horizontal_balance < 0.2) {
//     console.log('La página está bien balanceada horizontalmente.');
// } else if (horizontal_balance < 0.5) {
//     console.log('La página tiene un balance visual horizontal moderado.');
// } else {
//     console.log('La página tiene un desequilibrio visual horizontal significativo.');
// }

// if (vertical_balance < 0.2) {
//     console.log('La página está bien balanceada verticalmente.');
// } else if (vertical_balance < 0.5) {
//     console.log('La página tiene un balance visual vertical moderado.');
// } else {
//     console.log('La página tiene un desequilibrio visual vertical significativo.');
// }

if (balance < 0.2) {
    console.log('La página está bien balanceada.');
} else if (balance < 0.5) {
    console.log('La página tiene un balance visual moderado.');
} else {
    console.log('La página tiene un desequilibrio visual significativo.');
}
