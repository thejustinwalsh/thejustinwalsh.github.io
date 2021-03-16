import React from "react"
import styled from "astroturf/react"

import { ThemeProvider } from "../context/Theme"
import Header from "./header"

const Layout = ({ children }) => {
  const Content = styled.div`
    ${"@apply mb-auto h-full p-10"};
  `

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-white dark:bg-black">
        <Header />
        <Content>{children}</Content>
      </div>
    </ThemeProvider>
  )
}

export default Layout
