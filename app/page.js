"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const page = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/questions/getQuestions`
        ); // Replace with your API endpoint
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.log("Error fetching questions:", error);
      }
    }

    fetchQuestions();
  }, []);

  return (
    <div className="p-5 m-5">
      <h1 className="text-xl font-semibold">Questions</h1>
      {questions.map((question, index) => (
        <div key={question._id} className="mt-5 flex gap-2 border border-solid">
          <p className="font-bold">{index})</p>
          <Link href={`/question/${question._id}`}>
            <h2 className="font-bold">{question.title}</h2>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default page;
