import React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function ReviewDocument() {
  const { id } = useParams();

  return (
    <div className="flex bg-bgdark min-h-screen text-white">
      <Sidebar role="reviewer" />
      <div className="flex-1">
        <Navbar role="Reviewer" />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6 text-primary">Review Document #{id}</h1>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <p>Document content preview and AI extraction fields here...</p>
            <button className="mt-4 px-6 py-2 bg-primary text-black rounded hover:bg-blue-500 transition">
              Approve
            </button>
            <button className="mt-4 ml-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
