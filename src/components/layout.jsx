import * as React from "react"
import styled from "astroturf/react"

const Layout = ({ children }) => {
  const Content = styled.div`
    ${"@apply mb-auto h-full p-10"};
  `

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      <Content>{children}</Content>
    </div>
  )
}

export default Layout
