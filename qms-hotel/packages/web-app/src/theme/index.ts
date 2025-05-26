import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

// Material Design 3 Color Tokens según el plan
const colorTokens = {
  primary: {
    main: '#006A6B',
    light: '#6FF7F8',
    dark: '#004D4E',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#4A6363',
    light: '#7A9393',
    dark: '#2E4444',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FAFDFD',
    paper: '#FFFFFF',
  },
  surface: {
    main: '#FAFDFD',
    variant: '#DAE5E5',
  },
  text: {
    primary: '#191C1C',
    secondary: '#3F4948',
  },
};

// Configuración del tema base
const baseThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: colorTokens.primary,
    secondary: colorTokens.secondary,
    background: colorTokens.background,
    text: colorTokens.text,
    // Colores personalizados para el SGC
    success: {
      main: '#2E7D32',
      light: '#66BB6A',
      dark: '#1B5E20',
    },
    warning: {
      main: '#F57C00',
      light: '#FFB74D',
      dark: '#E65100',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#B71C1C',
    },
    info: {
      main: '#1976D2',
      light: '#64B5F6',
      dark: '#1565C0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Material Design 3 Typography Scale
    h1: {
      fontSize: '3.5rem', // 57px
      fontWeight: 400,
      lineHeight: 1.167,
    },
    h2: {
      fontSize: '2rem', // 32px  
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem', // 28px
      fontWeight: 400,
      lineHeight: 1.167,
    },
    h4: {
      fontSize: '1.5rem', // 24px
      fontWeight: 400,
      lineHeight: 1.235,
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: 400,
      lineHeight: 1.334,
    },
    h6: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.33,
    },
  },
  shape: {
    borderRadius: 12, // MD3 border radius
  },
  spacing: 8, // 8px base spacing
  components: {
    // Customizaciones de componentes MUI
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 16px 16px 0',
        },
      },
    },
  },
};

// Tema principal
export const lightTheme = createTheme(baseThemeOptions, esES);

// Tema oscuro (para futuras implementaciones)
export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    ...baseThemeOptions.palette,
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
}, esES);

// Tema por defecto
export const theme = lightTheme;

// Tipos de tema personalizado para TypeScript
declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      main: string;
      variant: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      main: string;
      variant: string;
    };
  }
}

export default theme;