const btnAddProduct = document.getElementById('btn-add-product');
const productsList = document.getElementById('products-list');

// Función auxiliar para no repetir código al crear celdas
function createInputCell(type, name, className, attrs = {}, withError = true) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.className = className;
    Object.assign(input, attrs); // asigna value, placeholder, step, required, readOnly, etc.
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

    // 1. Creamos cada columna en una sola línea
    const tdDesc = createInputCell('text', 'product_description', 'product-description', { placeholder: 'Descripción', required: true });
    const tdQty = createInputCell('number', 'product_quantity', 'product-quantity', { min: 1, step: 1, value: 1, required: true });
    const tdPrice = createInputCell('number', 'product_price', 'product-price', { min: 0.01, step: '0.01', placeholder: '0.00', required: true });
    const tdDiscount = createInputCell('number', 'product_discount', 'product-discount', { min: 0, max: 100, step: '0.01', value: 0 });
    const tdSubtotal = createInputCell('text', 'product_subtotal', 'product-subtotal', { value: '0.00', readOnly: true }, false);

    // 2. Columna del botón Eliminar
    const tdAction = document.createElement('td');
    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'btn-delete-row';
    btnDelete.textContent = 'Eliminar';
    tdAction.appendChild(btnDelete);

    // 3. Añadir todo al tr
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

btnAddProduct.addEventListener('click', () => { 
    const newRow = createProductRow();
    productsList.appendChild(newRow);
});

// Eliminar fila de producto
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
        }
    }
});

// Recalcular subtotal de la fila al cambiar cantidad, precio o descuento
productsList.addEventListener('input', (event) => {
    const target = event.target;
    if (target.classList.contains('product-quantity') ||
        target.classList.contains('product-price') ||
        target.classList.contains('product-discount')) {
        const row = target.closest('.product-row');
        if (row) {
            calculateRow(row);
        }
    }
});