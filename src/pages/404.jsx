import React from "react"
import styled from "astroturf/react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"

const Error = styled.h1`
  background-clip: text;
  -webkit-text-fill-color: transparent;
  ${"@apply leading-normal font-sans font-semibold text-purple-700 bg-purple-700"};
  ${"@apply bg-gradient-to-r from-purple-700 via-red-500 to-yellow-500"};
`

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not Found" />
    <div className="container mx-auto h-full flex justify-center items-center">
      <div className="flex">
        <div className="px-6 text-left space-y-4">
          <Link to="/">
            <Error className="sm:text-9xl text-6xl text-center leading-none">404</Error>
          </Link>
          <div className="font-medium leading-tight text-center md:text-left">
            <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
)

export default NotFoundPage
