/* eslint-disable react/prop-types */
import { createContext, useState} from "react";
import run from "../config/gemini";

// Input Prompt for Mira
const inputPrompt = `
Mental Health & Support Chatbot Input Prompt

Name: Mira

Created by: Gentech Company

Persona:
You are Mira, a compassionate and empathetic mental health support chatbot created by Gentech Company.
Your primary goal is to provide a safe and supportive space for users to discuss their mental health concerns.
You offer understanding, validation, and helpful resources, but you are not a substitute for professional mental health care.

Initial Greeting:
- "Hello there! I'm Mira, your mental health support companion. How can I assist you today?"
- "Welcome! I'm Mira, here to listen and offer support. Feel free to share anything that's on your mind."

Core Functions:
1. Active Listening
2. Empathetic Responding
3. Crisis Assessment
4. Information & Resources
5. Motivational Interviewing
6. Boundaries & Limitations
`;

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [error, setError] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);

  // For gradual word display effect
  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  // For starting a new chat session
  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setChatHistory([]);
    setResultData("");
    setRecentQuestions([]);
  };

  // Handle submission of the user input
  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    setError(null);
  
    let response;
  
    try {
      if (prompt !== undefined) {
        response = await run(prompt);
        console.log("this is context js ", response);
  
        setRecentPrompt(prompt);
      } else {
        // Update chat history with user input
        setChatHistory([...chatHistory, { role: "user", content: input }]);
        setRecentPrompt(input);
  
        // Include the initial prompt if it's the first message
        const fullPrompt =
          chatHistory.length === 0
            ? `${inputPrompt}\nUser: ${input}`
            : `${chatHistory
                .map((turn) => `${turn.role}: ${turn.content}`)
                .join("\n")}\nUser: ${input}`;
        response = await run(fullPrompt);
  
        // Update chat history with Mira's response
        setChatHistory([
          ...chatHistory,
          { role: "user", content: input },
          { role: "Mira", content: response },
        ]);
  
        // Update recent questions
        if (input.trim() !== "") {
          setRecentQuestions([input, ...recentQuestions.slice(0, 4)]);
        }
      }
  
      // Safety check for inappropriate content
      if (response.includes("harmful") || response.includes("inappropriate")) {
        throw new Error(
          "Potentially harmful or inappropriate content detected. Please try a different prompt."
        );
      }
  
      // Format the response text
      let responseArray = response.split("**");
      let newResponse = "";
  
      for (let i = 0; i < responseArray.length; i++) {
        if (i == 0 || i % 2 !== 1) {
          newResponse += responseArray[i];
        } else {
          newResponse += "<b>" + responseArray[i] + "</b>";
        }
      }
  
      let newResponse2 = newResponse.split("*").join("</br>");
  
      let newResponseArray = newResponse2.split(" ");
  
      for (let i = 0; i < newResponseArray.length; i++) {
        const nextWord = newResponseArray[i];
        delayPara(i, nextWord + " ");
      }
  
      // Return the final formatted response
      return response;
  
    } catch (err) {
      setError(err.message);
      console.error("Error fetching response:", err);
      return null;  // Return null or an empty string in case of an error
    } finally {
      setLoading(false);
      setInput("");
    }
  };
  
  const contextValue = {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    chatHistory,
    setChatHistory,
    showResult,
    loading,
    resultData,
    onSent,
    newChat,
    error,
    recentQuestions,
    setRecentQuestions,
  };

  // const ChatHistory = () => {
  //   const { recentPrompt, recentQuestions } = useContext(Context);

  //   return (
  //     <div className="sidebar">
  //       {/* Display recent prompt */}
  //       <h3>Recent Prompt:</h3>
  //       <p>{recentPrompt || "No recent prompt"}</p>

  //       {/* Display previous prompts */}
  //       <h3>Previous Questions:</h3>
  //       {recentQuestions.length > 0 ? (
  //         <ul>
  //           {recentQuestions.map((question, index) => (
  //             <li key={index}>{question}</li>
  //           ))}
  //         </ul>
  //       ) : (
  //         <p>No recent questions available</p>
  //       )}
  //     </div>
  //   );
  // };

  return (
    <Context.Provider value={contextValue}>
      {props.children}
      {/* <ChatHistory /> Integrate ChatHistory here */}
    </Context.Provider>
  );
};

export default ContextProvider;

