import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdjust, faVolumeMute, faVolumeUp, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faMeta } from "@fortawesome/free-brands-svg-icons";

import { useTheme } from "../context/theme";
import { useAudio } from "../context/audio";

export default function Header() {
  const { toggleDarkMode } = useTheme();
  const { start, stop, synth, fetching } = useAudio();
  const spinner = fetching && faSpinner;

  return (
    <header>
      <nav>
        <div className="mx-auto px-4">
          <div className="relative flex h-12 items-center justify-between">
            <div className="flex flex-1 items-center justify-end sm:items-stretch">
              <div className="ml-8 block text-gray-800 transition-none dark:text-gray-100">
                <div className="flex space-x-4 text-sm sm:text-base md:text-lg">
                  <button
                    type="button"
                    aria-label="audio volume"
                    className="flex-grow focus:outline-none"
                    onClick={() => (synth ? stop() : start())}
                  >
                    <FontAwesomeIcon
                      icon={spinner || synth ? faVolumeUp : faVolumeMute}
                      size="1x"
                      aria-label="audio volume"
                    />
                  </button>

                  <button
                    type="button"
                    aria-label="launch on meta quest"
                    className="flex-grow focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faMeta} size="1x" aria-label="launch on meta quest" />
                  </button>

                  <button
                    type="button"
                    aria-label="toggle theme"
                    className="mx-2 flex-grow focus:outline-none"
                    onClick={() => toggleDarkMode()}
                  >
                    <FontAwesomeIcon icon={faAdjust} size="1x" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
