// ==========================================================================
// js/app.js - Orquestador Principal y Conexión de Eventos
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del formulario
    const refs = {
        invoiceForm: document.getElementById('invoice-form'),

        // Negocio
        businessName: document.getElementById('business-name'),
        businessRnc: document.getElementById('business-rnc'),
        businessPhone: document.getElementById('business-phone'),
        businessEmail: document.getElementById('business-email'),
        businessAddress: document.getElementById('business-address'),
        businessLogo: document.getElementById('business-logo'),

        // Cliente
        clientName: document.getElementById('client-name'),
        clientRnc: document.getElementById('client-rnc'),
        clientPhone: document.getElementById('client-phone'),
        clientEmail: document.getElementById('client-email'),
        clientAddress: document.getElementById('client-address'),

        // Generales
        docType: document.getElementById('document-type'),
        docNumber: document.getElementById('document-number'),
        issueDate: document.getElementById('issue-date'),
        dueDate: document.getElementById('due-date'),
        docStatus: document.getElementById('document-status'),
        currency: document.getElementById('currency'),

        // Productos
        btnAddProduct: document.getElementById('btn-add-product'),
        productsList: document.getElementById('products-list'),
        errorProductsTable: document.getElementById('error-products-table'),

        // Impuestos y Descuentos
        applyTax: document.getElementById('apply-tax'),
        taxPercentage: document.getElementById('tax-percentage'),
        generalDiscount: document.getElementById('general-discount'),
        discountApplication: document.getElementById('discount-application'),

        // Resumen
        summaryItemsCount: document.getElementById('summary-items-count'),
        summaryGrossSubtotal: document.getElementById('summary-gross-subtotal'),
        summaryProductDiscounts: document.getElementById('summary-product-discounts'),
        summarySubtotalAfterDiscounts: document.getElementById('summary-subtotal-after-discounts'),
        summaryGeneralDiscount: document.getElementById('summary-general-discount'),
        summaryTax: document.getElementById('summary-tax'),
        summaryFinalTotal: document.getElementById('summary-final-total'),

        // Vista previa
        generatedDocContainer: document.getElementById('documento-generado-container')
    };

    // Actualizar el resumen visual de cálculos
    function refreshSummary() {
        const rows = refs.productsList.querySelectorAll('.product-row');
        const summaryData = calculateTotals(
            rows,
            refs.currency.value,
            refs.applyTax.checked,
            refs.taxPercentage.value,
            refs.generalDiscount.value,
            refs.discountApplication.value
        );

        refs.summaryItemsCount.textContent = summaryData.totalItems.toString();
        refs.summaryGrossSubtotal.textContent = formatMoney(summaryData.sumSubtotalBruto, summaryData.currency);
        refs.summaryProductDiscounts.textContent = formatMoney(summaryData.sumDescuentoProductos, summaryData.currency);
        refs.summarySubtotalAfterDiscounts.textContent = formatMoney(summaryData.subtotalBase, summaryData.currency);
        refs.summaryGeneralDiscount.textContent = formatMoney(summaryData.montoDescuentoGeneral, summaryData.currency);
        refs.summaryTax.textContent = formatMoney(summaryData.montoImpuesto, summaryData.currency);
        refs.summaryFinalTotal.textContent = formatMoney(summaryData.totalFinal, summaryData.currency);

        return summaryData;
    }

    // Manejar el estado del checkbox Aplicar Impuesto
    function onTaxCheckboxChange() {
        if (refs.applyTax.checked) {
            refs.taxPercentage.disabled = false;
            refs.taxPercentage.required = true;
            refs.taxPercentage.focus();
        } else {
            refs.taxPercentage.value = '';
            refs.taxPercentage.disabled = true;
            refs.taxPercentage.required = false;
            clearError(refs.taxPercentage, 'error-tax-percentage');
        }
        refreshSummary();
    }

    // Limpieza de errores en tiempo real
    const fieldsToWatch = [
        { el: refs.businessName, id: 'error-business-name' },
        { el: refs.businessRnc, id: 'error-business-rnc' },
        { el: refs.businessPhone, id: 'error-business-phone' },
        { el: refs.businessEmail, id: 'error-business-email' },
        { el: refs.businessAddress, id: 'error-business-address' },
        { el: refs.businessLogo, id: 'error-business-logo' },
        { el: refs.clientName, id: 'error-client-name' },
        { el: refs.clientRnc, id: 'error-client-rnc' },
        { el: refs.clientPhone, id: 'error-client-phone' },
        { el: refs.clientEmail, id: 'error-client-email' },
        { el: refs.clientAddress, id: 'error-client-address' },
        { el: refs.docNumber, id: 'error-document-number' },
        { el: refs.issueDate, id: 'error-issue-date' },
        { el: refs.dueDate, id: 'error-due-date' },
        { el: refs.docType, id: 'error-document-type' },
        { el: refs.docStatus, id: 'error-document-status' },
        { el: refs.currency, id: 'error-currency' }
    ];

    fieldsToWatch.forEach(({ el, id }) => {
        if (el) {
            el.addEventListener('input', () => clearError(el, id));
            el.addEventListener('change', () => clearError(el, id));
        }
    });

    // Control de tipo de documento
    refs.docType.addEventListener('change', () => {
        updateStatusOptions(refs.docType, refs.docStatus);
    });

    // Agregar producto
    refs.btnAddProduct.addEventListener('click', () => {
        const newRow = createProductRow();
        refs.productsList.appendChild(newRow);
        clearError(null, 'error-products-table');
        refreshSummary();
    });

    // Eliminar producto
    refs.productsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-delete-row')) {
            const rows = refs.productsList.querySelectorAll('.product-row');
            if (rows.length <= 1) {
                setError(null, 'error-products-table', 'Debe existir al menos un producto o servicio en la cotización o factura.');
                return;
            }
            const row = event.target.closest('.product-row');
            if (row) {
                refs.productsList.removeChild(row);
                clearError(null, 'error-products-table');
                refreshSummary();
            }
        }
    });

    // Input en campos de productos
    refs.productsList.addEventListener('input', (event) => {
        const target = event.target;
        if (target.classList.contains('product-quantity') ||
            target.classList.contains('product-price') ||
            target.classList.contains('product-discount') ||
            target.classList.contains('product-description')) {
            clearError(target);
            clearError(null, 'error-products-table');
            refreshSummary();
        }
    });

    // Impuestos y descuentos
    refs.applyTax.addEventListener('change', onTaxCheckboxChange);

    refs.taxPercentage.addEventListener('input', () => {
        clearError(refs.taxPercentage, 'error-tax-percentage');
        refreshSummary();
    });

    refs.generalDiscount.addEventListener('input', () => {
        clearError(refs.generalDiscount, 'error-general-discount');
        refreshSummary();
    });

    refs.discountApplication.addEventListener('change', () => {
        clearError(refs.discountApplication, 'error-discount-application');
        refreshSummary();
    });

    refs.currency.addEventListener('change', refreshSummary);

    // Envío del formulario
    refs.invoiceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isValid = validateInvoiceForm(refs);
        if (!isValid) {
            const firstError = document.querySelector('.input-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        // Recopilar datos para la vista generada
        const summaryData = refreshSummary();
        const items = [];
        refs.productsList.querySelectorAll('.product-row').forEach(row => {
            items.push({
                description: row.querySelector('.product-description').value.trim(),
                quantity: parseFloat(row.querySelector('.product-quantity').value) || 0,
                price: parseFloat(row.querySelector('.product-price').value) || 0,
                discount: parseFloat(row.querySelector('.product-discount').value) || 0,
                subtotal: parseFloat(row.querySelector('.product-subtotal').value) || 0
            });
        });

        const formData = {
            businessName: refs.businessName.value.trim(),
            businessRnc: refs.businessRnc.value.trim(),
            businessPhone: refs.businessPhone.value.trim(),
            businessEmail: refs.businessEmail.value.trim(),
            businessAddress: refs.businessAddress.value.trim(),
            businessLogo: refs.businessLogo.value.trim(),

            clientName: refs.clientName.value.trim(),
            clientRnc: refs.clientRnc.value.trim(),
            clientPhone: refs.clientPhone.value.trim(),
            clientEmail: refs.clientEmail.value.trim(),
            clientAddress: refs.clientAddress.value.trim(),

            docType: refs.docType.value,
            docNumber: refs.docNumber.value.trim(),
            issueDate: refs.issueDate.value,
            dueDate: refs.dueDate.value,
            docStatus: refs.docStatus.value,
            items: items
        };

        // Renderizar documento y reiniciar formulario
        renderGeneratedDocument(refs.generatedDocContainer, formData, summaryData);
        resetFormState(refs);
        refreshSummary();

        document.getElementById('section-documento-generado').scrollIntoView({ behavior: 'smooth' });
    });

    // Inicialización al cargar la página
    updateStatusOptions(refs.docType, refs.docStatus);
    onTaxCheckboxChange();
    refreshSummary();
});
