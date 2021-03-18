import React from "react"
import styled from "astroturf/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTwitter, faGithub, faLinkedin, faDiscord } from "@fortawesome/free-brands-svg-icons"

import Layout from "../components/layout"
import SEO from "../components/seo"

const Greeting = styled.h1`
  background-clip: text;
  -webkit-text-fill-color: transparent;
  ${"@apply leading-normal font-sans font-semibold text-black bg-black"};
  ${"@apply bg-gradient-to-r from-purple-700 via-red-500 to-yellow-500"};
`

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <div className="container mx-auto h-full flex justify-center items-center">
      <div className="flex">
        <div className="px-6 text-left">
          <Greeting className="sm:text-7xl md:text-8xl text-4xl md:text-left text-center">
            Justin Walsh
          </Greeting>
          <div className="flex font-normal leading-none align-middle text-center text-black dark:text-white sm:text-3xl md:text-5xl text-1xl transition-none">
            <a href="https://twitter.com/thejustinwalsh" className="flex-grow">
              <FontAwesomeIcon icon={faTwitter} size="1x" alt="twitter" />
              <span className="hidden">Twitter</span>
            </a>
            <a href="https://github.com/thejustinwalsh" className="flex-grow">
              <FontAwesomeIcon icon={faGithub} size="1x" alt="github" />
              <span className="hidden">Github</span>
            </a>
            <a href="https://www.linkedin.com/in/justinwalsh/" className="flex-grow">
              <FontAwesomeIcon icon={faLinkedin} size="1x" alt="linkedin" />
              <span className="hidden">LinkedIn</span>
            </a>
            <a href="https://discordapp.com/channels/@me/223220721143382017/" className="flex-grow">
              <FontAwesomeIcon icon={faDiscord} size="1x" alt="discord" />
              <span className="hidden">Discord</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </Layout>
)

export default IndexPage
