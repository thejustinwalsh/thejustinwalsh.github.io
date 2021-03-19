import React from "react"
import styled from "astroturf/react"

import { ThemeProvider } from "../context/theme"
import { AudioProvider } from "../context/audio"
import Header from "./header"

const Layout = ({ children }) => {
  const Content = styled.div`
    ${"@apply mb-auto h-full p-10"};
  `

  return (
    <ThemeProvider>
      <AudioProvider>
        <div className="flex flex-col h-screen bg-white dark:bg-black transition-none">
          <Header />
          <Content>{children}</Content>
        </div>
      </AudioProvider>
    </ThemeProvider>
  )
}

export default Layout
