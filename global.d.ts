import "@react-three/fiber";
import { ReactThreeFiber } from "@react-three/fiber";
import * as THREE from "three";

declare namespace JSX {
  interface IntrinsicElements {
    group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
    primitive: ReactThreeFiber.Object3DNode<
      THREE.Object3D,
      typeof THREE.Object3D
    >;
    ambientLight: ReactThreeFiber.Object3DNode<
      THREE.AmbientLight,
      typeof THREE.AmbientLight
    >;
    hemisphereLight: ReactThreeFiber.Object3DNode<
      THREE.HemisphereLight,
      typeof THREE.HemisphereLight
    >;
    directionalLight: ReactThreeFiber.Object3DNode<
      THREE.DirectionalLight,
      typeof THREE.DirectionalLight
    >;
    // Add more elements if needed
  }
}
