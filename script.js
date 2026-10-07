// Referencias a Elementos del DOM
const btnAddProduct = document.getElementById('btn-add-product');
const productsList = document.getElementById('products-list');
const currencySelect = document.getElementById('currency');

// Sección 3: Datos Generales
const documentTypeSelect = document.getElementById('document-type');
const documentStatusSelect = document.getElementById('document-status');

// Sección 5: Impuestos y Descuentos
const applyTaxCheckbox = document.getElementById('apply-tax');
const taxPercentageInput = document.getElementById('tax-percentage');
const generalDiscountInput = document.getElementById('general-discount');
const discountApplicationSelect = document.getElementById('discount-application');

// Sección 6: Resumen de Cálculos
const summaryItemsCount = document.getElementById('summary-items-count');
const summaryGrossSubtotal = document.getElementById('summary-gross-subtotal');
const summaryProductDiscounts = document.getElementById('summary-product-discounts');
const summarySubtotalAfterDiscounts = document.getElementById('summary-subtotal-after-discounts');
const summaryGeneralDiscount = document.getElementById('summary-general-discount');
const summaryTax = document.getElementById('summary-tax');
const summaryFinalTotal = document.getElementById('summary-final-total');

// Formatear montos con moneda y dos decimales
function formatMoney(amount, currency) {
    const num = Number(amount) || 0;
    const formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${currency} ${formatted}`;
}

// Adaptar las opciones de Estado según Tipo de Documento (DOM Puro)
function updateStatusOptions() {
    const type = documentTypeSelect.value;
    const currentStatus = documentStatusSelect.value;

    documentStatusSelect.replaceChildren();

    let options = [];
    if (type === 'Cotización') {
        options = ['Pendiente', 'Aprobada', 'Rechazada'];
    } else {
        options = ['Pendiente', 'Pagada'];
    }

    options.forEach(optVal => {
        const option = document.createElement('option');
        option.value = optVal;
        option.textContent = optVal;
        if (optVal === currentStatus) {
            option.selected = true;
        }
        documentStatusSelect.appendChild(option);
    });

    if (!options.includes(currentStatus)) {
        documentStatusSelect.value = options[0];
    }
}

// Función auxiliar para crear celdas de inputs sin innerHTML
function createInputCell(type, name, className, attrs = {}, withError = true) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.className = className;
    Object.assign(input, attrs);
    td.appendChild(input);

    if (withError) {
        const span = document.createElement('span');
        span.className = 'error-message';
        td.appendChild(span);
    }
    return td;
}

// Crear nueva fila de producto
function createProductRow() {
    const tr = document.createElement('tr');
    tr.className = 'product-row';

    const tdDesc = createInputCell('text', 'product_description', 'product-description', { placeholder: 'Descripción', required: true });
    const tdQty = createInputCell('number', 'product_quantity', 'product-quantity', { min: 1, step: 1, value: 1, required: true });
    const tdPrice = createInputCell('number', 'product_price', 'product-price', { min: 0.01, step: '0.01', placeholder: '0.00', required: true });
    const tdDiscount = createInputCell('number', 'product_discount', 'product-discount', { min: 0, max: 100, step: '0.01', value: 0 });
    const tdSubtotal = createInputCell('text', 'product_subtotal', 'product-subtotal', { value: '0.00', readOnly: true }, false);

    const tdAction = document.createElement('td');
    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'btn-delete-row';
    btnDelete.textContent = 'Eliminar';
    tdAction.appendChild(btnDelete);

    tr.append(tdDesc, tdQty, tdPrice, tdDiscount, tdSubtotal, tdAction);
    return tr;
}

// Cálculo del subtotal por producto
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

    const subtotalBruto = quantity * price;
    const montoDescuento = subtotalBruto * (discountPercent / 100);
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

// Cálculo del resumen general
function updateSummary() {
    const currency = currencySelect.value;
    const rows = productsList.querySelectorAll('.product-row');

    let totalItems = rows.length;
    let sumSubtotalBruto = 0;
    let sumDescuentoProductos = 0;

    rows.forEach(row => {
        const data = calculateRow(row);
        sumSubtotalBruto += data.subtotalBruto;
        sumDescuentoProductos += data.montoDescuento;
    });

    const subtotalBase = Math.max(0, sumSubtotalBruto - sumDescuentoProductos);

    let generalDiscountPercent = parseFloat(generalDiscountInput.value);
    if (isNaN(generalDiscountPercent) || generalDiscountPercent < 0) {
        generalDiscountPercent = 0;
    }

    let taxPercent = 0;
    if (applyTaxCheckbox.checked) {
        taxPercent = parseFloat(taxPercentageInput.value) || 0;
        if (taxPercent < 0) taxPercent = 0;
    }

    const applicationOrder = discountApplicationSelect.value;
    let montoDescuentoGeneral = 0;
    let montoImpuesto = 0;
    let totalFinal = 0;

    if (applicationOrder === 'antes') {
        montoDescuentoGeneral = subtotalBase * (generalDiscountPercent / 100);
        const baseImponible = Math.max(0, subtotalBase - montoDescuentoGeneral);
        montoImpuesto = baseImponible * (taxPercent / 100);
        totalFinal = baseImponible + montoImpuesto;
    } else {
        montoImpuesto = subtotalBase * (taxPercent / 100);
        const totalAntesDescuentoGeneral = subtotalBase + montoImpuesto;
        montoDescuentoGeneral = totalAntesDescuentoGeneral * (generalDiscountPercent / 100);
        totalFinal = totalAntesDescuentoGeneral - montoDescuentoGeneral;
    }

    if (totalFinal < 0) totalFinal = 0;

    summaryItemsCount.textContent = totalItems.toString();
    summaryGrossSubtotal.textContent = formatMoney(sumSubtotalBruto, currency);
    summaryProductDiscounts.textContent = formatMoney(sumDescuentoProductos, currency);
    summarySubtotalAfterDiscounts.textContent = formatMoney(subtotalBase, currency);
    summaryGeneralDiscount.textContent = formatMoney(montoDescuentoGeneral, currency);
    summaryTax.textContent = formatMoney(montoImpuesto, currency);
    summaryFinalTotal.textContent = formatMoney(totalFinal, currency);

    return {
        sumSubtotalBruto,
        sumDescuentoProductos,
        subtotalBase,
        montoDescuentoGeneral,
        montoImpuesto,
        totalFinal
    };
}

// Manejar checkbox de impuesto
function handleTaxCheckbox() {
    if (applyTaxCheckbox.checked) {
        taxPercentageInput.disabled = false;
        taxPercentageInput.required = true;
        taxPercentageInput.focus();
    } else {
        taxPercentageInput.value = '';
        taxPercentageInput.disabled = true;
        taxPercentageInput.required = false;
    }
    updateSummary();
}

// Event Listeners
documentTypeSelect.addEventListener('change', updateStatusOptions);

btnAddProduct.addEventListener('click', () => { 
    const newRow = createProductRow();
    productsList.appendChild(newRow);
    updateSummary();
});

productsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-delete-row')) {
        const rows = productsList.querySelectorAll('.product-row');
        if (rows.length <= 1) {
            alert('Debe existir al menos un producto o servicio en la cotización o factura.');
            return;
        }
        const row = event.target.closest('.product-row');
        if (row) {
            productsList.removeChild(row);
            updateSummary();
        }
    }
});

productsList.addEventListener('input', (event) => {
    const target = event.target;
    if (target.classList.contains('product-quantity') ||
        target.classList.contains('product-price') ||
        target.classList.contains('product-discount')) {
        const row = target.closest('.product-row');
        if (row) {
            calculateRow(row);
            updateSummary();
        }
    }
});

applyTaxCheckbox.addEventListener('change', handleTaxCheckbox);
taxPercentageInput.addEventListener('input', updateSummary);
generalDiscountInput.addEventListener('input', updateSummary);
discountApplicationSelect.addEventListener('change', updateSummary);
currencySelect.addEventListener('change', updateSummary);

// Inicializar al cargar
updateStatusOptions();
handleTaxCheckbox();
updateSummary();