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
    elevated: string;
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
  glass: {
    background: string;
    border: string;
    highlight: string;
    shine: string;
  };
}

export const lightTheme: Theme = {
  primary: {
    main: "#4169E1",
    light: "#6B8AE8",
    dark: "#2E4AB3",
  },
  secondary: {
    main: "#FFCBA4",
    light: "#FFD9C0",
    dark: "#CCA383",
  },
  background: {
    main: "#F5F5F5",
    surface: "#FAFAFA",
    elevated: "#FFFFFF",
  },
  text: {
    primary: "#1A1A1A",
    secondary: "#5A5A5A",
    muted: "#A0A0A0",
  },
  status: {
    success: {
      main: "#16a34a",
      light: "#dcfce7",
    },
    warning: {
      main: "#ca8a04",
      light: "#fef9c3",
    },
    error: {
      main: "#dc2626",
      light: "#fee2e2",
    },
  },
  border: {
    main: "#E8E8E8",
    light: "#F0F0F0",
  },
  glass: {
    background: "rgba(250, 250, 250, 0.75)",
    border: "rgba(0, 0, 0, 0.06)",
    highlight: "rgba(65, 105, 225, 0.08)",
    shine: "rgba(255, 255, 255, 0.5)",
  },
};

export const darkTheme: Theme = {
  primary: {
    main: "#8B5CF6", // Rich violet
    light: "#A78BFA", // Softer violet
    dark: "#6D28D9", // Deep violet
  },
  secondary: {
    main: "#6366F1", // Indigo
    light: "#818CF8", // Lighter indigo
    dark: "#4F46E5", // Deeper indigo
  },
  background: {
    main: "#07060E", // The void — almost-black with purple-indigo undertone
    surface: "#110F1D", // Glass panels resting above the void
    elevated: "#1A1829", // Interactive/elevated elements
  },
  text: {
    primary: "#EEEAF6", // Off-white with faint lavender warmth
    secondary: "#8E89A8", // Muted purple-gray
    muted: "#55516B", // Deeply muted labels/timestamps
  },
  status: {
    success: {
      main: "#34D399", // Emerald-400
      light: "#064E3B", // Emerald-900
    },
    warning: {
      main: "#FBBF24", // Amber-400
      light: "#78350F", // Amber-900
    },
    error: {
      main: "#F87171", // Red-400
      light: "#7F1D1D", // Red-900
    },
  },
  border: {
    main: "#1E1C2E", // Subtle glass edge
    light: "#16142A", // Barely-there separator
  },
  glass: {
    background: "rgba(17, 15, 29, 0.75)", // Translucent glass panel
    border: "rgba(255, 255, 255, 0.08)", // Subtle edge catch
    highlight: "rgba(139, 92, 246, 0.15)", // Purple inner glow
    shine: "rgba(255, 255, 255, 0.03)", // Top-edge highlight
  },
};

// Export default theme
export const defaultTheme = darkTheme;
