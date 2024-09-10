import React, { useState, useEffect, useRef } from 'react';
import { FaVolumeUp, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdPlayArrow, MdPause, MdVolumeUp } from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";
import { useMotionTemplate, useMotionValue, motion, animate } from "framer-motion";

const COLORS_TOP = ["#36454F", "#A9A9A9", "#D3D3D3", "#71797E"];

function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customTopic, setCustomTopic] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const speechSynthesisUtterance = useRef(null);
  const intervalRef = useRef(null);
  const articlesTextRef = useRef(""); 

  const color = useMotionValue("#36454F");

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      const englishVoices = synthVoices
        .filter((voice) => voice.lang.startsWith("en"))
        .slice(0, 4);
      setVoices(englishVoices);

      const defaultVoice =
        englishVoices.find((voice) => voice.name.includes("Daniel")) ||
        englishVoices[0];
      if (defaultVoice) {
        setSelectedVoice(defaultVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  // Summarize articles function with podcast intro
  const summarizeArticles = (articles) => {
    const podcastIntro = "Welcome to Jarayed, your go-to podcast for the latest news summaries. Today, we are bringing you the most important stories.";
    const allText = articles.map((article) => article.text).join(" ");
    const sentences = allText.split(". ");
    const filteredSentences = sentences.filter((sentence) => sentence.length > 50);
    const summarySentences = filteredSentences.length >= 10
      ? filteredSentences.slice(0, 10)
      : sentences.slice(0, 15);
    const summary = `${podcastIntro} ${summarySentences.join(". ")}.`;
    return summary;
  };

  const fetchNews = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(query)}&language=en&earliest-publish-date=2024-04-01`,
        {
          method: 'GET',
          headers: {
            'x-api-key': '213d96bd346e4cd9a2308af48b7655cf'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const articlesWithFullTextToggle = data.news.map(article => ({ ...article, showFullText: false }));
      setArticles(articlesWithFullTextToggle);

      // Automatically summarize the articles once fetched and add podcast intro
      const summary = summarizeArticles(articlesWithFullTextToggle);
      articlesTextRef.current = summary;
      setTotalTime(calculateDuration(summary));
    } catch (error) {
      setError('Failed to fetch news');
    }

    setLoading(false);
  };

  const calculateDuration = (text) => {
    const wordsPerMinute = 200; // Approximation
    const wordCount = text.split(" ").length;
    return (wordCount / wordsPerMinute) * 60 / rate;
  };

  const handlePlayPause = () => {
    if (isSpeaking) {
      window.speechSynthesis.pause();
      clearInterval(intervalRef.current);
      setIsSpeaking(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        intervalRef.current = setInterval(updateElapsedTime, 1000);
      } else {
        speakText();
      }
      setIsSpeaking(true);
    }
  };

  const speakText = () => {
    if (selectedVoice && articlesTextRef.current) {
      speechSynthesisUtterance.current = new SpeechSynthesisUtterance(articlesTextRef.current);
      speechSynthesisUtterance.current.voice = selectedVoice;
      speechSynthesisUtterance.current.rate = rate;
      speechSynthesisUtterance.current.pitch = pitch;

      speechSynthesisUtterance.current.onstart = () => {
        intervalRef.current = setInterval(updateElapsedTime, 1000);
      };

      speechSynthesisUtterance.current.onend = () => {
        clearInterval(intervalRef.current);
        setIsSpeaking(false);
        setElapsedTime(0);
        setProgress(0);
      };

      window.speechSynthesis.speak(speechSynthesisUtterance.current);
    }
  };

  const updateElapsedTime = () => {
    setElapsedTime((prev) => {
      const newTime = prev + 1;
      setProgress((newTime / totalTime) * 100);
      return newTime;
    });
  };

  const toggleFullText = (index) => {
    setArticles((prevArticles) =>
      prevArticles.map((article, i) =>
        i === index
          ? { ...article, showFullText: !article.showFullText }
          : article
      )
    );
  };

  return (
    <div className="relative w-full flex-col items-center">
      <div className='w-full flex justify-center mb-8'>
        <motion.button
          style={{ border, boxShadow }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="group relative flex justify-around md:w-96 border  items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
        >
          <motion.input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter a Keyword"
            className="rounded-lg sm:w-1/4 md:w-3/4 bg-transparent focus:outline-0 text-right"
          />
          <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" onClick={() => fetchNews(customTopic)} />
        </motion.button>
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && articles.length > 0 && (
        <>
          {/* Podcast Control */}
          <div className="flex items-center bg-gray-200 rounded-full p-2 mx-auto w-full max-w-md mb-8">
            <button onClick={handlePlayPause} className="text-gray-700">
              {isSpeaking ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
            </button>
            <span className="mx-4 text-gray-700">
              {elapsedTime.toFixed(2)}s / {totalTime.toFixed(2)}s
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="flex-grow mx-4"
            />
            <MdVolumeUp size={24} className="text-gray-700" />
            <button onClick={() => setShowOptions(!showOptions)} className="text-gray-700">
              {showOptions ? "Hide Options" : "Show Options"}
            </button>
          </div>

          {showOptions && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="rate" className="text-sm text-gray-700">Rate:</label>
                <input id="rate" type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="pitch" className="text-sm text-gray-700">Pitch:</label>
                <input id="pitch" type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(e.target.value)} />
              </div>
              <div>
                <label htmlFor="voice" className="text-sm text-gray-700">Voice:</label>
                <select
                  id="voice"
                  value={selectedVoice ? selectedVoice.name : ''}
                  onChange={(e) => setSelectedVoice(voices.find(voice => voice.name === e.target.value))}
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <ul className="space-y-4 mx-16">
            {articles.map((article, index) => (
              <li key={index} className="relative p-4  rounded-lg hover:shadow-lg transition-shadow duration-300">
                <button onClick={() => speakText(article.title)} className="absolute top-4 right-4 text-blue-500 hover:text-blue-600">
                  <FaVolumeUp size={20} className="text-gray-400" />
                </button>
                <h2 className="text-xl font-semibold">{article.title}</h2>
                <p className="text-gray-600 mt-2">By {article.author || 'Unknown'}</p>
                {article.showFullText ? (
                  <p className="mt-2 text-gray-700">{article.text}</p>
                ) : (
                  <p className="mt-2 text-gray-700">{article.text.slice(0, 200)}...</p>
                )}
                <button onClick={() => toggleFullText(index)} className="mt-2 text-blue-500 hover:underline">
                  {article.showFullText ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                </button>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline mt-2 ml-10 inline-block">
                  Take me there
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default News;
