# InvoiceHub

Aplicación web desarrollada con HTML, CSS y JavaScript vanilla para la creación dinámica de cotizaciones y facturas. El proyecto cumple con la restricción de manipulación directa del DOM sin el uso de innerHTML ni dependencias externas.

## Funcionalidades

- Registro de datos de la empresa emisora (nombre, RNC, teléfono, correo, dirección y logo mediante URL).
- Registro de datos del cliente (nombre, identificación/RNC, teléfono, correo y dirección).
- Datos generales del documento (tipo, número, fechas de emisión y vencimiento, estado y moneda).
- Gestión dinámica de productos o servicios:
  - Agregar filas de productos dinámicamente mediante el DOM.
  - Eliminar filas garantizando la existencia de al menos un producto.
  - Cálculo automático de subtotales por fila aplicando descuentos individuales.
- Configuración de impuestos y descuentos generales:
  - Activación condicional del campo de impuesto mediante checkbox.
  - Reglas de aplicación de descuento general (antes o después del impuesto).
  - Control de total para evitar valores negativos.
- Resumen de cálculos en tiempo real con desglose de montos y moneda seleccionada.
- Validaciones completas en el cliente con mensajes de error debajo de cada campo y limpieza dinámica al corregir datos.
- Generación visual del documento (cotización o factura) con reemplazo automático de documentos anteriores.
- Reinicio del formulario tras la generación exitosa manteniendo visible el documento generado.
- Diseño responsivo adaptado a diferentes dispositivos y optimizado para impresión.

## Tecnologías Utilizadas

- HTML5: Estructura semántica del formulario y vista del documento.
- CSS3: Diseño personalizado, diseño responsivo (Flexbox y CSS Grid) y estilos de impresión (@media print).
- JavaScript Vanilla: Manipulación directa del DOM (document.createElement, appendChild, replaceChildren, addEventListener), validaciones y lógica de cálculo.

## Estructura del Proyecto

```text
InvoiceHub/
├── index.html    # Estructura principal y formulario
├── styles.css    # Estilos visuales y diseño responsivo
├── script.js    # Lógica de cálculo, validaciones y manipulación del DOM
└── README.md     # Documentación del proyecto
```

## Instrucciones de Uso

1. Clonar o descargar el repositorio.
2. Abrir el archivo `index.html` directamente en cualquier navegador web moderno.
3. No requiere instalación de dependencias, servidores locales ni herramientas adicionales.