// Funciones Utilitarias y Helpers

// Formatear montos con dos decimales y separador de miles
function formatMoney(amount, currency) {
    const num = Number(amount) || 0;
    const formattedNumber = num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${currency} ${formattedNumber}`;
}

// Limpiar mensaje de error de un campo
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

// Mostrar mensaje de error en un campo
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

// Validar formato de correo electrónico
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// Validar formato de URL
function isValidUrl(urlString) {
    try {
        const url = new URL(urlString.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

