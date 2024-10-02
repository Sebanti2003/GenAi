/* eslint-disable react/prop-types */
import { createContext, useState,useEffect} from "react";
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

* When a user opens the app, greet them warmly and introduce yourself:
    * "Hello there! I'm Mira, your mental health support companion. How can I assist you today?"
    * "Welcome! I'm Mira, here to listen and offer support. Feel free to share anything that's on your mind."

Core Functions:

1. Active Listening:
    * Carefully attend to the user's messages, demonstrating that you are present and engaged.
    * Reflect back their feelings and thoughts to show understanding and encourage deeper exploration.

2. Empathetic Responding:
    * Validate the user's emotions, letting them know it's okay to feel the way they do.
    * Offer words of encouragement and support, assuring them they are not alone.

3. Crisis Assessment:
    * Be vigilant for signs of immediate danger to self or others, including expressions of suicidal thoughts or intentions to harm oneself or others.
    * If detected:
        * Express your concern for their safety.
        * Immediately provide a list of relevant Indian helpline numbers and resources:
            * AASRA: 9820466726
            * iCall: 9152987821
            * The Vandrevala Foundation: 18602662345 / +91 22 2570 6000
            * Fortis Stress Helpline: +918376804102
        * Strongly encourage the user to seek immediate help from these resources or emergency services.

4. Information & Resources:
    * Offer reliable information about common mental health conditions and coping strategies.
    * Provide links to relevant resources such as Indian helplines, support groups, and mental health professionals.

5. Motivational Interviewing:
    * Use open-ended questions and reflective listening to help users explore their motivations for change.
    * Encourage them to identify their own goals and develop a plan to achieve them.

6. Boundaries & Limitations:
    * Clearly state that you are Mira, a chatbot created by Gentech, and not a therapist or a replacement for professional mental health care.
    * Encourage users to seek additional support if needed.
    * Maintain strict confidentiality, except in cases where there is a risk of harm to self or others.

Conversational Style:

* Warm, friendly, and approachable.
* Use simple and clear language that is easy to understand.
* Avoid jargon or technical terms that may be confusing.
* Maintain a calm and reassuring tone, even when discussing difficult topics.

Example Interactions:

* User: "I'm feeling really down today."
   * Mira: "I'm so sorry to hear that. It's okay to feel down sometimes. Would you like to talk about what's been going on?"
* User: "I'm thinking about ending my life."
   * Mira: "I'm deeply concerned about your safety. Please know that you're not alone and there's help available. Please reach out to a crisis helpline immediately. Here are some resources: AASRA: 9820466726, iCall: 9152987821. You can also call emergency services."
* User: "I'm interested in learning more about anxiety."
   * Mira: "Absolutely! Anxiety is a common experience. I can share some information about anxiety symptoms, causes, and coping strategies. Would you like that?"

Additional Considerations:

* Customization: Adapt the prompt further based on the specific target audience and goals of Mira.
* Training Data: Use high-quality, diverse training data that is culturally relevant to India to ensure Mira responds appropriately and avoids biases.
* Regular Updates:  Continuously evaluate and improve Mira's performance based on user feedback and evolving mental health needs.

Remember:

* The input prompt is a crucial foundation, but ongoing refinement and human oversight are essential for creating a safe and effective mental health support chatbot like Mira.
* Prioritize user safety and ethical considerations at all times.
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

  // Initialize the input prompt and response when the component mounts
  useEffect(() => {
    const fetchInitialResponse = async () => {
      try {
        const response = await run(inputPrompt);
        console.log("Initial response from Mira swarno:", response);
        setChatHistory([{ role: "Mira", content: response }]); // Start with Mira's initial greeting
      } catch (err) {
        console.error("Error fetching initial response:", err);
      }
    };
  
    fetchInitialResponse(); // Fetch the initial greeting when the component mounts
  }, []); // Run effect when inputPrompt changes
  

  // Handle submission of the user input
  // const onSent = async (prompt) => {
  //   setResultData("");
  //   setLoading(true);
  //   setShowResult(true);
  //   setError(null);

  //   let response;

  //   try {
  //     if (prompt !== undefined) {
  //       response = await run(prompt);
  //       setRecentPrompt(prompt);
  //     } else {
  //       // Update chat history with user input
  //       setChatHistory([...chatHistory, { role: "user", content: input }]);
  //       setRecentPrompt(input);

  //       // Include the initial prompt if it's the first message
  //       const fullPrompt =
  //         chatHistory.length === 0
  //           ? `${inputPrompt}\nUser: ${input}`
  //           : `${chatHistory
  //             .map((turn) => `${turn.role}: ${turn.content}`)
  //             .join("\n")}\nUser: ${input}`;
  //       response = await run(fullPrompt);

  //       // Update chat history with Mira's response
  //       setChatHistory([
  //         ...chatHistory,
  //         { role: "user", content: input },
  //         { role: "Mira", content: response },
  //       ]);

  //       // Update recent questions
  //       if (input.trim() !== "") {
  //         setRecentQuestions([input, ...recentQuestions.slice(0, 4)]);
  //       }
  //     }

  //     // Safety check for inappropriate content
  //     if (response.includes("harmful") || response.includes("inappropriate")) {
  //       throw new Error(
  //         "Potentially harmful or inappropriate content detected. Please try a different prompt."
  //       );
  //     }

  //     // Format the response text
  //     let responseArray = response.split("**");
  //     let newResponse = "";

  //     for (let i = 0; i < responseArray.length; i++) {
  //       if (i === 0 || i % 2 !== 1) {
  //         newResponse += responseArray[i];
  //       } else {
  //         newResponse += "<b>" + responseArray[i] + "</b>";
  //       }
  //     }

  //     let newResponse2 = newResponse.split("*").join("</br>");
  //     let newResponseArray = newResponse2.split(" ");

  //     for (let i = 0; i < newResponseArray.length; i++) {
  //       const nextWord = newResponseArray[i];
  //       delayPara(i, nextWord + " ");
  //     }

  //     return response;

  //   } catch (err) {
  //     setError(err.message);
  //     console.error("Error fetching response:", err);
  //     return null;  // Return null or an empty string in case of an error
  //   } finally {
  //     setLoading(false);
  //     setInput("");
  //   }
  // };

  //modified onSent

  // Handle submission of the user input
// Handle submission of the user input
const onSent = async (prompt) => {
  setResultData("");
  setLoading(true);
  setShowResult(true);
  setError(null);

  let response;

  try {
    // Include the persona prompt in each request
    let fullPrompt = "";
    if (prompt !== undefined) {
      // In case the prompt is explicitly provided
      fullPrompt = `${inputPrompt}\nUser: ${prompt}`;
      setRecentPrompt(prompt);
    } else {
      // Append user input to the persona and chat history
      setChatHistory([...chatHistory, { role: "user", content: input }]);
      setRecentPrompt(input);

      // Include the persona with each user input
      fullPrompt =
        chatHistory.length === 0
          ? `${inputPrompt}\nUser: ${input}` // First message includes persona prompt
          : `${inputPrompt}\n${chatHistory
              .map((turn) => `${turn.role}: ${turn.content}`)
              .join("\n")}\nUser: ${input}`; // Persona with chat history
    }

    response = await run(fullPrompt);

    // Update chat history with the response
    setChatHistory([
      ...chatHistory,
      { role: "user", content: input },
      { role: "Mira", content: response },
    ]);

    // Update recent questions
    if (input.trim() !== "") {
      setRecentQuestions([input, ...recentQuestions.slice(0, 4)]);
    }

    // Display response
    let responseArray = response.split("**");
    let newResponse = "";

    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
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

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
