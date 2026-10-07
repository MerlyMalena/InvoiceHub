// ==========================================================================
// js/validations.js - Reglas de Validación del Formulario
// ==========================================================================

function validateInvoiceForm(refs) {
    let isValid = true;

    // 1. Datos del Negocio
    if (!refs.businessName.value.trim()) {
        setError(refs.businessName, 'error-business-name', 'Debe ingresar el nombre del negocio.');
        isValid = false;
    } else {
        clearError(refs.businessName, 'error-business-name');
    }

    if (!refs.businessRnc.value.trim()) {
        setError(refs.businessRnc, 'error-business-rnc', 'El RNC o identificación del negocio es requerido.');
        isValid = false;
    } else {
        clearError(refs.businessRnc, 'error-business-rnc');
    }

    if (!refs.businessPhone.value.trim()) {
        setError(refs.businessPhone, 'error-business-phone', 'El teléfono del negocio es requerido.');
        isValid = false;
    } else {
        clearError(refs.businessPhone, 'error-business-phone');
    }

    if (!refs.businessEmail.value.trim()) {
        setError(refs.businessEmail, 'error-business-email', 'El correo electrónico del negocio es requerido.');
        isValid = false;
    } else if (!isValidEmail(refs.businessEmail.value)) {
        setError(refs.businessEmail, 'error-business-email', 'Debe ingresar un correo electrónico válido.');
        isValid = false;
    } else {
        clearError(refs.businessEmail, 'error-business-email');
    }

    if (!refs.businessAddress.value.trim()) {
        setError(refs.businessAddress, 'error-business-address', 'La dirección del negocio es requerida.');
        isValid = false;
    } else {
        clearError(refs.businessAddress, 'error-business-address');
    }

    if (refs.businessLogo.value.trim() && !isValidUrl(refs.businessLogo.value)) {
        setError(refs.businessLogo, 'error-business-logo', 'Si se ingresa URL del logo, debe tener formato de URL válido.');
        isValid = false;
    } else {
        clearError(refs.businessLogo, 'error-business-logo');
    }

    // 2. Datos del Cliente
    if (!refs.clientName.value.trim()) {
        setError(refs.clientName, 'error-client-name', 'Debe ingresar el nombre del cliente.');
        isValid = false;
    } else {
        clearError(refs.clientName, 'error-client-name');
    }

    if (!refs.clientRnc.value.trim()) {
        setError(refs.clientRnc, 'error-client-rnc', 'La identificación o RNC del cliente es requerida.');
        isValid = false;
    } else {
        clearError(refs.clientRnc, 'error-client-rnc');
    }

    if (!refs.clientPhone.value.trim()) {
        setError(refs.clientPhone, 'error-client-phone', 'El teléfono del cliente es requerido.');
        isValid = false;
    } else {
        clearError(refs.clientPhone, 'error-client-phone');
    }

    if (!refs.clientEmail.value.trim()) {
        setError(refs.clientEmail, 'error-client-email', 'El correo electrónico del cliente es requerido.');
        isValid = false;
    } else if (!isValidEmail(refs.clientEmail.value)) {
        setError(refs.clientEmail, 'error-client-email', 'Debe ingresar un correo electrónico válido.');
        isValid = false;
    } else {
        clearError(refs.clientEmail, 'error-client-email');
    }

    if (!refs.clientAddress.value.trim()) {
        setError(refs.clientAddress, 'error-client-address', 'La dirección del cliente es requerida.');
        isValid = false;
    } else {
        clearError(refs.clientAddress, 'error-client-address');
    }

    // 3. Datos Generales
    if (!refs.docType.value) {
        setError(refs.docType, 'error-document-type', 'El tipo de documento es requerido.');
        isValid = false;
    } else {
        clearError(refs.docType, 'error-document-type');
    }

    if (!refs.docNumber.value.trim()) {
        setError(refs.docNumber, 'error-document-number', 'El número de documento es requerido.');
        isValid = false;
    } else {
        clearError(refs.docNumber, 'error-document-number');
    }

    const issueVal = refs.issueDate.value;
    const dueVal = refs.dueDate.value;

    if (!issueVal) {
        setError(refs.issueDate, 'error-issue-date', 'La fecha de emisión es requerida.');
        isValid = false;
    } else {
        clearError(refs.issueDate, 'error-issue-date');
    }

    if (!dueVal) {
        setError(refs.dueDate, 'error-due-date', 'La fecha de vencimiento es requerida.');
        isValid = false;
    } else if (issueVal && dueVal < issueVal) {
        setError(refs.dueDate, 'error-due-date', 'La fecha de vencimiento no puede ser menor que la fecha de emisión.');
        isValid = false;
    } else {
        clearError(refs.dueDate, 'error-due-date');
    }

    if (!refs.docStatus.value) {
        setError(refs.docStatus, 'error-document-status', 'El estado es requerido.');
        isValid = false;
    } else {
        clearError(refs.docStatus, 'error-document-status');
    }

    if (!refs.currency.value) {
        setError(refs.currency, 'error-currency', 'La moneda es requerida.');
        isValid = false;
    } else {
        clearError(refs.currency, 'error-currency');
    }

    // 4. Productos o Servicios
    const rows = refs.productsList.querySelectorAll('.product-row');
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

    // 5. Impuestos y Descuentos
    if (refs.applyTax.checked) {
        const taxVal = refs.taxPercentage.value.trim();
        if (taxVal === '') {
            setError(refs.taxPercentage, 'error-tax-percentage', 'Debe ingresar el porcentaje de impuesto.');
            isValid = false;
        } else {
            const taxNum = Number(taxVal);
            if (isNaN(taxNum) || taxNum < 0 || taxNum > 100) {
                setError(refs.taxPercentage, 'error-tax-percentage', 'El porcentaje de impuesto debe estar entre 0 y 100.');
                isValid = false;
            } else {
                clearError(refs.taxPercentage, 'error-tax-percentage');
            }
        }
    } else {
        clearError(refs.taxPercentage, 'error-tax-percentage');
    }

    const generalDiscVal = refs.generalDiscount.value.trim();
    if (generalDiscVal !== '') {
        const generalDiscNum = Number(generalDiscVal);
        if (isNaN(generalDiscNum) || generalDiscNum < 0 || generalDiscNum > 100) {
            setError(refs.generalDiscount, 'error-general-discount', 'El descuento general debe estar entre 0 y 100.');
            isValid = false;
        } else {
            clearError(refs.generalDiscount, 'error-general-discount');
        }
    } else {
        clearError(refs.generalDiscount, 'error-general-discount');
    }

    if (!refs.discountApplication.value) {
        setError(refs.discountApplication, 'error-discount-application', 'La aplicación del descuento es requerida.');
        isValid = false;
    } else {
        clearError(refs.discountApplication, 'error-discount-application');
    }

    return isValid;
}
