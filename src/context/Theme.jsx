import React, { createContext, useState, useContext, useEffect, useMemo } from "react"
import { Helmet } from "react-helmet"

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const value = useMemo(
    () => ({ darkMode, setDarkMode, toggleDarkMode: () => setDarkMode(!darkMode) }),
    [darkMode, setDarkMode]
  )

  return (
    <>
      <Helmet>
        <script>
          {`
            // FOUC 🤷‍♂️
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.classList.add("dark");
          `}
        </script>
      </Helmet>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
