import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect } from "react";
import Background from "./components/Background";

import News from "./News";

export default function Home() {
  


  return (
    <Background>
        <div className="relative z-10 flex flex-col items-center">
            <span className="mb-1.5 inline-block rounded-full bg-gray-600/50 px-3 py-1.5 text-sm">
            New Beta Release 🔥 !
            </span>
            <h1 className="max-w-3xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-medium leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
            Create Your Podcast in Just Minutes!
            </h1>
            <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
                Dive into the world of podcasting effortlessly!, Simply choose your theme, set the duration, and captivate your audience. Unleash your potential—start today!
            </p>
            <News/>
        </div>
    </Background>
  );
};