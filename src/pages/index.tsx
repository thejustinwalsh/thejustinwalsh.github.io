import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faGithub, faLinkedin, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { useAudio } from "../context/audio";
import Layout from "../components/layout";
import Title from "../components/title";

const SocialIcons = () => {
  const { playNote } = useAudio();

  return (
    <div className="text-1xl flex text-center align-middle font-normal leading-none text-black transition-none dark:text-white sm:text-3xl md:text-5xl">
      <a href="https://x.com/thejustinwalsh" className="flex-grow">
        <FontAwesomeIcon
          className="transform transition-transform duration-200 hover:scale-125"
          icon={faXTwitter}
          size="1x"
          aria-label="X"
          onMouseEnter={() => playNote("C")}
        />
        <span className="hidden">Twitter</span>
      </a>
      <a href="https://github.com/thejustinwalsh" className="flex-grow">
        <FontAwesomeIcon
          className="transform transition-transform duration-200 hover:scale-125"
          icon={faGithub}
          size="1x"
          aria-label="GitHub"
          onMouseEnter={() => playNote("D")}
        />
        <span className="hidden">Github</span>
      </a>
      <a href="https://www.linkedin.com/in/justinwalsh/" className="flex-grow">
        <FontAwesomeIcon
          className="transform transition-transform duration-200 hover:scale-125"
          icon={faLinkedin}
          size="1x"
          aria-label="Linkedin"
          onMouseEnter={() => playNote("E")}
        />
        <span className="hidden">LinkedIn</span>
      </a>
      <a href="https://discord.gg/6nGuzvQcpB" className="flex-grow">
        <FontAwesomeIcon
          className="transform transition-transform duration-200 hover:scale-125"
          icon={faDiscord}
          size="1x"
          aria-label="Discord"
          onMouseEnter={() => playNote("G")}
        />
        <span className="hidden">Discord</span>
      </a>
    </div>
  );
};

const IndexPage = () => (
  <Layout>
    <Title title="Home" />
    <div className="container mx-auto flex h-full items-center justify-center">
      <div className="flex">
        <div className="px-6 text-left">
          <h1
            className={`bg-black bg-gradient-to-r from-purple-700 via-red-500 to-yellow-500 bg-clip-text text-center font-sans text-4xl font-semibold leading-normal text-black text-transparent sm:text-7xl md:text-left md:text-8xl`}
          >
            Justin Walsh
          </h1>
          <SocialIcons />
        </div>
      </div>
    </div>
  </Layout>
);

export default IndexPage;
