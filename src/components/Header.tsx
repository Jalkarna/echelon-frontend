import React from "react";

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        AI Sign Language Translator
      </h1>
      <p className="text-xl text-gray-300">
        Bridging communication gaps with cutting-edge AI technology
      </p>
    </header>
  );
};

export default Header;
