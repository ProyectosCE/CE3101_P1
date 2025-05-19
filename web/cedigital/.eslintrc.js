module.exports = {
    root: true,
    extends: [
        'next',
        'next/core-web-vitals',
        'plugin:@typescript-eslint/recommended'
    ],
    plugins: ['@typescript-eslint'],
    rules: {
        // Mostrar advertencia, no error, si hay variables no usadas
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_',
            }
        ],
        // (opcional) si usas <img>, desactiva esta advertencia temporalmente:
        // 'next/no-img-element': 'off',

        // Puedes agregar más reglas aquí si deseas
    }
}
