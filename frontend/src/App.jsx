import { useEffect, useState } from "react";
import HelloWorld from "./Hello";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8000/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">Frontend React</h1>
        <p className="text-lg mb-8">
          Backend says:{" "}
          <span className="font-semibold text-blue-500">{message}</span>
        </p>

        <hr className="my-8" />

        <div className="text-lg">
          <HelloWorld />
        </div>
      </div>
    </div>
  );
}

export default App;

