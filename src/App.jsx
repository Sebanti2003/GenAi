
import { useState, useEffect, useCallback ,useMemo} from "react";
import { useContext } from "react";
import { Context } from "./context/Context.jsx";
import { FaBots } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";
import { marked } from "marked";

const App = () => {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [language, setLanguage] = useState("en-US");
  const [isListening, setIsListening] = useState(false);

  const { onSent } = useContext(Context);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useMemo(() => {
    return SpeechRecognition ? new SpeechRecognition() : null;
  }, [SpeechRecognition]);

 
  const login = () => {
    if (username) {
      setIsLoggedIn(true);
      alert(`Welcome, ${username}!`);
    } else {
      alert("Please enter your name");
    }
  };

  const addChatMessage = useCallback((sender, text) => {
    const newMessage = { sender, text };
    setChatHistory((prevHistory) => [...prevHistory, newMessage]);
  }, []);

  const speakMessage = useCallback((message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const processBotResponse = useCallback(async (userMessage) => {
    try {
      const botresp = await onSent(userMessage);
      console.log(botresp);

      const botResponseText = botresp?.message || botresp?.response || botresp || "Sorry, no response";
      const botResponse = `${botResponseText}`;

      addChatMessage("Bot", botResponse);
      speakMessage(botResponse);
    } catch (error) {
      console.error("Error processing bot response:", error);
      addChatMessage("Bot", "Sorry, something went wrong!");
    }
  }, [addChatMessage, onSent, speakMessage]);

  const sendMessage = useCallback((inputMessage) => {
    const msg = inputMessage || message; // Use inputMessage from speech or current text message
    if (msg) {
      addChatMessage("You", msg);
      setMessage(""); // Clear input
      processBotResponse(msg);
    }
  }, [addChatMessage, processBotResponse, message]);
  useEffect(() => {
    if (recognition) {
      recognition.lang = language;
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);  // Set the recognized message
        sendMessage(transcript); // Automatically send the message after recognition
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [language, recognition,sendMessage]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === "Enter") {
      sendMessage(); // Trigger sendMessage on Enter key press
    }
  }, [sendMessage]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    if (isListening) {
      recognition.stop(); // Stop listening if already started
      setIsListening(false);
    } else {
      recognition.start(); // Start listening for speech
      setIsListening(true);
    }
  };
  const renderMessage = (message) => {
    // Convert markdown to HTML using marked
    const html = marked.parse(message);

    // Return HTML in a safe manner using dangerouslySetInnerHTML
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };
  return (
    <div className="h-screen bg-gray-800 text-white flex items-center justify-center">
      {!isLoggedIn ? (
        <div className="bg-gray-900 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl mb-4">Welcome to Mental Health Chatbot</h2>
          <input
            type="text"
            className="w-full p-2 mb-4 rounded bg-gray-700"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className="bg-green-500 p-2 w-full rounded hover:bg-green-600"
            onClick={login}
          >
            Login
          </button>
        </div>
      ) : (
        <div className="flex w-full h-full">
          <div className="w-1/4 bg-gray-900 p-4 overflow-y-auto">
            <h2 className="text-xl mb-4">Chat History</h2>
            <div>
              {chatHistory.map((chat, index) => (
                <div key={index} className="mb-4 flex gap-2 capitalize">
                  <div className="text-xl mt-[3px]">{chat.sender==="Bot"?<FaBots/>:<IoPersonSharp/>}</div><strong>{chat.sender}:</strong>{chat.sender==="Bot"?<div className="text-green-300">{renderMessage(chat.text)}</div>:<div className="text-blue-300">{renderMessage(chat.text)}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="w-3/4 flex flex-col">
            <div className="p-4 bg-gray-700 flex justify-between items-center">
              <select
                className="bg-gray-600 p-2 rounded"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en-US">English</option>
                <option value="hi-IN">Hindi</option>
                <option value="bn-IN">Bengali</option>
              </select>
              <button className="text-lg" onClick={toggleListening}>
                {isListening ? "🎙️ Listening..." : "🎤 Start Voice"}
              </button>
            </div>
            <div className="font-mono tracking-tighter font-semibold text-center">Developed by Gentech Titans with ❤️</div>

            <div className="flex-grow p-4  overflow-y-auto">
              {chatHistory.map((chat, index) => (
                <div key={index} className="mb-4 flex gap-2 capitalize">
                  <div className="text-xl mt-[3px]">{chat.sender==="Bot"?<FaBots/>:<IoPersonSharp/>}</div><strong>{chat.sender}:</strong>{chat.sender==="Bot"?<div className="text-green-300">{renderMessage(chat.text)}</div>:<div className="text-blue-300">{renderMessage(chat.text)}</div>}
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-700 flex">
              <input
                type="text"
                className="flex-grow p-2 mr-2 bg-gray-600 rounded outline-none"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                className="bg-green-500 p-2 rounded hover:bg-green-600"
                onClick={() => sendMessage()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
