'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: 'var(--font-bricolage), Roboto, sans-serif',
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#1a9e7a',
        },
        background: {
            default: '#fafafa',
            paper: '#ffffff',
        },
    },
});

export default theme;
