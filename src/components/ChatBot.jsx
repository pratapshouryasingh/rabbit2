import { useState, useRef, useEffect } from "react";
import "../App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import systemPrompt from "../prompt";
import rehypeRaw from "rehype-raw";

function ChatBot() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [step, setStep] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [showShopLink, setShowShopLink] = useState(false);
  const chatContainerRef = useRef(null);

  const maxQuestions = 6;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer, showShopLink]);

  async function getNextQuestion(userResponses, step) {
    try {
      const response = await axios({
        method: "post",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
        }`,
        data: {
          contents: [
            systemPrompt,
            {
              role: "user",
              parts: [
                {
                  text: `You are acting as an Ayurvedic herbal doctor. 
So far, the patient has answered these:\n${userResponses
                    .map((r, i) => `Q${i + 1}: ${r.q}\nA${i + 1}: ${r.a}`)
                    .join("\n")}

Now generate the next diagnostic question number ${step + 1}. 
Keep it short, simple and conversational.`
                }
              ]
            }
          ]
        }
      });

      return (
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Can you share more about your health?"
      );
    } catch (err) {
      console.error("Question Generation Error:", err);
      return "Can you share more details about your health?";
    }
  }

  async function getFinalAdvice(userResponses) {
    try {
      const response = await axios({
        method: "post",
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
        }`,
        data: {
          contents: [
            systemPrompt,
            {
              role: "user",
              parts: [
                {
                  text: `You are an Ayurvedic herbal doctor. 
The patient answered these diagnostic questions:\n${userResponses
                    .map((r, i) => `Q${i + 1}: ${r.q}\nA${i + 1}: ${r.a}`)
                    .join("\n")}

Based on Ayurveda, identify their likely dosha imbalance if possible, 
and recommend 10 practical Ayurvedic solutions, including herbs, lifestyle changes, and dietary advice. 
Keep the tone friendly and easy to follow.`
                }
              ]
            }
          ]
        }
      });

      return (
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate advice this time."
      );
    } catch (err) {
      console.error("Advice Error:", err);
      return "Something went wrong while generating advice.";
    }
  }

  async function generateAnswer(e) {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    const currentAnswer = question;
    setQuestion("");

    setChatHistory((prev) => [
      ...prev,
      { type: "question", content: currentAnswer }
    ]);

    setGeneratingAnswer(true);

    const userResponses = [];
    let lastQ = "";
    chatHistory.forEach((msg) => {
      if (msg.type === "answer") {
        lastQ = msg.content;
      } else if (msg.type === "question" && lastQ) {
        userResponses.push({ q: lastQ, a: msg.content });
        lastQ = "";
      }
    });
    
    if (chatHistory.length > 0) {
      const lastBotQ = chatHistory
        .slice()
        .reverse()
        .find((m) => m.type === "answer");
      if (lastBotQ) {
        userResponses.push({ q: lastBotQ.content, a: currentAnswer });
      }
    }

    if (step < maxQuestions - 1) {
      const nextQ = await getNextQuestion(userResponses, step);
      setStep(step + 1);
      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: nextQ }
      ]);
      setGeneratingAnswer(false);
    } else {
      const advice = await getFinalAdvice(userResponses);
      
      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: advice }
      ]);
      setShowShopLink(true);
      setSessionDone(true);
      setGeneratingAnswer(false);
    }
  }

  function restartChat() {
    setChatHistory([
      {
        type: "answer",
        content:
          "🌿 Namaste 🙏 I am your Ayurvedic Herbal Doctor. I will ask you 5–6 questions to understand your health, and then I'll recommend remedies. Let's begin! What is your main health issue or symptom?"
      }
    ]);
    setStep(0);
    setQuestion("");
    setSessionDone(false);
    setShowShopLink(false);
  }

  useEffect(() => {
    if (chatHistory.length === 0) {
      restartChat();
    }
  }, []);

  return (
    <div 
      className="flex flex-col h-full bg-white rounded-md shadow-md p-4"
      style={{
        backgroundImage: "url('/background-image.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Restart Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={restartChat}
          className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200"
        >
          🔄 Restart
        </button>
      </div>

      {/* Chat History */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 rounded-lg bg-gray-50 bg-opacity-90 shadow-inner p-3 hide-scrollbar"
      >
        {chatHistory.map((chat, idx) => (
          <div
            key={idx}
            className={`mb-3 ${
              chat.type === "question" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${
                chat.type === "question"
                  ? "bg-green-500 text-white rounded-br-none"
                  : "bg-yellow-100 text-gray-900 rounded-bl-none"
              }`}
            >
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
              >
                {chat.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {generatingAnswer && (
          <div className="text-left">
            <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Shop Now Link (outside chat bubbles) */}
      {showShopLink && (
        <div className="flex justify-center mb-4">
          <a
            href="https://herbokat.in/products"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold text-center"
          >
            🛒 Shop Products at Herbokat
          </a>
        </div>
      )}

      {/* Input Box */}
      {!sessionDone && (
        <form
          onSubmit={generateAnswer}
          className="bg-white bg-opacity-90 rounded-lg p-2 border flex gap-2"
        >
          <textarea
            required
            className="flex-1 border border-gray-300 rounded p-2 focus:border-green-400 focus:ring-1 focus:ring-green-400 resize-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Answer the doctor's question here..."
            rows="2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                generateAnswer(e);
              }
            }}
          ></textarea>
          <button
            type="submit"
            disabled={generatingAnswer}
            className={`px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition ${
              generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

export default ChatBot;
