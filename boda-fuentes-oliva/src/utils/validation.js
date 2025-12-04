/**
 * Utilidades de validación y sanitización de inputs
 * Previene XSS, inyecciones SQL y spam
 */

// Límites de longitud para prevenir spam y DoS
export const VALIDATION_LIMITS = {
  PASSWORD: { min: 4, max: 50 },
  NAME: { min: 2, max: 100 },
  MESSAGE: { min: 1, max: 1000 },
  NOTES: { min: 0, max: 500 },
  USERNAME: { min: 3, max: 50 }
};

/**
 * Sanitiza un string eliminando caracteres peligrosos
 * Previene XSS básico
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  
  return String(str)
    .trim()
    // Eliminar tags HTML
    .replace(/<[^>]*>/g, '')
    // Eliminar caracteres de control
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Eliminar múltiples espacios
    .replace(/\s+/g, ' ');
};

/**
 * Valida longitud de string
 */
export const validateLength = (str, min, max) => {
  if (!str && min > 0) return false;
  const length = String(str).trim().length;
  return length >= min && length <= max;
};

/**
 * Valida un nombre (invitados, sender_name, etc)
 */
export const validateName = (name) => {
  const sanitized = sanitizeString(name);
  
  if (!validateLength(sanitized, VALIDATION_LIMITS.NAME.min, VALIDATION_LIMITS.NAME.max)) {
    return {
      isValid: false,
      error: `El nombre debe tener entre ${VALIDATION_LIMITS.NAME.min} y ${VALIDATION_LIMITS.NAME.max} caracteres`,
      sanitized: ''
    };
  }

  // Solo letras, números, espacios, acentos y algunos caracteres especiales comunes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(sanitized)) {
    return {
      isValid: false,
      error: 'El nombre contiene caracteres no válidos',
      sanitized: ''
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized
  };
};

/**
 * Valida un mensaje de invitado
 */
export const validateMessage = (message) => {
  const sanitized = sanitizeString(message);
  
  if (!validateLength(sanitized, VALIDATION_LIMITS.MESSAGE.min, VALIDATION_LIMITS.MESSAGE.max)) {
    return {
      isValid: false,
      error: `El mensaje debe tener entre ${VALIDATION_LIMITS.MESSAGE.min} y ${VALIDATION_LIMITS.MESSAGE.max} caracteres`,
      sanitized: ''
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized
  };
};

/**
 * Valida notas de confirmación
 */
export const validateNotes = (notes) => {
  if (!notes) {
    return {
      isValid: true,
      error: null,
      sanitized: ''
    };
  }

  const sanitized = sanitizeString(notes);
  
  if (!validateLength(sanitized, VALIDATION_LIMITS.NOTES.min, VALIDATION_LIMITS.NOTES.max)) {
    return {
      isValid: false,
      error: `Las notas no pueden exceder ${VALIDATION_LIMITS.NOTES.max} caracteres`,
      sanitized: ''
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized
  };
};

/**
 * Valida contraseña
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      error: 'La contraseña es requerida',
      sanitized: ''
    };
  }

  const trimmed = String(password).trim();
  
  if (!validateLength(trimmed, VALIDATION_LIMITS.PASSWORD.min, VALIDATION_LIMITS.PASSWORD.max)) {
    return {
      isValid: false,
      error: `La contraseña debe tener entre ${VALIDATION_LIMITS.PASSWORD.min} y ${VALIDATION_LIMITS.PASSWORD.max} caracteres`,
      sanitized: ''
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized: trimmed
  };
};

/**
 * Valida username de admin
 */
export const validateUsername = (username) => {
  const sanitized = sanitizeString(username);
  
  if (!validateLength(sanitized, VALIDATION_LIMITS.USERNAME.min, VALIDATION_LIMITS.USERNAME.max)) {
    return {
      isValid: false,
      error: `El usuario debe tener entre ${VALIDATION_LIMITS.USERNAME.min} y ${VALIDATION_LIMITS.USERNAME.max} caracteres`,
      sanitized: ''
    };
  }

  // Solo letras, números y guiones bajos
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(sanitized)) {
    return {
      isValid: false,
      error: 'El usuario solo puede contener letras, números y guiones bajos',
      sanitized: ''
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized
  };
};

/**
 * Valida email (para futuras funcionalidades)
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: false, error: 'Email requerido', sanitized: '' };
  
  const sanitized = sanitizeString(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return {
      isValid: false,
      error: 'Email no válido',
      sanitized: ''
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized: sanitized.toLowerCase()
  };
};

/**
 * Valida número de asistentes
 */
export const validateAttendanceCount = (count) => {
  const num = parseInt(count, 10);
  
  if (isNaN(num) || num < 0 || num > 20) {
    return {
      isValid: false,
      error: 'El número de asistentes debe estar entre 0 y 20',
      sanitized: 0
    };
  }

  return {
    isValid: true,
    error: null,
    sanitized: num
  };
};
