import React from "react";

export default function Card({ title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-lg shadow-lg hover:scale-105 transition cursor-pointer"
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}
