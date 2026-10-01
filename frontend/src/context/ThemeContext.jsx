import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("velnex_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
      // Agar avval saqlanmagan bo'lsa, tizim (OS) temasini tekshiramiz
      if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch (e) {
      console.warn("Theme storage read error:", e);
    }
    return "light";
  });

  useEffect(() => {
    try {
      if (theme === "dark") {
        document.body.classList.add("dark-theme");
        localStorage.setItem("velnex_theme", "dark");
      } else {
        document.body.classList.remove("dark-theme");
        localStorage.setItem("velnex_theme", "light");
      }
    } catch (e) {
      console.warn("Theme storage save error:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setExplicitTheme = (newTheme) => {
    if (newTheme === "dark" || newTheme === "light") {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme, setTheme: setExplicitTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "light",
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
};

export default ThemeContext;
