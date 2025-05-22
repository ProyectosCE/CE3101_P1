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
        // Permitir 'any' en todo el proyecto (desactiva error y advertencia)
        '@typescript-eslint/no-explicit-any': 'off',
        // Puedes agregar más reglas aquí si deseas
    },
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            rules: {
                // Permitir 'any' en todos los archivos TS/TSX
                '@typescript-eslint/no-explicit-any': 'off',
            }
        }
    ]
}
