export interface Theme {
  primary: {
    main: string;
    light: string;
    dark: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
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
    main: "#4169E1", // Royal Blue
    light: "#6B8AE8", // lighter royal blue
    dark: "#2E4AB3", // darker royal blue
  },
  secondary: {
    main: "#FFCBA4", // Peach
    light: "#FFD9C0", // lighter peach
    dark: "#CCA383", // darker peach
  },
  background: {
    main: "#F5F5F5", // softer gray
    surface: "#FAFAFA", // soft off-white
  },
  text: {
    primary: "#1A1A1A", // softer black
    secondary: "#5A5A5A", // softer gray-600
    muted: "#A0A0A0", // softer gray-400
  },
  status: {
    success: {
      main: "#16a34a", // green-600
      light: "#dcfce7", // green-100
    },
    warning: {
      main: "#ca8a04", // yellow-600
      light: "#fef9c3", // yellow-100
    },
    error: {
      main: "#dc2626", // red-600
      light: "#fee2e2", // red-100
    },
  },
  border: {
    main: "#E8E8E8", // softer gray-200
    light: "#F0F0F0", // softer gray-100
  },
};

// Export default theme (can be extended for dark mode later)
export const defaultTheme = lightTheme;
