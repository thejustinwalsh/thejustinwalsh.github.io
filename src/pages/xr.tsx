import * as THREE from "three";
import { Canvas, extend, GroupProps, Object3DNode, ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera, GradientTexture, Center, Outlines } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState } from "react";
import { InfiniteGridHelper } from "../lib/three/infinite-grid";
import { ThemeProvider, useTheme } from "../context/theme";
import { AudioProvider, useAudio } from "../context/audio";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { createXRStore, XR as ThreeXR, XROrigin } from "@react-three/xr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVrCardboard } from "@fortawesome/free-solid-svg-icons";

type GLTFResult = GLTF & {
  nodes: {
    Text: THREE.Mesh;
  };
  materials: {};
};

extend({ InfiniteGridHelper });
declare module "@react-three/fiber" {
  interface ThreeElements {
    infiniteGridHelper: Object3DNode<InfiniteGridHelper, typeof InfiniteGridHelper>;
  }
}

const store = createXRStore({
  emulate: import.meta.env.MODE === "development",
});

function Title({
  darkMode,
  onClick,
  ...props
}: GroupProps & { darkMode?: boolean; onClick?: (e: ThreeEvent<MouseEvent>) => void }) {
  const { nodes } = useGLTF("./models/title.glb") as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        // @ts-ignore
        geometry={nodes.Text.geometry}
        // @ts-ignore
        material={nodes.Text.material}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
      >
        <meshStandardMaterial attach="material" metalness={0.2} roughness={0.4}>
          <GradientTexture
            rotation={-Math.PI / 2}
            stops={[0.0, 0.5, 1.0]}
            colors={["#eab308", "#ef4444", "#7e22ce"]}
          />
        </meshStandardMaterial>
        <Outlines color={darkMode ? "black" : "white"} thickness={1} />
      </mesh>
    </group>
  );
}

function Scene() {
  const { darkMode } = useTheme();
  const { playNote, start, stop } = useAudio();

  useEffect(() => {
    start();
    return () => stop();
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      const notes = ["C", "D", "E", "F", "G", "A", "B"];
      const note = notes[Math.floor((e.uv?.x ?? 0) * notes.length)];
      playNote(note);
    },
    [start, playNote],
  );

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.25, -1.5]} fov={90} />
      <ambientLight intensity={2} />
      <spotLight position={[0, 5, 0]} intensity={0.3} />
      <directionalLight position={[0, 3, -3]} intensity={0.7} />
      <Center position={[0, 0.2, -3]} rotation={[Math.PI / 2, 0, 0]}>
        <Title darkMode={darkMode} onClick={handleClick} />
      </Center>
    </>
  );
}

export default function XR() {
  const [xrActive, setXRActive] = useState(false);

  return (
    <ThemeProvider>
      <AudioProvider>
        <div className="relative h-screen w-screen bg-white transition-none dark:bg-black">
          <Canvas shadows>
            <ThreeXR store={store}>
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
              <XROrigin position={[0, -1.35, -1.5]} />
            </ThreeXR>
          </Canvas>
        </div>
        <button
          hidden={xrActive}
          className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/3 text-black dark:text-white"
          onClick={() => {
            setXRActive(true);
            store.enterVR();
          }}
        >
          <FontAwesomeIcon icon={faVrCardboard} size="4x" aria-label="enter vr" />
        </button>
      </AudioProvider>
    </ThemeProvider>
  );
}
