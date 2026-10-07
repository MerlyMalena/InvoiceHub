// ==========================================================================
// js/calculations.js - Lógica Matemática y Cálculos del Sistema
// ==========================================================================

// Cálculo del subtotal de una sola fila de producto
function calculateRow(row) {
    const qtyInput = row.querySelector('.product-quantity');
    const priceInput = row.querySelector('.product-price');
    const discountInput = row.querySelector('.product-discount');
    const subtotalInput = row.querySelector('.product-subtotal');

    const quantity = parseFloat(qtyInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    let discountPercent = parseFloat(discountInput.value);
    if (isNaN(discountPercent) || discountPercent < 0) {
        discountPercent = 0;
    }

    // Subtotal bruto = cantidad * precio unitario
    const subtotalBruto = quantity * price;

    // Monto descuento individual = subtotal bruto * descuento individual / 100
    const montoDescuento = subtotalBruto * (discountPercent / 100);

    // Subtotal final de la fila = subtotal bruto - monto descuento individual
    const subtotalFinal = Math.max(0, subtotalBruto - montoDescuento);

    if (subtotalInput) {
        subtotalInput.value = subtotalFinal.toFixed(2);
    }

    return {
        quantity,
        price,
        discountPercent,
        subtotalBruto,
        montoDescuento,
        subtotalFinal
    };
}

// Cálculo de los totales del resumen general
function calculateTotals(rows, currency, isTaxApplied, inputTaxPercent, generalDiscountPercent, applicationOrder) {
    let totalItems = rows.length;
    let sumSubtotalBruto = 0;
    let sumDescuentoProductos = 0;
    const rowDataList = [];

    rows.forEach(row => {
        const data = calculateRow(row);
        rowDataList.push(data);
        sumSubtotalBruto += data.subtotalBruto;
        sumDescuentoProductos += data.montoDescuento;
    });

    // Subtotal después de descuentos individuales
    const subtotalBase = Math.max(0, sumSubtotalBruto - sumDescuentoProductos);

    // Impuesto
    let taxPercent = 0;
    if (isTaxApplied) {
        taxPercent = parseFloat(inputTaxPercent) || 0;
        if (taxPercent < 0) taxPercent = 0;
    }

    let generalDiscount = parseFloat(generalDiscountPercent) || 0;
    if (generalDiscount < 0) generalDiscount = 0;

    let montoDescuentoGeneral = 0;
    let baseImponible = 0;
    let montoImpuesto = 0;
    let totalFinal = 0;

    if (applicationOrder === 'antes') {
        // Regla: Aplicar descuento antes del impuesto
        montoDescuentoGeneral = subtotalBase * (generalDiscount / 100);
        baseImponible = Math.max(0, subtotalBase - montoDescuentoGeneral);
        montoImpuesto = baseImponible * (taxPercent / 100);
        totalFinal = baseImponible + montoImpuesto;
    } else {
        // Regla: Aplicar descuento después del impuesto
        montoImpuesto = subtotalBase * (taxPercent / 100);
        const totalAntesDescuentoGeneral = subtotalBase + montoImpuesto;
        montoDescuentoGeneral = totalAntesDescuentoGeneral * (generalDiscount / 100);
        totalFinal = totalAntesDescuentoGeneral - montoDescuentoGeneral;
    }

    // El total nunca debe ser negativo
    if (totalFinal < 0) {
        totalFinal = 0;
    }

    return {
        totalItems,
        sumSubtotalBruto,
        sumDescuentoProductos,
        subtotalBase,
        montoDescuentoGeneral,
        generalDiscountPercent: generalDiscount,
        montoImpuesto,
        taxPercent,
        totalFinal,
        currency,
        rowDataList
    };
}
