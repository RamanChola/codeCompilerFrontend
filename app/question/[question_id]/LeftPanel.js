import React, { useState, useEffect } from "react";
import TabPanel from "./TabPanel";
import { useSession } from "next-auth/react";
import LinearProgress from "@mui/material/LinearProgress";
import moment from "moment";
import axios from "axios";

const LeftPanel = ({
  question,
  handleClickOpen,
  activePageTab,
  setActivePageTab,
  isSubmittingCode,
  setIsSubmittingCode,
  jobSubmissionId,
  setJobSubmissionId,
}) => {
  const { data: userObj, status } = useSession({required:true});

  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/result/getUserResult?uid=${userObj.user.userId}&qid=${question._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              token: `Bearer ${userObj.user.token}`,
            },
          }
        );
        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.log("Error fetching question:", error);
      }
    }
    if (userObj && userObj.user) {
      fetchQuestion();
    }
  }, [userObj, question, jobSubmissionId]);
  let pollInterval;
  useEffect(() => {
    async function getStatus() {
      pollInterval = setInterval(async () => {
        const { data: statusRes } = await axios.get(
          `${process.env.BACKEND_URL}/status`,
          {
            params: {
              id: jobSubmissionId,
            },
          }
        );
        const { success, job, error } = statusRes;
        console.log(statusRes);
        if (success) {
          const { status: jobStatus } = job;
          if (jobStatus === "pending") return;
          setIsSubmittingCode(false);
          setJobSubmissionId(null);
          clearInterval(pollInterval);
        } else {
          console.error(error);
          // setStatus("Bad request");
          setIsSubmittingCode(false);
          setJobSubmissionId(null);
          clearInterval(pollInterval);
        }
      }, 1000);
    }
    if (jobSubmissionId != null) {
      getStatus();
    }
  }, [jobSubmissionId]);
  let data = [
    {
      title: "Description",
      body: (
        <div className="p-5">
          <h1 className="font-bold text-xl">{question.title}</h1>
          <pre className="text-sm mt-5 whitespace-pre-wrap">
            {question.description}
          </pre>
          <p className="text-lg font-semibold mt-2">Input Type</p>
          <pre className="whitespace-pre-wrap text-sm mt-1">
            {question.input_type_description}
          </pre>
          {question.example_test_cases.map((test_case, index) => {
            return (
              <div>
                <p className="text-base font-semibold mt-2">
                  Example {index + 1}
                </p>
                <div className="bg-gray-100 p-4 text-sm">
                  <div className="flex gap-2">
                    <p className="font-semibold">Input : </p>
                    <pre className=" whitespace-pre-wrap">
                      {test_case.input}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <p className="font-semibold">Output : </p>
                    {test_case.output}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: "Solution",
      body: (
        <div className="p-5">
          <pre className="text-sm mt-5 whitespace-pre-wrap">
            {question.solution}
          </pre>
        </div>
      ),
    },
    {
      title: "Submissions",
      body: (
        <>
          {isSubmittingCode && jobSubmissionId && (
            <>
              <LinearProgress />
            </>
          )}
          <div className="p-5">
            {submissions.length == 0 ? (
              "No Submissions Found"
            ) : (
              <>
                <table className="w-full border-collapse border bg-gray-300 border-slate-500">
                  <th className="border border-slate-700 p-2">
                    Time Submitted
                  </th>
                  <th className="border border-slate-700 p-2">Status</th>
                  <th className="border border-slate-700 p-2">Runtime</th>
                  <th className="border border-slate-700 p-2">Language</th>
                  {/* <th className="border border-slate-700 p-2">More Info</th> */}
                  {submissions.map((submission, index) => {
                    const start = moment(submission.start_time);
                    const end = moment(submission.end_time);
                    const runtime = end.diff(start, "seconds", true) + "s";
                    return (
                      <>
                        <tr class="bg-white even:bg-gray-100 ">
                          <td
                            key={index}
                            className="border border-slate-700 p-2 text-center"
                          >
                            {start.format("MMMM Do YYYY, h:mm:ss a")}
                          </td>
                          <td className="border border-slate-700 p-2 text-center">
                            {submission.test_cases.length == 0 ? (
                              <p className="text-red-500">Error</p>
                            ) : submission.score ==
                              submission.test_cases.length ? (
                              <p className="text-green-500">Accepted</p>
                            ) : (
                              <p className="text-red-500">Wrong Answer</p>
                            )}
                          </td>
                          <td className="border border-slate-700 p-2 text-center">
                            {runtime}
                          </td>
                          <td className="border border-slate-700 p-2 text-center">
                            {submission.language}
                          </td>
                          <td className="border border-slate-700 p-2 text-center">
                            <button
                              onClick={() =>
                                handleClickOpen({
                                  runtime,
                                  start_time: start.format(
                                    "MMMM Do YYYY, h:mm:ss a"
                                  ),
                                  ...submission,
                                })
                              }
                            >
                              More Info
                            </button>
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </table>
              </>
            )}
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="p-5">
      <TabPanel
        tabs={data}
        activeTab={activePageTab}
        setActiveTab={setActivePageTab}
      />
    </div>
  );
};

export default LeftPanel;
