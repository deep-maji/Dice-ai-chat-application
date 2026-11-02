import React, { createContext, useEffect, useState } from "react";

type ThemeContextType = {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setTheme] = useState<string>(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  useEffect(() => {

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handle = () => {
      setTheme(media.matches ? "dark" : "light");
    }

    media.addEventListener("change", handle);

    return () => (media.removeEventListener("change", handle));

  }, [])


  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext;
