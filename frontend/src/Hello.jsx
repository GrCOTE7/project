import React, { useState } from "react";
import { useServerReload } from "./hooks/useServerReload";

const HelloWorld = () => {
  const [message, setMessage] = useState("");

  const fetchMessage = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/hello");
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Erreur fetch message:", error);
    }
  };

  const isConnected = useServerReload(fetchMessage);

  return (
    <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white">
      <p className="text-md">
        <span className="font-bold">From "Hello.jsx"</span>: {message}
        <span className="ml-3 text-2xl">{isConnected ? " ✅" : " ❌"}</span>
      </p>
    </div>
  );
};

export default HelloWorld;
