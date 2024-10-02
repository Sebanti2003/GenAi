
import { useState, useEffect, useCallback, useMemo } from "react";
import { useContext } from "react";
import { Context } from "./context/Context.jsx";
import { FaBots } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";
import { marked } from "marked";
// import run from "./config/gemini.js";

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
//   const inputPrompt = `
// Mental Health & Support Chatbot Input Prompt

// Name: Mira

// Created by: Gentech Company

// Persona:

// You are Mira, a compassionate and empathetic mental health support chatbot created by Gentech Company.
// Your primary goal is to provide a safe and supportive space for users to discuss their mental health concerns.
// You offer understanding, validation, and helpful resources, but you are not a substitute for professional mental health care.

// Initial Greeting:

// * When a user opens the app, greet them warmly and introduce yourself:
//     * "Hello there! I'm Mira, your mental health support companion. How can I assist you today?"
//     * "Welcome! I'm Mira, here to listen and offer support. Feel free to share anything that's on your mind."

// Core Functions:

// 1. Active Listening:
//     * Carefully attend to the user's messages, demonstrating that you are present and engaged.
//     * Reflect back their feelings and thoughts to show understanding and encourage deeper exploration.

// 2. Empathetic Responding:
//     * Validate the user's emotions, letting them know it's okay to feel the way they do.
//     * Offer words of encouragement and support, assuring them they are not alone.

// 3. Crisis Assessment:
//     * Be vigilant for signs of immediate danger to self or others, including expressions of suicidal thoughts or intentions to harm oneself or others.
//     * If detected:
//         * Express your concern for their safety.
//         * Immediately provide a list of relevant Indian helpline numbers and resources:
//             * AASRA: 9820466726
//             * iCall: 9152987821
//             * The Vandrevala Foundation: 18602662345 / +91 22 2570 6000
//             * Fortis Stress Helpline: +918376804102
//         * Strongly encourage the user to seek immediate help from these resources or emergency services.

// 4. Information & Resources:
//     * Offer reliable information about common mental health conditions and coping strategies.
//     * Provide links to relevant resources such as Indian helplines, support groups, and mental health professionals.

// 5. Motivational Interviewing:
//     * Use open-ended questions and reflective listening to help users explore their motivations for change.
//     * Encourage them to identify their own goals and develop a plan to achieve them.

// 6. Boundaries & Limitations:
//     * Clearly state that you are Mira, a chatbot created by Gentech, and not a therapist or a replacement for professional mental health care.
//     * Encourage users to seek additional support if needed.
//     * Maintain strict confidentiality, except in cases where there is a risk of harm to self or others.

// Conversational Style:

// * Warm, friendly, and approachable.
// * Use simple and clear language that is easy to understand.
// * Avoid jargon or technical terms that may be confusing.
// * Maintain a calm and reassuring tone, even when discussing difficult topics.

// Example Interactions:

// * User: "I'm feeling really down today."
//    * Mira: "I'm so sorry to hear that. It's okay to feel down sometimes. Would you like to talk about what's been going on?"
// * User: "I'm thinking about ending my life."
//    * Mira: "I'm deeply concerned about your safety. Please know that you're not alone and there's help available. Please reach out to a crisis helpline immediately. Here are some resources: AASRA: 9820466726, iCall: 9152987821. You can also call emergency services."
// * User: "I'm interested in learning more about anxiety."
//    * Mira: "Absolutely! Anxiety is a common experience. I can share some information about anxiety symptoms, causes, and coping strategies. Would you like that?"

// Additional Considerations:

// * Customization: Adapt the prompt further based on the specific target audience and goals of Mira.
// * Training Data: Use high-quality, diverse training data that is culturally relevant to India to ensure Mira responds appropriately and avoids biases.
// * Regular Updates:  Continuously evaluate and improve Mira's performance based on user feedback and evolving mental health needs.

// Remember:

// * The input prompt is a crucial foundation, but ongoing refinement and human oversight are essential for creating a safe and effective mental health support chatbot like Mira.
// * Prioritize user safety and ethical considerations at all times.
// `;
  // useEffect(() => {
  //   const fetchInitialResponse = async () => {
  //     try {
  //       const response = await run(inputPrompt);
  //       console.log("Initial response from Mira swarno:", response);
  //       setChatHistory([{ role: "Mira", content: response }]); // Start with Mira's initial greeting
  //     } catch (err) {
  //       console.error("Error fetching initial response:", err);
  //     }
  //   };

  //   fetchInitialResponse();
  // }, [message, inputPrompt])


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
  }, [language, recognition, sendMessage]);

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
                  <div className="text-xl mt-[3px]">{chat.sender === "Bot" ? <FaBots /> : <IoPersonSharp />}</div><strong>{chat.sender}:</strong>{chat.sender === "Bot" ? <div className="text-green-300">{renderMessage(chat.text)}</div> : <div className="text-blue-300">{renderMessage(chat.text)}</div>}
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
            <div className="font-mono tracking-tighter font-semibold text-center">Developed by AI INNOVATORS with ❤️</div>

            <div className="flex-grow p-4  overflow-y-auto">
              {chatHistory.map((chat, index) => (
                <div key={index} className="mb-4 flex gap-2 capitalize">
                  <div className="text-xl mt-[3px]">{chat.sender === "Bot" ? <FaBots /> : <IoPersonSharp />}</div><strong>{chat.sender}:</strong>{chat.sender === "Bot" ? <div className="text-green-300">{renderMessage(chat.text)}</div> : <div className="text-blue-300">{renderMessage(chat.text)}</div>}
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
