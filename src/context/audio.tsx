import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FMSynth } from "tone";

type AudioProviderProps = React.PropsWithChildren<{}>;
type AudioContextType = {
  synth: FMSynth | null;
  fetching: boolean;
  start: () => void;
  stop: () => void;
  playNote: (note: string) => void;
};

const AudioContext = createContext<AudioContextType>({} as AudioContextType);

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [synth, setSynth] = useState<FMSynth | null>(null);
  const [fetching, setFetching] = useState(false);

  const value = useMemo(
    () => ({
      synth,
      fetching,
      start: () => {
        if (!synth && !fetching) {
          setFetching(true);
          import("tone").then((Tone) => {
            (async () => {
              await Tone.start;
              const dist = new Tone.Distortion(0.8).toDestination();
              setSynth(new Tone.FMSynth().connect(dist));
              setFetching(false);
            })();
          });
        }
      },
      stop: () => {
        if (synth) {
          synth.dispose();
          setSynth(null);
        }
      },
      playNote: (note: string) => {
        if (synth) synth.triggerAttackRelease(`${note}2`, "16n");
      },
    }),
    [synth, fetching, setSynth, setFetching],
  );

  useEffect(
    () => () => {
      synth && synth.dispose();
    },
    [synth],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) throw new Error("useAudio must be used within a AudioProvider");

  return context;
};
