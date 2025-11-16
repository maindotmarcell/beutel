export interface Theme {
  primary: {
    main: string;
    light?: string;
    dark?: string;
  };
  secondary: {
    main: string;
    light?: string;
    dark?: string;
  };
  background: {
    main: string;
    surface: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  status: {
    success: {
      main: string;
      light: string;
    };
    warning: {
      main: string;
      light: string;
    };
    error: {
      main: string;
      light: string;
    };
  };
  border: {
    main: string;
    light: string;
  };
}

export const lightTheme: Theme = {
  primary: {
    main: '#f97316', // orange-500
    light: '#fb923c', // orange-400
    dark: '#ea580c', // orange-600
  },
  secondary: {
    main: '#6b7280', // gray-500
    light: '#9ca3af', // gray-400
    dark: '#4b5563', // gray-600
  },
  background: {
    main: '#f9fafb', // gray-50
    surface: '#ffffff', // white
  },
  text: {
    primary: '#111827', // gray-900
    secondary: '#4b5563', // gray-600
    muted: '#9ca3af', // gray-400
  },
  status: {
    success: {
      main: '#16a34a', // green-600
      light: '#dcfce7', // green-100
    },
    warning: {
      main: '#ca8a04', // yellow-600
      light: '#fef9c3', // yellow-100
    },
    error: {
      main: '#dc2626', // red-600
      light: '#fee2e2', // red-100
    },
  },
  border: {
    main: '#e5e7eb', // gray-200
    light: '#f3f4f6', // gray-100
  },
};

// Export default theme (can be extended for dark mode later)
export const defaultTheme = lightTheme;

