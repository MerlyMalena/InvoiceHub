
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
    const tdPrice = createInputCell('number', 'product_price', 'product-price', { min: 0.01, step: '0.01', value: '0.00', required: true });
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

btnAddProduct.addEventListener('click', () => { 
    const newRow = createProductRow();
    productsList.appendChild(newRow);
})

// Eliminar fila de producto
productsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-delete-row')) {
        if (productsList.rows.length <= 1) {
            alert('Debe existir al menos un producto o servicio en la cotización o factura.');
            return;
        }
        else if (!confirm('¿Está seguro de que desea eliminar este producto?')) {
            return;
        }
        const row = event.target.closest('.product-row');
        productsList.removeChild(row);
    }
});