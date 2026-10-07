// ==========================================================================
// InvoiceHub - Lógica de Negocio y Manipulación del DOM (Vanilla JS)
// Restricción estricta: NO se utiliza innerHTML en ninguna parte del proyecto.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
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

    // Contenedor del documento generado
    const generatedDocContainer = document.getElementById('documento-generado-container');

    // ==========================================================================
    // 1. UTILIDADES Y MANEJO DE ERRORES
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
    // 2. CREACIÓN DINÁMICA DE FILAS (DOM Puro)
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
    // 3. CÁLCULOS AUTOMÁTICOS
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

    // ==========================================================================
    // 4. CONTROL DE SELECTORES
    // ==========================================================================

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
    // 5. VALIDACIONES GENERALES
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

    // ==========================================================================
    // 6. GENERACIÓN VISUAL DEL DOCUMENTO (DOM Puro - Sin innerHTML)
    // ==========================================================================

    function generateDocument() {
        generatedDocContainer.replaceChildren();

        const currency = currencySelect.value;
        const summaryData = updateSummary();

        const docWrapper = document.createElement('article');
        docWrapper.className = 'generated-document-sheet';

        // Encabezado
        const headerElem = document.createElement('header');
        headerElem.className = 'doc-header';

        const logoUrl = businessLogoInput.value.trim();
        if (logoUrl) {
            const logoImg = document.createElement('img');
            logoImg.src = logoUrl;
            logoImg.alt = `Logo de ${businessNameInput.value.trim()}`;
            logoImg.className = 'doc-logo';
            logoImg.onerror = () => { logoImg.style.display = 'none'; };
            headerElem.appendChild(logoImg);
        }

        const businessInfo = document.createElement('div');
        businessInfo.className = 'doc-business-info';

        const bName = document.createElement('h2');
        bName.textContent = businessNameInput.value.trim();
        businessInfo.appendChild(bName);

        const bRnc = document.createElement('p');
        bRnc.textContent = `RNC / Identificación: ${businessRncInput.value.trim()}`;
        businessInfo.appendChild(bRnc);

        const bPhone = document.createElement('p');
        bPhone.textContent = `Teléfono: ${businessPhoneInput.value.trim()}`;
        businessInfo.appendChild(bPhone);

        const bEmail = document.createElement('p');
        bEmail.textContent = `Correo: ${businessEmailInput.value.trim()}`;
        businessInfo.appendChild(bEmail);

        const bAddress = document.createElement('p');
        bAddress.textContent = `Dirección: ${businessAddressInput.value.trim()}`;
        businessInfo.appendChild(bAddress);

        headerElem.appendChild(businessInfo);
        docWrapper.appendChild(headerElem);

        // Metadatos (Cliente y Documento)
        const metaSection = document.createElement('section');
        metaSection.className = 'doc-meta-section';

        const clientInfoBox = document.createElement('div');
        clientInfoBox.className = 'doc-info-box';
        const clientTitle = document.createElement('h3');
        clientTitle.textContent = 'Datos del Cliente';
        clientInfoBox.appendChild(clientTitle);

        const pCName = document.createElement('p');
        const sCName = document.createElement('strong');
        sCName.textContent = 'Nombre: ';
        pCName.append(sCName, clientNameInput.value.trim());
        clientInfoBox.appendChild(pCName);

        const pCRnc = document.createElement('p');
        const sCRnc = document.createElement('strong');
        sCRnc.textContent = 'RNC / Identificación: ';
        pCRnc.append(sCRnc, clientRncInput.value.trim());
        clientInfoBox.appendChild(pCRnc);

        const pCPhone = document.createElement('p');
        const sCPhone = document.createElement('strong');
        sCPhone.textContent = 'Teléfono: ';
        pCPhone.append(sCPhone, clientPhoneInput.value.trim());
        clientInfoBox.appendChild(pCPhone);

        const pCEmail = document.createElement('p');
        const sCEmail = document.createElement('strong');
        sCEmail.textContent = 'Correo: ';
        pCEmail.append(sCEmail, clientEmailInput.value.trim());
        clientInfoBox.appendChild(pCEmail);

        const pCAddr = document.createElement('p');
        const sCAddr = document.createElement('strong');
        sCAddr.textContent = 'Dirección: ';
        pCAddr.append(sCAddr, clientAddressInput.value.trim());
        clientInfoBox.appendChild(pCAddr);

        const docInfoBox = document.createElement('div');
        docInfoBox.className = 'doc-info-box';
        const docTitle = document.createElement('h3');
        docTitle.textContent = 'Datos del Documento';
        docInfoBox.appendChild(docTitle);

        const pDocType = document.createElement('p');
        const sDocType = document.createElement('strong');
        sDocType.textContent = 'Tipo: ';
        pDocType.append(sDocType, documentTypeSelect.value);
        docInfoBox.appendChild(pDocType);

        const pDocNum = document.createElement('p');
        const sDocNum = document.createElement('strong');
        sDocNum.textContent = 'Número: ';
        pDocNum.append(sDocNum, documentNumberInput.value.trim());
        docInfoBox.appendChild(pDocNum);

        const pIssue = document.createElement('p');
        const sIssue = document.createElement('strong');
        sIssue.textContent = 'Fecha de emisión: ';
        pIssue.append(sIssue, issueDateInput.value);
        docInfoBox.appendChild(pIssue);

        const pDue = document.createElement('p');
        const sDue = document.createElement('strong');
        sDue.textContent = 'Fecha de vencimiento: ';
        pDue.append(sDue, dueDateInput.value);
        docInfoBox.appendChild(pDue);

        const pStatus = document.createElement('p');
        const sStatus = document.createElement('strong');
        sStatus.textContent = 'Estado: ';
        const badgeStatus = document.createElement('span');
        badgeStatus.className = `status-badge status-${documentStatusSelect.value.toLowerCase()}`;
        badgeStatus.textContent = documentStatusSelect.value;
        pStatus.append(sStatus, badgeStatus);
        docInfoBox.appendChild(pStatus);

        const pCur = document.createElement('p');
        const sCur = document.createElement('strong');
        sCur.textContent = 'Moneda: ';
        pCur.append(sCur, currency);
        docInfoBox.appendChild(pCur);

        metaSection.append(clientInfoBox, docInfoBox);
        docWrapper.appendChild(metaSection);

        // Tabla de Productos
        const tableContainer = document.createElement('section');
        tableContainer.className = 'doc-items-section';

        const table = document.createElement('table');
        table.className = 'doc-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['#', 'Descripción', 'Cantidad', 'Precio unitario', 'Descuento', 'Subtotal'];
        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const rows = productsList.querySelectorAll('.product-row');
        rows.forEach((row, index) => {
            const desc = row.querySelector('.product-description').value.trim();
            const qty = parseFloat(row.querySelector('.product-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.product-price').value) || 0;
            const discount = parseFloat(row.querySelector('.product-discount').value) || 0;
            const subtotal = parseFloat(row.querySelector('.product-subtotal').value) || 0;

            const tr = document.createElement('tr');

            const tdNum = document.createElement('td');
            tdNum.textContent = (index + 1).toString();

            const tdDesc = document.createElement('td');
            tdDesc.textContent = desc;

            const tdQty = document.createElement('td');
            tdQty.textContent = qty.toString();

            const tdPrice = document.createElement('td');
            tdPrice.textContent = formatMoney(price, currency);

            const tdDiscount = document.createElement('td');
            tdDiscount.textContent = `${discount}%`;

            const tdSub = document.createElement('td');
            tdSub.textContent = formatMoney(subtotal, currency);

            tr.append(tdNum, tdDesc, tdQty, tdPrice, tdDiscount, tdSub);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        docWrapper.appendChild(tableContainer);

        // Resumen
        const summarySection = document.createElement('section');
        summarySection.className = 'doc-summary-section';

        const summaryBox = document.createElement('div');
        summaryBox.className = 'doc-summary-box';

        function createSummaryRow(label, value, isBold = false) {
            const div = document.createElement('div');
            div.className = 'doc-summary-row';
            if (isBold) div.classList.add('doc-summary-total');

            const spanLabel = document.createElement('span');
            spanLabel.textContent = label;

            const spanVal = document.createElement('span');
            spanVal.textContent = value;

            div.append(spanLabel, spanVal);
            return div;
        }

        summaryBox.appendChild(createSummaryRow('Subtotal bruto:', formatMoney(summaryData.sumSubtotalBruto, currency)));
        summaryBox.appendChild(createSummaryRow('Descuento por productos:', formatMoney(summaryData.sumDescuentoProductos, currency)));
        summaryBox.appendChild(createSummaryRow('Subtotal neto:', formatMoney(summaryData.subtotalBase, currency)));
        summaryBox.appendChild(createSummaryRow('Descuento general:', formatMoney(summaryData.montoDescuentoGeneral, currency)));
        summaryBox.appendChild(createSummaryRow('Impuesto:', formatMoney(summaryData.montoImpuesto, currency)));
        summaryBox.appendChild(createSummaryRow('Total final:', formatMoney(summaryData.totalFinal, currency), true));

        summarySection.appendChild(summaryBox);
        docWrapper.appendChild(summarySection);

        // Pie de página
        const footerElem = document.createElement('footer');
        footerElem.className = 'doc-footer';

        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString();

        const pTimestamp = document.createElement('p');
        pTimestamp.textContent = `Documento generado el ${formattedDate} a las ${formattedTime}`;
        footerElem.appendChild(pTimestamp);

        docWrapper.appendChild(footerElem);

        generatedDocContainer.appendChild(docWrapper);
        document.getElementById('section-documento-generado').scrollIntoView({ behavior: 'smooth' });
    }

    // ==========================================================================
    // 7. REINICIO DEL FORMULARIO TRAS GENERAR
    // ==========================================================================

    function resetFormAfterGeneration() {
        businessNameInput.value = '';
        businessRncInput.value = '';
        businessPhoneInput.value = '';
        businessEmailInput.value = '';
        businessAddressInput.value = '';
        businessLogoInput.value = '';

        clientNameInput.value = '';
        clientRncInput.value = '';
        clientPhoneInput.value = '';
        clientEmailInput.value = '';
        clientAddressInput.value = '';

        documentNumberInput.value = '';
        issueDateInput.value = '';
        dueDateInput.value = '';

        documentTypeSelect.value = 'Cotización';
        updateStatusOptions();
        documentStatusSelect.value = 'Pendiente';
        currencySelect.value = 'DOP';

        applyTaxCheckbox.checked = false;
        taxPercentageInput.value = '';
        taxPercentageInput.disabled = true;
        taxPercentageInput.required = false;

        generalDiscountInput.value = '0';
        discountApplicationSelect.value = 'antes';

        productsList.replaceChildren();
        const initialRow = createProductRow();
        initialRow.querySelector('.product-description').value = '';
        initialRow.querySelector('.product-quantity').value = '';
        initialRow.querySelector('.product-price').value = '';
        initialRow.querySelector('.product-discount').value = '';
        initialRow.querySelector('.product-subtotal').value = '0.00';
        productsList.appendChild(initialRow);

        document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
        document.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));

        updateSummary();
    }

    // ==========================================================================
    // 8. EVENT LISTENERS
    // ==========================================================================

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

    invoiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            generateDocument();
            resetFormAfterGeneration();
        } else {
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
});