import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            minHeight: { 11: '2.75rem' },
            colors: {
                gray: colors.slate,
                indigo: {
                    50: '#eff5fc', 100: '#dbe9fa', 200: '#bfd7f4',
                    300: '#93b9ea', 400: '#6393d3', 500: '#3c73bc',
                    600: '#2359a3', 700: '#1c4782', 800: '#1b3c6b', 900: '#172f52',
                },
            },
            fontSize: { xs: ['0.8125rem', { lineHeight: '1.25rem' }] },
            fontFamily: {
                sans: [...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
