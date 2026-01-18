import React, { useEffect, useState } from "react";

const HelloWorld = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white">
      <p className="text-md">
        <span className="font-bold">From "Hello.jsx"</span>: {message}
      </p>
      <p className="text-md">
        <span className="font-bold">From "Hello.jsx"</span>: {message}
      </p>
    </div>
  );
};

export default HelloWorld;
