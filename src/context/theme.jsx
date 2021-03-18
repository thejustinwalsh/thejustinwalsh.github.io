import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { Helmet } from "react-helmet"

const ThemeContext = createContext()
const js = (s, ...args) => s.map((ss, i) => `${ss}${args[i] || ""}`).join("")

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  )

  useEffect(
    () =>
      darkMode
        ? document.documentElement.classList.add("dark")
        : document.documentElement.classList.remove("dark"),
    [darkMode]
  )

  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const queryChanged = e => setDarkMode(e.matches)
    darkQuery.addEventListener("change", queryChanged)

    // Prevent first render fade (dynamically apply transition)
    Array.from(document.getElementsByClassName("transition-none")).forEach(el => {
      el.classList.remove("transition-none")
      el.classList.add("transition-color")
      el.classList.add("duration-1000")
    })

    return () => {
      darkQuery.removeEventListener("change", queryChanged)
    }
  }, [setDarkMode])

  const value = useMemo(
    () => ({ darkMode, setDarkMode, toggleDarkMode: () => setDarkMode(!darkMode) }),
    [darkMode, setDarkMode]
  )

  return (
    <>
      <Helmet>
        <script>
          {js`if (window.matchMedia("(prefers-color-scheme: dark)").matches) { document.documentElement.classList.add("dark"); }`}
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
