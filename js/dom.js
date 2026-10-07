// DOM directo

// Crear una celda de tabla con input y contenedor de error
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

// Crear una nueva fila de producto
function createProductRow() {
    const tr = document.createElement('tr');
    tr.className = 'product-row';

    const tdDesc = createInputCell('text', 'product_description', 'product-description', {
        placeholder: 'Descripción',
        required: true
    });

    const tdQty = createInputCell('number', 'product_quantity', 'product-quantity', {
        min: '1',
        step: '1',
        value: '1',
        required: true
    });

    const tdPrice = createInputCell('number', 'product_price', 'product-price', {
        min: '0.01',
        step: '0.01',
        placeholder: '0.00',
        required: true
    });

    const tdDiscount = createInputCell('number', 'product_discount', 'product-discount', {
        min: '0',
        max: '100',
        step: '0.01',
        value: '0'
    });

    const tdSubtotal = createInputCell('text', 'product_subtotal', 'product-subtotal', {
        value: '0.00',
        readOnly: true
    }, false);

    const tdAction = document.createElement('td');
    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'btn-delete-row';
    btnDelete.textContent = 'Eliminar';
    tdAction.appendChild(btnDelete);

    tr.append(tdDesc, tdQty, tdPrice, tdDiscount, tdSubtotal, tdAction);
    return tr;
}

// Adaptar las opciones de Estado según Tipo de Documento
function updateStatusOptions(typeSelect, statusSelect) {
    const type = typeSelect.value;
    const currentStatus = statusSelect.value;

    statusSelect.replaceChildren();

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
        statusSelect.appendChild(option);
    });

    if (!options.includes(currentStatus)) {
        statusSelect.value = options[0];
    }
}

// Construcción visual del documento generado
function renderGeneratedDocument(container, formData, summaryData) {
    container.replaceChildren();

    const currency = summaryData.currency;
    const docWrapper = document.createElement('article');
    docWrapper.className = 'generated-document-sheet';

    // Header
    const headerElem = document.createElement('header');
    headerElem.className = 'doc-header';

    if (formData.businessLogo) {
        const logoImg = document.createElement('img');
        logoImg.src = formData.businessLogo;
        logoImg.alt = `Logo de ${formData.businessName}`;
        logoImg.className = 'doc-logo';
        logoImg.onerror = () => { logoImg.style.display = 'none'; };
        headerElem.appendChild(logoImg);
    }

    const businessInfo = document.createElement('div');
    businessInfo.className = 'doc-business-info';

    const bName = document.createElement('h2');
    bName.textContent = formData.businessName;
    businessInfo.appendChild(bName);

    const bRnc = document.createElement('p');
    bRnc.textContent = `RNC / Identificación: ${formData.businessRnc}`;
    businessInfo.appendChild(bRnc);

    const bPhone = document.createElement('p');
    bPhone.textContent = `Teléfono: ${formData.businessPhone}`;
    businessInfo.appendChild(bPhone);

    const bEmail = document.createElement('p');
    bEmail.textContent = `Correo: ${formData.businessEmail}`;
    businessInfo.appendChild(bEmail);

    const bAddress = document.createElement('p');
    bAddress.textContent = `Dirección: ${formData.businessAddress}`;
    businessInfo.appendChild(bAddress);

    headerElem.appendChild(businessInfo);
    docWrapper.appendChild(headerElem);

    const metaSection = document.createElement('section');
    metaSection.className = 'doc-meta-section';

    // Caja Cliente
    const clientInfoBox = document.createElement('div');
    clientInfoBox.className = 'doc-info-box';
    const clientTitle = document.createElement('h3');
    clientTitle.textContent = 'Datos del Cliente';
    clientInfoBox.appendChild(clientTitle);

    const pCName = document.createElement('p');
    const sCName = document.createElement('strong');
    sCName.textContent = 'Nombre: ';
    pCName.append(sCName, formData.clientName);
    clientInfoBox.appendChild(pCName);

    const pCRnc = document.createElement('p');
    const sCRnc = document.createElement('strong');
    sCRnc.textContent = 'RNC / Identificación: ';
    pCRnc.append(sCRnc, formData.clientRnc);
    clientInfoBox.appendChild(pCRnc);

    const pCPhone = document.createElement('p');
    const sCPhone = document.createElement('strong');
    sCPhone.textContent = 'Teléfono: ';
    pCPhone.append(sCPhone, formData.clientPhone);
    clientInfoBox.appendChild(pCPhone);

    const pCEmail = document.createElement('p');
    const sCEmail = document.createElement('strong');
    sCEmail.textContent = 'Correo: ';
    pCEmail.append(sCEmail, formData.clientEmail);
    clientInfoBox.appendChild(pCEmail);

    const pCAddr = document.createElement('p');
    const sCAddr = document.createElement('strong');
    sCAddr.textContent = 'Dirección: ';
    pCAddr.append(sCAddr, formData.clientAddress);
    clientInfoBox.appendChild(pCAddr);

    // Caja Documento
    const docInfoBox = document.createElement('div');
    docInfoBox.className = 'doc-info-box';
    const docTitle = document.createElement('h3');
    docTitle.textContent = 'Datos del Documento';
    docInfoBox.appendChild(docTitle);

    const pDocType = document.createElement('p');
    const sDocType = document.createElement('strong');
    sDocType.textContent = 'Tipo: ';
    pDocType.append(sDocType, formData.docType);
    docInfoBox.appendChild(pDocType);

    const pDocNum = document.createElement('p');
    const sDocNum = document.createElement('strong');
    sDocNum.textContent = 'Número: ';
    pDocNum.append(sDocNum, formData.docNumber);
    docInfoBox.appendChild(pDocNum);

    const pIssue = document.createElement('p');
    const sIssue = document.createElement('strong');
    sIssue.textContent = 'Fecha de emisión: ';
    pIssue.append(sIssue, formData.issueDate);
    docInfoBox.appendChild(pIssue);

    const pDue = document.createElement('p');
    const sDue = document.createElement('strong');
    sDue.textContent = 'Fecha de vencimiento: ';
    pDue.append(sDue, formData.dueDate);
    docInfoBox.appendChild(pDue);

    const pStatus = document.createElement('p');
    const sStatus = document.createElement('strong');
    sStatus.textContent = 'Estado: ';
    const badgeStatus = document.createElement('span');
    badgeStatus.className = `status-badge status-${formData.docStatus.toLowerCase()}`;
    badgeStatus.textContent = formData.docStatus;
    pStatus.append(sStatus, badgeStatus);
    docInfoBox.appendChild(pStatus);

    const pCur = document.createElement('p');
    const sCur = document.createElement('strong');
    sCur.textContent = 'Moneda: ';
    pCur.append(sCur, currency);
    docInfoBox.appendChild(pCur);

    metaSection.append(clientInfoBox, docInfoBox);
    docWrapper.appendChild(metaSection);

    // 3. Tabla de Productos
    const tableContainer = document.createElement('section');
    tableContainer.className = 'doc-items-section';

    const table = document.createElement('table');
    table.className = 'doc-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['#', 'Descripción', 'Cantidad', 'Precio unitario', 'Descuento', 'Subtotal'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    formData.items.forEach((item, index) => {
        const tr = document.createElement('tr');

        const tdNum = document.createElement('td');
        tdNum.textContent = (index + 1).toString();

        const tdDesc = document.createElement('td');
        tdDesc.textContent = item.description;

        const tdQty = document.createElement('td');
        tdQty.textContent = item.quantity.toString();

        const tdPrice = document.createElement('td');
        tdPrice.textContent = formatMoney(item.price, currency);

        const tdDiscount = document.createElement('td');
        tdDiscount.textContent = `${item.discount}%`;

        const tdSub = document.createElement('td');
        tdSub.textContent = formatMoney(item.subtotal, currency);

        tr.append(tdNum, tdDesc, tdQty, tdPrice, tdDiscount, tdSub);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    docWrapper.appendChild(tableContainer);

    // Resumen de Totales
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

    container.appendChild(docWrapper);
}

// Reset
function resetFormState(refs) {
    refs.businessName.value = '';
    refs.businessRnc.value = '';
    refs.businessPhone.value = '';
    refs.businessEmail.value = '';
    refs.businessAddress.value = '';
    refs.businessLogo.value = '';

    refs.clientName.value = '';
    refs.clientRnc.value = '';
    refs.clientPhone.value = '';
    refs.clientEmail.value = '';
    refs.clientAddress.value = '';

    refs.docNumber.value = '';
    refs.issueDate.value = '';
    refs.dueDate.value = '';

    refs.docType.value = 'Cotización';
    updateStatusOptions(refs.docType, refs.docStatus);
    refs.docStatus.value = 'Pendiente';
    refs.currency.value = 'DOP';

    refs.applyTax.checked = false;
    refs.taxPercentage.value = '';
    refs.taxPercentage.disabled = true;
    refs.taxPercentage.required = false;

    refs.generalDiscount.value = '0';
    refs.discountApplication.value = 'antes';

    // Dejar una sola fila limpia
    refs.productsList.replaceChildren();
    const initialRow = createProductRow();
    initialRow.querySelector('.product-description').value = '';
    initialRow.querySelector('.product-quantity').value = '';
    initialRow.querySelector('.product-price').value = '';
    initialRow.querySelector('.product-discount').value = '';
    initialRow.querySelector('.product-subtotal').value = '0.00';
    refs.productsList.appendChild(initialRow);

    // Limpiar errores visuales
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
    document.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));
}

