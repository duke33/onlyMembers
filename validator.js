const { check } = require('express-validator')


validateConfirmPassword: check('confirmPassword')
    // Validate minimum length of password
    // Optional for this context
    .isLength({ min: 5, max: 16 })
    // Custom message
    .withMessage('Password must be between 5 to 16 characters')