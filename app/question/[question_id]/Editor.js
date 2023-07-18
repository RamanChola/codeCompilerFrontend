"use client";
import axios from "axios";
import stubs from "../../stubs";
import React, { useState, useEffect } from "react";
import moment from "moment";
import TabPanel from "./TabPanel";
import { CircularProgress, LinearProgress } from "@mui/material";
import { useSession } from "next-auth/react";

function Editor({
  question,
  setActivePageTab,
  setJobSubmissionId,
  setIsSubmittingCode,
}) {
  const { data: userObj } = useSession({ required: true });
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [language, setLanguage] = useState("cpp");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [input, setInput] = useState("Enter example input to run");
  const [activeTab, setActiveTab] = useState("Testcase");

  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  let pollInterval;
  let question_id = question._id;
  const handleSubmit = async () => {
    const payload = {
      language,
      code,
      question_id,
    };
    try {
      setActivePageTab("Submissions");
      window.scrollTo(0, 0);
      setIsSubmittingCode(true);
      const { data } = await axios.post(
        `${process.env.BACKEND_URL}/submit?uid=${userObj.user.userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            token: `Bearer ${userObj.user.token}`,
          },
        }
      );
      if (data.jobId) {
        setJobSubmissionId(data.jobId);
      }
    } catch (error) {
      alert(error);
    }
  };
  const handleRun = async () => {
    const payload = {
      language,
      input,
      code,
    };
    try {
      setOutput("");
      setStatus("sending");
      setJobId(null);
      setJobDetails(null);
      setActiveTab("Output");
      const { data } = await axios.post(
        `${process.env.BACKEND_URL}/run`,
        payload
      );
      if (data.jobId) {
        setJobId(data.jobId);

        // poll here
        pollInterval = setInterval(async () => {
          const { data: statusRes } = await axios.get(
            `${process.env.BACKEND_URL}/status`,
            {
              params: {
                id: data.jobId,
              },
            }
          );
          const { success, job, error } = statusRes;
          console.log(statusRes);
          if (success) {
            const { status: jobStatus, output: jobOutput } = job;
            setStatus(jobStatus);
            setJobDetails(job);
            if (jobStatus === "pending") return;
            setOutput(jobOutput);
            clearInterval(pollInterval);
          } else {
            console.error(error);
            setOutput(error);
            setStatus("Bad request");
            clearInterval(pollInterval);
          }
        }, 1000);
      } else {
        setOutput("Retry again.");
      }
    } catch ({ response }) {
      if (response) {
        const errMsg = response.data.err.stderr;
        setOutput(errMsg);
        setStatus("Bad request");
      } else {
        setOutput("Please retry submitting.");
      }
    }
  };

  const setDefaultLanguage = () => {
    localStorage.setItem("default-language", language);
    console.log(`${language} set as default!`);
  };

  const renderTimeDetails = () => {
    if (!jobDetails) {
      return "";
    }
    let { startedAt, completedAt } = jobDetails;
    let result = "";
    if (!startedAt || !completedAt) return result;
    const start = moment(startedAt);
    const end = moment(completedAt);
    let diff = end.diff(start, "seconds", true);
    result += `Execution Time: ${diff}s`;
    return result;
  };
  let data = [
    {
      title: "Testcase",
      body: (
        <textarea
          rows="3"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          className="w-full border border-gray-300 rounded p-2 pl-4 focus:border-gray-500 focus:outline-none resize-none"
        ></textarea>
      ),
    },
    {
      title: "Output",
      body: (
        <div className="h-[89.5px] w-full border rounded border-gray-300 p-2 pl-4 mb-[6px] overflow-auto">
          {output != null ? (
            <>
              {status === "sending" ? (
                <>
                  <LinearProgress />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-base capitalize ${
                        status === "success" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {status}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {renderTimeDetails()}
                    </p>
                  </div>
                  <p>{output}</p>
                </>
              )}
            </>
          ) : (
            "You must run your code first."
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-5 w-full">
      <div className="flex">
        <h1 className="text-xl font-bold mb-4">Code Compiler</h1>
        <div className="mb-4 ml-auto mr-4">
          <label className="mr-2">Language:</label>
          <select
            value={language}
            onChange={(e) => {
              const shouldSwitch = window.confirm(
                "Are you sure you want to change language? WARNING: Your current code will be lost."
              );
              if (shouldSwitch) {
                setLanguage(e.target.value);
              }
            }}
            className="border border-gray-300 rounded p-2"
          >
            <option value="cpp">C++</option>
            <option value="py">Python</option>
          </select>
        </div>
        <br />
        <div className="mb-4">
          <button
            onClick={setDefaultLanguage}
            className="bg-blue-500 text-white rounded py-2 px-4"
          >
            Set Default
          </button>
        </div>
      </div>
      <div className="relative overflow-hidden border border-gray-300 rounded p-2  focus:border-gray-500 focus:outline-none">
        <div className="textarea-container overflow-auto">
          <div className="line-numbers absolute left-0 top-0 h-full bg-gray-200 text-gray-600 px-2 py-4">
            {Array.from({ length: code.split("\n").length }, (_, index) => (
              <div key={index} className="line-number">
                {index + 1}
              </div>
            ))}
          </div>
          <textarea
            rows="20"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
            className="w-full border-none border-gray-300 rounded p-2 pl-12 focus:border-gray-500 focus:outline-none"
          ></textarea>
        </div>
      </div>
      <br />
      <TabPanel tabs={data} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex mt-5">
        <button
          onClick={handleRun}
          className="bg-blue-500 text-white rounded py-2 px-4"
        >
          Run
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white rounded py-2 px-4 ml-[auto]"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default Editor;
