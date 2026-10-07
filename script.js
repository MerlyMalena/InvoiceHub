// Referencias a Elementos del DOM
const invoiceForm = document.getElementById('invoice-form');

// Sección 1: Datos del Negocio
const businessNameInput = document.getElementById('business-name');
const businessRncInput = document.getElementById('business-rnc');
const businessPhoneInput = document.getElementById('business-phone');
const businessEmailInput = document.getElementById('business-email');
const businessAddressInput = document.getElementById('business-address');
const businessLogoInput = document.getElementById('business-logo');

// Sección 2: Datos del Cliente
const clientNameInput = document.getElementById('client-name');
const clientRncInput = document.getElementById('client-rnc');
const clientPhoneInput = document.getElementById('client-phone');
const clientEmailInput = document.getElementById('client-email');
const clientAddressInput = document.getElementById('client-address');

// Sección 3: Datos Generales
const documentTypeSelect = document.getElementById('document-type');
const documentNumberInput = document.getElementById('document-number');
const issueDateInput = document.getElementById('issue-date');
const dueDateInput = document.getElementById('due-date');
const documentStatusSelect = document.getElementById('document-status');
const currencySelect = document.getElementById('currency');

// Sección 4: Productos o Servicios
const btnAddProduct = document.getElementById('btn-add-product');
const productsList = document.getElementById('products-list');
const errorProductsTable = document.getElementById('error-products-table');

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

// ==========================================================================
// UTILIDADES Y MANEJO DE ERRORES
// ==========================================================================

function formatMoney(amount, currency) {
    const num = Number(amount) || 0;
    const formatted = num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${currency} ${formatted}`;
}

function clearError(inputElement, errorSpanId) {
    if (inputElement) {
        inputElement.classList.remove('input-error');
    }
    let span = null;
    if (errorSpanId) {
        span = document.getElementById(errorSpanId);
    } else if (inputElement) {
        const parent = inputElement.parentElement;
        if (parent) {
            span = parent.querySelector('.error-message');
        }
    }
    if (span) {
        span.textContent = '';
    }
}

function setError(inputElement, errorSpanId, message) {
    if (inputElement) {
        inputElement.classList.add('input-error');
    }
    let span = null;
    if (errorSpanId) {
        span = document.getElementById(errorSpanId);
    } else if (inputElement) {
        const parent = inputElement.parentElement;
        if (parent) {
            span = parent.querySelector('.error-message');
        }
    }
    if (span) {
        span.textContent = message;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function isValidUrl(urlString) {
    try {
        const url = new URL(urlString.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// ==========================================================================
// CREACIÓN DINÁMICA DE FILAS (DOM Puro)
// ==========================================================================

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

// ==========================================================================
// CÁLCULOS
// ==========================================================================

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

// Adaptar opciones de Estado
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
        clearError(taxPercentageInput, 'error-tax-percentage');
    }
    updateSummary();
}

// ==========================================================================
// VALIDACIONES GENERALES
// ==========================================================================

function validateForm() {
    let isValid = true;

    // Negocio
    if (!businessNameInput.value.trim()) {
        setError(businessNameInput, 'error-business-name', 'Debe ingresar el nombre del negocio.');
        isValid = false;
    } else {
        clearError(businessNameInput, 'error-business-name');
    }

    if (!businessRncInput.value.trim()) {
        setError(businessRncInput, 'error-business-rnc', 'El RNC o identificación del negocio es requerido.');
        isValid = false;
    } else {
        clearError(businessRncInput, 'error-business-rnc');
    }

    if (!businessPhoneInput.value.trim()) {
        setError(businessPhoneInput, 'error-business-phone', 'El teléfono del negocio es requerido.');
        isValid = false;
    } else {
        clearError(businessPhoneInput, 'error-business-phone');
    }

    if (!businessEmailInput.value.trim()) {
        setError(businessEmailInput, 'error-business-email', 'El correo electrónico del negocio es requerido.');
        isValid = false;
    } else if (!isValidEmail(businessEmailInput.value)) {
        setError(businessEmailInput, 'error-business-email', 'Debe ingresar un correo electrónico válido.');
        isValid = false;
    } else {
        clearError(businessEmailInput, 'error-business-email');
    }

    if (!businessAddressInput.value.trim()) {
        setError(businessAddressInput, 'error-business-address', 'La dirección del negocio es requerida.');
        isValid = false;
    } else {
        clearError(businessAddressInput, 'error-business-address');
    }

    if (businessLogoInput.value.trim() && !isValidUrl(businessLogoInput.value)) {
        setError(businessLogoInput, 'error-business-logo', 'Si se ingresa URL del logo, debe tener formato de URL válido.');
        isValid = false;
    } else {
        clearError(businessLogoInput, 'error-business-logo');
    }

    // Cliente
    if (!clientNameInput.value.trim()) {
        setError(clientNameInput, 'error-client-name', 'Debe ingresar el nombre del cliente.');
        isValid = false;
    } else {
        clearError(clientNameInput, 'error-client-name');
    }

    if (!clientRncInput.value.trim()) {
        setError(clientRncInput, 'error-client-rnc', 'La identificación o RNC del cliente es requerida.');
        isValid = false;
    } else {
        clearError(clientRncInput, 'error-client-rnc');
    }

    if (!clientPhoneInput.value.trim()) {
        setError(clientPhoneInput, 'error-client-phone', 'El teléfono del cliente es requerido.');
        isValid = false;
    } else {
        clearError(clientPhoneInput, 'error-client-phone');
    }

    if (!clientEmailInput.value.trim()) {
        setError(clientEmailInput, 'error-client-email', 'El correo electrónico del cliente es requerido.');
        isValid = false;
    } else if (!isValidEmail(clientEmailInput.value)) {
        setError(clientEmailInput, 'error-client-email', 'Debe ingresar un correo electrónico válido.');
        isValid = false;
    } else {
        clearError(clientEmailInput, 'error-client-email');
    }

    if (!clientAddressInput.value.trim()) {
        setError(clientAddressInput, 'error-client-address', 'La dirección del cliente es requerida.');
        isValid = false;
    } else {
        clearError(clientAddressInput, 'error-client-address');
    }

    // Generales
    if (!documentTypeSelect.value) {
        setError(documentTypeSelect, 'error-document-type', 'El tipo de documento es requerido.');
        isValid = false;
    } else {
        clearError(documentTypeSelect, 'error-document-type');
    }

    if (!documentNumberInput.value.trim()) {
        setError(documentNumberInput, 'error-document-number', 'El número de documento es requerido.');
        isValid = false;
    } else {
        clearError(documentNumberInput, 'error-document-number');
    }

    const issueVal = issueDateInput.value;
    const dueVal = dueDateInput.value;

    if (!issueVal) {
        setError(issueDateInput, 'error-issue-date', 'La fecha de emisión es requerida.');
        isValid = false;
    } else {
        clearError(issueDateInput, 'error-issue-date');
    }

    if (!dueVal) {
        setError(dueDateInput, 'error-due-date', 'La fecha de vencimiento es requerida.');
        isValid = false;
    } else if (issueVal && dueVal < issueVal) {
        setError(dueDateInput, 'error-due-date', 'La fecha de vencimiento no puede ser menor que la fecha de emisión.');
        isValid = false;
    } else {
        clearError(dueDateInput, 'error-due-date');
    }

    if (!documentStatusSelect.value) {
        setError(documentStatusSelect, 'error-document-status', 'El estado es requerido.');
        isValid = false;
    } else {
        clearError(documentStatusSelect, 'error-document-status');
    }

    if (!currencySelect.value) {
        setError(currencySelect, 'error-currency', 'La moneda es requerida.');
        isValid = false;
    } else {
        clearError(currencySelect, 'error-currency');
    }

    // Productos
    const rows = productsList.querySelectorAll('.product-row');
    if (rows.length === 0) {
        setError(null, 'error-products-table', 'Debe agregar al menos un producto o servicio válido.');
        isValid = false;
    } else {
        clearError(null, 'error-products-table');
    }

    rows.forEach(row => {
        const descInput = row.querySelector('.product-description');
        const qtyInput = row.querySelector('.product-quantity');
        const priceInput = row.querySelector('.product-price');
        const discountInput = row.querySelector('.product-discount');

        if (!descInput.value.trim()) {
            setError(descInput, null, 'Debe ingresar una descripción.');
            isValid = false;
        } else {
            clearError(descInput);
        }

        const qtyNum = Number(qtyInput.value);
        if (qtyInput.value === '' || isNaN(qtyNum) || !Number.isInteger(qtyNum) || qtyNum <= 0) {
            setError(qtyInput, null, 'La cantidad debe ser un número entero mayor que cero. No se permiten cantidades decimales.');
            isValid = false;
        } else {
            clearError(qtyInput);
        }

        const priceNum = Number(priceInput.value);
        if (priceInput.value === '' || isNaN(priceNum) || priceNum <= 0) {
            setError(priceInput, null, 'El precio unitario debe ser mayor que cero.');
            isValid = false;
        } else {
            clearError(priceInput);
        }

        const discountVal = discountInput.value.trim();
        if (discountVal !== '') {
            const discountNum = Number(discountVal);
            if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
                setError(discountInput, null, 'El descuento individual debe estar entre 0 y 100.');
                isValid = false;
            } else {
                clearError(discountInput);
            }
        } else {
            clearError(discountInput);
        }
    });

    // Impuestos y Descuentos
    if (applyTaxCheckbox.checked) {
        const taxVal = taxPercentageInput.value.trim();
        if (taxVal === '') {
            setError(taxPercentageInput, 'error-tax-percentage', 'Debe ingresar el porcentaje de impuesto.');
            isValid = false;
        } else {
            const taxNum = Number(taxVal);
            if (isNaN(taxNum) || taxNum < 0 || taxNum > 100) {
                setError(taxPercentageInput, 'error-tax-percentage', 'El porcentaje de impuesto debe estar entre 0 y 100.');
                isValid = false;
            } else {
                clearError(taxPercentageInput, 'error-tax-percentage');
            }
        }
    } else {
        clearError(taxPercentageInput, 'error-tax-percentage');
    }

    const generalDiscVal = generalDiscountInput.value.trim();
    if (generalDiscVal !== '') {
        const generalDiscNum = Number(generalDiscVal);
        if (isNaN(generalDiscNum) || generalDiscNum < 0 || generalDiscNum > 100) {
            setError(generalDiscountInput, 'error-general-discount', 'El descuento general debe estar entre 0 y 100.');
            isValid = false;
        } else {
            clearError(generalDiscountInput, 'error-general-discount');
        }
    } else {
        clearError(generalDiscountInput, 'error-general-discount');
    }

    if (!discountApplicationSelect.value) {
        setError(discountApplicationSelect, 'error-discount-application', 'La aplicación del descuento es requerida.');
        isValid = false;
    } else {
        clearError(discountApplicationSelect, 'error-discount-application');
    }

    return isValid;
}

// Limpieza de errores en tiempo real
const fieldsToWatch = [
    { el: businessNameInput, id: 'error-business-name' },
    { el: businessRncInput, id: 'error-business-rnc' },
    { el: businessPhoneInput, id: 'error-business-phone' },
    { el: businessEmailInput, id: 'error-business-email' },
    { el: businessAddressInput, id: 'error-business-address' },
    { el: businessLogoInput, id: 'error-business-logo' },
    { el: clientNameInput, id: 'error-client-name' },
    { el: clientRncInput, id: 'error-client-rnc' },
    { el: clientPhoneInput, id: 'error-client-phone' },
    { el: clientEmailInput, id: 'error-client-email' },
    { el: clientAddressInput, id: 'error-client-address' },
    { el: documentNumberInput, id: 'error-document-number' },
    { el: issueDateInput, id: 'error-issue-date' },
    { el: dueDateInput, id: 'error-due-date' },
    { el: documentTypeSelect, id: 'error-document-type' },
    { el: documentStatusSelect, id: 'error-document-status' },
    { el: currencySelect, id: 'error-currency' }
];

fieldsToWatch.forEach(({ el, id }) => {
    if (el) {
        el.addEventListener('input', () => clearError(el, id));
        el.addEventListener('change', () => clearError(el, id));
    }
});

// Event Listeners
documentTypeSelect.addEventListener('change', updateStatusOptions);

btnAddProduct.addEventListener('click', () => { 
    const newRow = createProductRow();
    productsList.appendChild(newRow);
    clearError(null, 'error-products-table');
    updateSummary();
});

productsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-delete-row')) {
        const rows = productsList.querySelectorAll('.product-row');
        if (rows.length <= 1) {
            setError(null, 'error-products-table', 'Debe existir al menos un producto o servicio en la cotización o factura.');
            return;
        }
        const row = event.target.closest('.product-row');
        if (row) {
            productsList.removeChild(row);
            clearError(null, 'error-products-table');
            updateSummary();
        }
    }
});

productsList.addEventListener('input', (event) => {
    const target = event.target;
    if (target.classList.contains('product-quantity') ||
        target.classList.contains('product-price') ||
        target.classList.contains('product-discount') ||
        target.classList.contains('product-description')) {
        clearError(target);
        clearError(null, 'error-products-table');
        const row = target.closest('.product-row');
        if (row) {
            calculateRow(row);
            updateSummary();
        }
    }
});

applyTaxCheckbox.addEventListener('change', handleTaxCheckbox);
taxPercentageInput.addEventListener('input', () => {
    clearError(taxPercentageInput, 'error-tax-percentage');
    updateSummary();
});
generalDiscountInput.addEventListener('input', () => {
    clearError(generalDiscountInput, 'error-general-discount');
    updateSummary();
});
discountApplicationSelect.addEventListener('change', () => {
    clearError(discountApplicationSelect, 'error-discount-application');
    updateSummary();
});
currencySelect.addEventListener('change', updateSummary);

// Validar en el submit
invoiceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
        const firstError = document.querySelector('.input-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
});

// Inicializar al cargar
updateStatusOptions();
handleTaxCheckbox();
updateSummary();