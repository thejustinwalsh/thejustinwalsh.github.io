import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

const AudioContext = createContext()

export const AudioProvider = ({ children }) => {
  const [synth, setSynth] = useState(null)
  const [fetching, setFetching] = useState(false)

  const value = useMemo(
    () => ({
      synth,
      fetching,
      start: () => {
        if (!synth && !fetching) {
          setFetching(true)
          import("tone").then(Tone => {
            ;(async () => {
              await Tone.start
              const dist = new Tone.Distortion(0.8).toDestination()
              setSynth(new Tone.FMSynth().connect(dist))
              setFetching(false)
            })()
          })
        }
      },
      stop: () => {
        if (synth) {
          synth.dispose()
          setSynth(null)
        }
      },
      playNote: note => {
        if (synth) synth.triggerAttackRelease(`${note}2`, "16n")
      },
    }),
    [synth, fetching, setSynth, setFetching]
  )

  useEffect(() => () => synth && synth.dispose(), [synth])

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (context === undefined) throw new Error("useAudio must be used within a AudioProvider")

  return context
}
