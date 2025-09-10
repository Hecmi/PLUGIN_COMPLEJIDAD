let width = Math.max(
    document.documentElement.scrollWidth, 
    document.body.scrollWidth,
    document.documentElement.clientWidth
);

let height = Math.max(
    document.documentElement.scrollHeight, 
    document.body.scrollHeight,
    document.documentElement.clientHeight
);

// Ajuste de colores a la percepción del ojo humano
// https://www.color.org/srgb04.xalter
const sRGB_constraint = 0.04045

function isLargeText(element_style) {
    const fontSize = parseInt(element_style.fontSize, 10);
    const isBold = element_style.fontWeight === "bold";

    // Verificar si el tamaño de la fuente es mayor o igual a 18px o si es 14px y está en negrita
    return (fontSize >= 18 || (fontSize >= 14 && isBold));
}

function is_inside(top, bottom, left, right, w, h) {
    return (top >= 0 && left >= 0 && bottom <= h && right <= w);
}

// 
function luminance(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    r = (r <= sRGB_constraint) ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = (g <= sRGB_constraint) ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = (b <= sRGB_constraint) ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Ajuste de colores a como los percibe el ojo humano siguiendo el sRGB (prioriza el color verde)
    // UIT-R BT.709 (Signal format):  
    // https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.2087-0-201510-I!!PDF-S.pdf
    // https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(color1, color2) {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;

    // Calcular la luminicidad de ambos colores
    const L1 = luminance(r1, g1, b1);
    const L2 = luminance(r2, g2, b2);

    // Asegurarse que L1 es el color más claro y L2 es el más oscuro
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    
    // Calcular el radio de contraste
    return (lighter + 0.05) / (darker + 0.05);
}

function rgbToArray(rgbString) {
    const result = rgbString.match(/\d+/g);
    return result ? result.map(Number) : [0, 0, 0];
}

function getAverageColor(canvas, rect) {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(rect.left, rect.top, rect.width, rect.height);
    const pixels = imgData.data;

    let r = 0, g = 0, b = 0;
    let pixelCount = 0;

    // Recorrer todos los píxeles de la imágen
    for (let i = 0; i < pixels.length; i += 4) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];

        pixelCount++;
    }

    // Calcular el color promedio
    return [r / pixelCount, g / pixelCount, b / pixelCount];
}

function evaluateTextContrast(canvas) {
    let elements = document.querySelectorAll('*');
    let valid_elements = 0;
    let total_elements = 0;
    
    for (let element of elements) {

        if (!element.innerText) continue;

        // Solo considerar los elementos que tienen texto
        if (element.innerText.trim() !== '') {
            const rect = element.getBoundingClientRect();

            if (rect.width == 0 || rect.height == 0 || !is_inside(rect.top, rect.bottom, rect.left, rect.right, width, height)) continue;
            
            total_elements++;

            // Obtener el color del texto
            const style = window.getComputedStyle(element);
            const textColor = rgbToArray(style.color);

            // Obtener el color promedio del fondo (El mismo que se encuentra ubicado como fondo del texto)
            const bgColor = getAverageColor(canvas, rect);

            // Calcular el radio de contraste entre el color del texto y el fondo
            const contrast = contrastRatio(textColor, bgColor);
            
            // En caso que el contraste sea igual a 21, significa que la la luminicidad entre los
            // colores es un blanco contra un negro puro. Es decir, es el contraste máximo
            // https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
            if (contrast >= 21) {
                valid_elements++;
                continue;
            }

            const is_large_text = isLargeText(style);

            // WCAG requirements:
            // https://www.w3.org/TR/WCAG21/#contrast-minimum
            // https://www.w3.org/TR/WCAG21/#contrast-enhanced
            if (is_large_text && contrast >= 3 || !is_large_text && contrast >= 4.5) {
                valid_elements++;
            }
        }
    }

    let contrast = valid_elements/total_elements;
    console.log("Contraste promedio = ", contrast);

    if (contrast > 0.7) {
        console.log("Buen nivel de contraste");
    } else if (contrast > 0.4) {
        console.log("Nivel de contraste aceptable");
    } else {
        console.log("Bajo nivel de contraste")
    }
}

const canvas = document.createElement("canvas");
canvas.id = "myCanvas";

canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "9999";

// document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

// Injection of the html2canvas library to get the image
const script = document.createElement('script');
script.type = "text/javascript";
script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js' 
//'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

script.onload = function() {
    document.body.appendChild(canvas);
    canvas.style.display = 'block';
    canvas.style.marginTop = '0px';

    // Capture the page
    html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        crossOrigin: "anonymous",
        scale: 1,
        onerror: function(e) {
            console.warn("CORS error encountered:", e);
            return true;
        }
    }).then(function(captured_canvas) {
        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas
        ctx.drawImage(captured_canvas, 0, 0);

        // Evaluate contrast of text elements
        evaluateTextContrast(captured_canvas);

    }).catch(function(error) {
        console.error("Error capturing the page:", error);
    });
};


document.body.appendChild(script);
