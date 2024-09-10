import { useState } from "react";
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect } from "react";
import Background from "./components/Background";

import News from "./News";

export default function Home() {
  const [showAlert, setShowAlert] = useState(true); 

  return (
    <Background>
      {showAlert && (
        <div
          role="alert"
          className="fixed top-4 left-4 z-50 w-80 rounded border-s-4 border-red-500 bg-red-500 text-white p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <strong className="block font-medium"> THI IS NOT EVEN MVP </strong>
            </div>
            <button
              onClick={() => setShowAlert(false)} 
              className="text-white font-bold px-2"
            >
              X
            </button>
          </div>
          <p className="mt-2 text-sm">
            it's only Poc (Profe of Concept) the new app will have multiple products this is only one of them
          </p>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-1.5 inline-block rounded-full bg-gray-600/50 px-3 py-1.5 text-sm">
          New Beta Release 🔥 !
        </span>
        <h1 className="max-w-3xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-medium leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
          Create Your Podcast in Just Minutes!
        </h1>
        <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
          Dive into the world of podcasting effortlessly!, Simply choose your
          theme, set the duration, and captivate your audience. Unleash your
          potential—start today!
        </p>
        <News />
      </div>
    </Background>
  );
}
