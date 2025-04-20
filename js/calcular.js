// Función para recuperar el nombre de usuario guardado en el login
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el nombre de usuario del localStorage (configurado en login.html)
    const storedUsername = localStorage.getItem('guestUsername');
    if (storedUsername) {
        document.getElementById('username').textContent = storedUsername;
    }
    
    // Configurar el evento para el botón de cálculo
    document.getElementById('calculateBtn').addEventListener('click', calculateResult);
    
    // También permitir el cálculo al presionar Enter en cualquiera de los campos
    const inputFields = [
        document.getElementById('previousRow'),
        document.getElementById('newRow'),
        document.getElementById('multiplier')
    ];
    
    inputFields.forEach(field => {
        field.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                calculateResult();
            }
        });
    });
});

/**
 * Parsea una cadena que representa un número entero o una fracción
 * @param {string} fractionStr - Cadena con formato "a" o "a/b"
 * @returns {Object} Objeto con numerador y denominador
 */
function parseFraction(fractionStr) {
    // Si es un número entero
    if (!fractionStr.includes('/')) {
        return {
            numerator: parseInt(fractionStr),
            denominator: 1
        };
    }
    
    // Si es una fracción
    const parts = fractionStr.split('/');
    return {
        numerator: parseInt(parts[0]),
        denominator: parseInt(parts[1])
    };
}

/**
 * Calcula el máximo común divisor de dos números
 * @param {number} a - Primer número
 * @param {number} b - Segundo número
 * @returns {number} El MCD de a y b
 */
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

/**
 * Simplifica una fracción a su mínima expresión
 * @param {number} numerator - Numerador
 * @param {number} denominator - Denominador
 * @returns {Object} Fracción simplificada
 */
function simplifyFraction(numerator, denominator) {
    if (numerator === 0) return { numerator: 0, denominator: 1 };
    
    // Si el denominador es negativo, pasamos el signo al numerador
    if (denominator < 0) {
        numerator = -numerator;
        denominator = -denominator;
    }
    
    const divisor = gcd(numerator, denominator);
    return {
        numerator: numerator / divisor,
        denominator: denominator / divisor
    };
}

/**
 * Formatea una fracción como string
 * @param {Object} fraction - Objeto con numerador y denominador
 * @returns {string} Representación como string de la fracción
 */
function formatFraction(fraction) {
    // Si el denominador es 1, mostrar como entero
    if (fraction.denominator === 1) {
        return fraction.numerator.toString();
    }
    
    // En caso contrario, mostrar como fracción
    return `${fraction.numerator}/${fraction.denominator}`;
}

/**
 * Realiza la operación principal: fila_anterior - multiplicador * nueva_fila
 */
function calculateResult() {
    const validationMsg = document.getElementById('validationMessage');
    const resultBox = document.getElementById('result');
    
    // Limpiar mensajes anteriores
    validationMsg.textContent = '';
    
    try {
        // Obtener valores de los inputs
        const previousRowStr = document.getElementById('previousRow').value.trim();
        const newRowStr = document.getElementById('newRow').value.trim();
        const multiplierStr = document.getElementById('multiplier').value.trim();
        
        // Validar que no estén vacíos
        if (!previousRowStr || !newRowStr || !multiplierStr) {
            validationMsg.textContent = 'Por favor, completa todos los campos';
            return;
        }
        
        // Dividir los vectores en sus componentes
        const previousRowParts = previousRowStr.split(/\s+/);
        const newRowParts = newRowStr.split(/\s+/);
        
        // Validar que los vectores tengan la misma longitud
        if (previousRowParts.length !== newRowParts.length) {
            validationMsg.textContent = 'Fila anterior y nueva fila deben tener misma longitud';
            return;
        }
        
        // Parsear el multiplicador
        const multiplier = parseFraction(multiplierStr);
        
        // Parsear los vectores
        const previousRow = previousRowParts.map(parseFraction);
        const newRow = newRowParts.map(parseFraction);
        
        // Realizar el cálculo: fila_anterior - multiplicador * nueva_fila
        const result = previousRow.map((prevFrac, index) => {
            const newFrac = newRow[index];
            
            // Multiplicar: multiplicador * nueva_fila
            const prodNumerator = multiplier.numerator * newFrac.numerator;
            const prodDenominator = multiplier.denominator * newFrac.denominator;
            
            // Restar: fila_anterior - (multiplicador * nueva_fila)
            // Para restar fracciones, necesitamos un común denominador
            const commonDenom = prevFrac.denominator * prodDenominator;
            const prevNumeratorScaled = prevFrac.numerator * prodDenominator;
            const prodNumeratorScaled = prodNumerator * prevFrac.denominator;
            
            const resultNumerator = prevNumeratorScaled - prodNumeratorScaled;
            const resultDenominator = commonDenom;
            
            // Simplificar la fracción resultante
            return simplifyFraction(resultNumerator, resultDenominator);
        });
        
        // Mostrar el resultado
        const resultStr = result.map(formatFraction).join(' ');
        resultBox.textContent = resultStr;
        
        // Aplicar efecto visual para destacar el resultado
        resultBox.classList.add('result-highlight');
        setTimeout(() => {
            resultBox.classList.remove('result-highlight');
        }, 500);
        
    } catch (error) {
        validationMsg.textContent = 'Error en el cálculo. Verifica el formato de los datos.';
        console.error('Error:', error);
    }
}