import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MdPlayCircleOutline, MdPauseCircleOutline, MdStopCircle } from 'react-icons/md';
import { motion } from 'framer-motion';
import Background from './components/Background';
import logo from './assets/jarayed-high-resolution-logo-black-transparent.png';

function SummaryPage() {
  const location = useLocation();
  const { summary } = location.state || { summary: '' };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const speechSynthesisUtterance = useRef(null);

  const podcastIntro = "Welcome to Jarayed, your go-to podcast for the latest news summaries. Today, we're bringing you the most important stories.";
  const fullText = `${podcastIntro} ${summary}`;

  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
      if (synthVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(synthVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  const voiceNames = {
    'Google US English': 'Alice',
    'Google UK English Male': 'Bob',
    'Google UK English Female': 'Catherine',
    'Google español': 'Diego',
    'Google français': 'Elise',
    'Google Deutsch': 'Fritz',
    'Google Italiano': 'Gina',
    'Google 日本語': 'Hiro',
    'Google 한국의': 'Jin',
    'Google 中文（普通话）': 'Kai',
    'Google русский': 'Lena',
    'Google Nederlands': 'Mila',
    'Google Polski': 'Nina',
    'Google português do Brasil': 'Paulo',
  };

  const speakText = () => {
    if (!isSpeaking && selectedVoice) {
      speechSynthesisUtterance.current = new SpeechSynthesisUtterance(fullText);
      speechSynthesisUtterance.current.voice = selectedVoice;
      speechSynthesisUtterance.current.rate = rate;
      speechSynthesisUtterance.current.pitch = pitch;

      speechSynthesisUtterance.current.onend = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(speechSynthesisUtterance.current);
      setIsSpeaking(true);
    }
  };

  const pauseSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  };

  const resumeSpeech = () => {
    if (!isSpeaking && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  };

  const stopSpeech = () => {
    if (isSpeaking || window.speechSynthesis.paused) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePlayPause = () => {
    if (isSpeaking) {
      pauseSpeech();
    } else {
      if (window.speechSynthesis.paused) {
        resumeSpeech();
      } else {
        speakText();
      }
    }
  };

  const handleRateChange = (e) => {
    setRate(e.target.value);
  };

  const handlePitchChange = (e) => {
    setPitch(e.target.value);
  };

  const handleVoiceChange = (e) => {
    const selected = voices.find(voice => voice.name === e.target.value);
    setSelectedVoice(selected);
  };

  const VoiceRates = [
    1,1.25,1.5,2
  ]

  console.log(rate)

  return (
    <Background>
    <div className="p-6 md:max-w-4xl w-96 mx-auto">
      <Link to="/Jarayed">
        <img
          src={logo}
          alt="Jarayed Logo"
          className="w-48 h-auto mx-auto mb-6 cursor-pointer"
        />
      </Link>

      <div className="flex justify-center items-center space-x-6 mb-6">
      <div className="mb-4 w-24">
        <label htmlFor="rate" className='block text-gray-400'>rate:</label>
        <select name="" id="rate" onChange={handleRateChange} className='bg-transparent focus:outline-none'>
          {
            VoiceRates.map((rateValue)=>{
              return <option defaultValue={VoiceRates[0]} className='bg-transparent' value={rateValue}>{rateValue}x</option>
            })
          }
        </select>
      </div>
        <motion.button
          onClick={handlePlayPause}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1, rotate: 15 }}
          className="text-blue-500 hover:text-blue-600 focus:outline-none"
          aria-label={isSpeaking ? 'Pause Speech' : 'Play Speech'}
        >
          {isSpeaking ? (
            <MdPauseCircleOutline size={64} className='text-gray-400'/>
          ) : (
            <MdPlayCircleOutline size={64} className='text-gray-300'/>
          )}
        </motion.button>
        <motion.button
          onClick={stopSpeech}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1, rotate: -15 }}
          className="text-blue-500 hover:text-blue-600 focus:outline-none"
          aria-label="Stop Speech"
        >
          <MdStopCircle size={64} className='text-gray-300'/>
        </motion.button>
        <div className="mb-4 w-24">
          <label htmlFor="pitch" className="block text-sm font-medium text-gray-700">
            Pitch: {pitch}
          </label>
          <input
            id="pitch"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={handlePitchChange}
            className="w-full bg-gray-400 range-input"
          />
        <div>
          <label htmlFor="voice" className="block text-sm font-medium text-gray-700">
            Voice:
          </label>
          <select
            id="voice"
            value={selectedVoice ? selectedVoice.name : ''}
            onChange={handleVoiceChange}
            className="w-full mt-1 block pl-3 pr-10 py-2 text-base bg-transparent focus:outline-none sm:text-sm rounded-md"
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voiceNames[voice.name] || voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>

      {/* Controls for Rate, Pitch, and Voice */}

      <h1 className="text-3xl font-bold text-center mb-4">Summarized News</h1>
      <div className="relative bg-transparent p-6 shadow-md rounded-lg border">
        <p className="text-lg text-gray-700 mb-4">{podcastIntro}</p>
        <p className="text-lg text-gray-400">{summary}</p>
      </div>
    </div>
    </Background>
  );
}

export default SummaryPage;
