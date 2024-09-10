import React, { useState, useEffect, useRef } from "react";
import { FaVolumeUp, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdPlayArrow, MdPause, MdVolumeUp } from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";

const COLORS_TOP = ["#36454F", "#A9A9A9", "#D3D3D3", "#71797E"];

function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customTopic, setCustomTopic] = useState("");
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

  const summarizeArticles = (articles) => {
    const podcastIntro =
      "Welcome to Jarayed, your go-to podcast for the latest news summaries. Today, we are bringing you the most important stories.";
    const allText = articles.map((article) => article.text).join(" ");
    const sentences = allText.split(". ");
    const filteredSentences = sentences.filter(
      (sentence) => sentence.length > 50
    );
    const summarySentences =
      filteredSentences.length >= 10
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
        `https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(
          query
        )}&language=en&earliest-publish-date=2024-04-01`,
        {
          method: "GET",
          headers: {
            "x-api-key": "213d96bd346e4cd9a2308af48b7655cf",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const articlesWithFullTextToggle = data.news.map((article) => ({
        ...article,
        showFullText: false,
      }));
      setArticles(articlesWithFullTextToggle);

      const summary = summarizeArticles(articlesWithFullTextToggle);
      articlesTextRef.current = summary;
      setTotalTime(calculateDuration(summary));
    } catch (error) {
      setError("Failed to fetch news");
    }

    setLoading(false);
  };

  const calculateDuration = (text) => {
    const wordsPerMinute = 200; 
    const wordCount = text.split(" ").length;
    return ((wordCount / wordsPerMinute) * 60) / rate;
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
      speechSynthesisUtterance.current = new SpeechSynthesisUtterance(
        articlesTextRef.current
      );
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
      <div className="w-full flex justify-center mb-8">
        <motion.div
          style={{ border, boxShadow }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="group relative flex justify-around md:w-96 border items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
        >
          <motion.input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                fetchNews(customTopic); 
              }
            }}
            placeholder="Enter a Keyword"
            className="text-center w-full placeholder-gray-300 bg-transparent focus:outline-0 text-white"
          />
          <FiArrowRight
            className="transition-transform group-hover:-rotate-45 group-active:-rotate-12"
            onClick={() => fetchNews(customTopic)} 
          />
        </motion.div>
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && articles.length > 0 && (
        <>
          <div className="flex justify-center items-center flex-col m-20">
            <h1 className="max-w-xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-xl font-medium leading-tight text-transparent sm:text-2xl sm:leading-tight md:text-4xl md:leading-tight">
              News Summary Podcast 👇
            </h1>

            <div className="flex items-center bg-gray-950/10 border rounded-full px-6 py-3 mx-auto w-full max-w-md mb-8 text-gray-50 mt-5">
              <button
                onClick={handlePlayPause}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
              >
                {isSpeaking ? (
                  <MdPause size={24} className="text-white" />
                ) : (
                  <MdPlayArrow size={24} className="text-white" />
                )}
              </button>

              <div className="flex-grow flex flex-col justify-center items-center mx-4">
                <span className="text-sm">
                  {elapsedTime.toFixed(2)}s / {totalTime.toFixed(2)}s
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
              >
                <MdVolumeUp size={24} className="text-white" />
              </button>
            </div>
          </div>

          {showOptions && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="rate" className="text-sm text-gray-700">
                  Rate:
                </label>
                <input
                  id="rate"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="pitch" className="text-sm text-gray-700">
                  Pitch:
                </label>
                <input
                  id="pitch"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="voice" className="text-sm text-gray-700">
                  Voice:
                </label>
                <select
                  id="voice"
                  value={selectedVoice ? selectedVoice.name : ""}
                  onChange={(e) =>
                    setSelectedVoice(
                      voices.find((voice) => voice.name === e.target.value)
                    )
                  }
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <h1 className="max-w-xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-xl font-medium leading-tight text-transparent sm:text-2xl sm:leading-tight md:text-4xl md:leading-tight">
            Relevant Headlines
          </h1>
          <ul className="space-y-4 mx-16">
            {articles.map((article, index) => (
              <li
                key={index}
                className="relative p-4  rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <button
                  onClick={() => speakText(article.title)}
                  className="absolute top-4 right-4 text-blue-500 hover:text-blue-600"
                >
                  <FaVolumeUp size={20} className="text-gray-400" />
                </button>
                <h2 className="text-xl font-semibold">{article.title}</h2>
                <p className="text-gray-600 mt-2">
                  By {article.author || "Unknown"}
                </p>
                {article.showFullText ? (
                  <p className="mt-2 text-gray-700">{article.text}</p>
                ) : (
                  <p className="mt-2 text-gray-700">
                    {article.text.slice(0, 200)}...
                  </p>
                )}
                <button
                  onClick={() => toggleFullText(index)}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  {article.showFullText ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:underline mt-2 ml-10 inline-block"
                >
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
