const tailwindcss = require("tailwindcss")
const autoprefixer = require("autoprefixer")
const postcssNested = require("postcss-nested")

module.exports = {
  siteMetadata: {
    title: `thejustinwalsh`,
    description: `Minimal maintnance landing page for some kind of web presence built with <a href="https://www.gatsbyjs.com/">Gatsby]</a>, <a href="https://github.com/4Catalyzer/astroturf">Astroturf</a>, and <a href="https://tailwindcss.com/">Tailwind</a>.`,
    author: `@thejustinwalsh`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `thejustinwalsh`,
        short_name: `tjw`,
        start_url: `/`,
        background_color: `#FFFFFF`,
        theme_color: `#FFFFFF`,
        display: `minimal-ui`,
        icon: `src/images/tjw-icon.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-typescript`,
    `gatsby-plugin-fontawesome-css`,
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [tailwindcss, autoprefixer, postcssNested],
      },
    },
    {
      resolve: `gatsby-plugin-astroturf`,
      options: {
        enableDynamicInterpolations: true,
      },
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        precachePages: [],
      },
    },
  ],
}
