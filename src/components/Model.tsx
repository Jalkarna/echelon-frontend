import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Group as ThreeGroup } from "three";
import "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { Object3D, Group, AnimationMixer, AnimationAction } from "three";
import * as THREE from "three";
import { FaBars } from "react-icons/fa"; // Import hamburger icon from react-icons
import "./ThreeDModel.css"; // Import CSS for styling

interface MovementFrame {
  time: number;
  joints: {
    [jointName: string]: [number, number, number]; // x, y, z coordinates
  };
}

interface MovementsData {
  frames: MovementFrame[];
}

interface ThreeDModelProps {
  movements: MovementFrame[] | null;
  facial_expression?: string;
  hand_movement?: {
    type: string;
    movement: string;
    duration: number;
  };
}

function gatherBones(object: Object3D, bonesMap: Record<string, Object3D>) {
  if (object.name) {
    bonesMap[object.name] = object;
  }
  if (object.name.startsWith("face")) {
    bonesMap[object.name] = object;
  }
  for (let i = 0; i < object.children.length; i++) {
    gatherBones(object.children[i], bonesMap);
  }
}

interface ModelProps {
  mixer: React.MutableRefObject<AnimationMixer | null>; // Correctly typed mixer prop
  movements: MovementsData | null;
  facial_expression?: string;
  hand_movement?: { type: string; movement: string; duration: number };
  onAnimationsLoaded: (animations: THREE.AnimationClip[]) => void;
}

const Model: React.FC<ModelProps> = ({
  mixer,
  movements,
  facial_expression,
  hand_movement,
  onAnimationsLoaded,
}) => {
  const gltf = useLoader(GLTFLoader, "/models/stacy.glb");
  const texture = useLoader(TextureLoader, "/models/stacy.jpg", (loader) => {
    loader.crossOrigin = "anonymous";
  });
  const groupRef = useRef<Group>(null);
  const bonesMap = useRef<Record<string, Object3D>>({}).current;
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const { scene } = useThree();

  useEffect(() => {
    if (gltf && groupRef.current && mixer.current === null) {
      // Initialize mixer with GLTF scene only if it's not already initialized
      mixer.current = new AnimationMixer(gltf.scene);
      gatherBones(groupRef.current, bonesMap);
      console.log("Available bones:", Object.keys(bonesMap));

      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 0,
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.5,
          } as THREE.MeshPhongMaterialParameters & { skinning: boolean });

          if (texture) {
            texture.flipY = false;
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.needsUpdate = true;
          }

          child.material = material;
        }
      });

      // Pass animations to parent component
      onAnimationsLoaded(gltf.animations);
    }
    // Added mixer to dependencies to ensure it doesn't cause unnecessary re-renders
  }, [gltf, texture, onAnimationsLoaded, mixer]);

  // Reset animation when new movements arrive
  useEffect(() => {
    if (movements?.frames && movements.frames.length > 0) {
      console.log("New movements received:", movements);
      setStartTime(performance.now());
      setCurrentFrameIndex(0);
    }
  }, [movements]);

  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }

    if (!movements?.frames || !startTime || movements.frames.length === 0)
      return;

    const frames = movements.frames;
    const elapsed = (performance.now() - startTime) / 1000;

    if (
      currentFrameIndex >= frames.length - 1 ||
      elapsed >= frames[frames.length - 1].time
    ) {
      applyFrame(frames[frames.length - 1], bonesMap);
      return;
    }

    const currentFrame = frames[currentFrameIndex];
    const nextFrame = frames[currentFrameIndex + 1];

    if (elapsed >= nextFrame.time) {
      setCurrentFrameIndex(currentFrameIndex + 1);
      applyFrame(nextFrame, bonesMap);
    } else {
      const ratio =
        (elapsed - currentFrame.time) / (nextFrame.time - currentFrame.time);
      applyInterpolatedFrame(currentFrame, nextFrame, ratio, bonesMap);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={gltf.scene}
        scale={[1.9, 1.9, 1.9]}
        position={[0, -2.6, 0]}
      />
    </group>
  );
};

function applyFrame(frame: MovementFrame, bonesMap: Record<string, Object3D>) {
  const { joints } = frame;
  for (const jointName in joints) {
    const jointData = joints[jointName];
    const bone = bonesMap[jointName];
    if (!bone) {
      console.warn(`Bone not found: ${jointName}`);
      continue;
    }
    bone.position.set(...jointData);
  }
}

function applyInterpolatedFrame(
  frameA: MovementFrame,
  frameB: MovementFrame,
  ratio: number,
  bonesMap: Record<string, Object3D>
) {
  for (const jointName in frameB.joints) {
    const bone = bonesMap[jointName];
    if (!bone) {
      console.warn(`Bone not found: ${jointName}`);
      continue;
    }

    const dataA = frameA.joints[jointName] || [0, 0, 0];
    const dataB = frameB.joints[jointName];

    const newPx = dataA[0] + (dataB[0] - dataA[0]) * ratio;
    const newPy = dataA[1] + (dataB[1] - dataA[1]) * ratio;
    const newPz = dataA[2] + (dataB[2] - dataA[2]) * ratio;
    bone.position.set(newPx, newPy, newPz);
  }
}

const ThreeDModel: React.FC<ThreeDModelProps> = ({
  movements,
  facial_expression,
  hand_movement,
}) => {
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const [isDevMenuOpen, setIsDevMenuOpen] = useState<boolean>(false);
  const [currentAnimation, setCurrentAnimation] = useState<string>("");
  const mixerRef = useRef<AnimationMixer | null>(null);

  const handleAnimationsLoaded = (loadedAnimations: THREE.AnimationClip[]) => {
    setAnimations(loadedAnimations);
  };

  const toggleDevMenu = () => {
    setIsDevMenuOpen(!isDevMenuOpen);
  };

  const playSelectedAnimation = (animationName: string) => {
    if (animationName && mixerRef.current) {
      const action = mixerRef.current.clipAction(
        animations.find(
          (anim) => anim.name === animationName
        ) as THREE.AnimationClip
      );
      mixerRef.current.stopAllAction();
      action.reset().play();
      setCurrentAnimation(animationName);
    }
  };

  const parsedMovements = movements ? { frames: movements } : null;

  return (
    <div className="three-d-model-container">
      {/* Hamburger Icon */}
      <button className="hamburger-icon" onClick={toggleDevMenu}>
        <FaBars size={24} color="#fff" />
      </button>

      {/* Dev Menu Overlay */}
      {isDevMenuOpen && (
        <div className="dev-menu">
          <h3>Animations</h3>
          <ul>
            {animations.map((anim) => (
              <li key={anim.name}>
                <button onClick={() => playSelectedAnimation(anim.name)}>
                  {anim.name}
                </button>
              </li>
            ))}
          </ul>
          <button className="close-menu" onClick={toggleDevMenu}>
            Close
          </button>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 2, 3], fov: 35 }}
        className="h-full w-full"
      >
        <ambientLight intensity={1.2} />
        <hemisphereLight color="white" groundColor="#444" intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Model
            mixer={mixerRef} // Pass mixer reference to Model component
            movements={parsedMovements}
            facial_expression={facial_expression}
            hand_movement={hand_movement}
            onAnimationsLoaded={handleAnimationsLoaded}
          />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.8}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDModel;
