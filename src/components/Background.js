
import React from 'react'
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
export default function Background({children,className}) {
    const color = useMotionValue("#36454F");
    const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  return (
    <motion.section
    style={{
      backgroundImage,
    }}
    className={`relative  min-h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200 `}
  >
        <div className="relative z-10 flex flex-col items-center">
            {children}
        </div>
    <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
    </div>
    </motion.section>
  )
}
