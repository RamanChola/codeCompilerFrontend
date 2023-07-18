"use client";
import React, { useState, useEffect } from "react";
import LeftPanel from "./LeftPanel";
import Editor from "./Editor";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const page = ({ params }) => {
  const [open, setOpen] = React.useState(false);
  const [activePageTab, setActivePageTab] = useState("Description");
  const [question, setQuestion] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [jobSubmissionId, setJobSubmissionId] = useState(null);

  const handleClose = () => {
    setOpen(false);
  };
  const handleClickOpen = (submission) => {
    setOpen(true);
    setSubmissionDetails(submission);
  };
  useEffect(() => {
    async function fetchQuestion() {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/questions/getQuestionById?question_id=${params.question_id}`
        );
        console.log(response);
        const data = await response.json();
        setQuestion(data);
      } catch (error) {
        console.log("Error fetching question:", error);
      }
    }

    fetchQuestion();
  }, [params.question_id]);

  if (!question) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="w-full"
      >
        <DialogTitle id="alert-dialog-title" className="flex justify-between">
          {submissionDetails != null &&
            (submissionDetails.test_cases.length == 0 ? (
              <p className="text-red-500">Error</p>
            ) : submissionDetails.score ==
              submissionDetails.test_cases.length ? (
              <p className="text-green-500">All Test Cases Passed</p>
            ) : (
              <p className="text-red-500">
                {submissionDetails.score} /{" "}
                {submissionDetails.test_cases.length} Test Cases Passed
              </p>
            ))}
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <table className="w-full border-collapse border bg-gray-300 border-slate-500">
              <th className="border border-slate-700 p-2">Test Case Id</th>
              <th className="border border-slate-700 p-2">Input</th>
              <th className="border border-slate-700 p-2">Output</th>
              <th className="border border-slate-700 p-2">Required Output</th>
              <th className="border border-slate-700 p-2">Status</th>
              {submissionDetails &&
                submissionDetails.test_cases.map((test_case) => {
                  console.log(test_case.is_correct);
                  return (
                    <tr class="bg-white even:bg-gray-100 ">
                      <td className="border border-slate-700 p-2 text-center">
                        {test_case.case_id}
                      </td>
                      <td className="border border-slate-700 p-2 text-center w-full">
                        <pre className="whitespace-pre-wrap">
                          {test_case.input}
                        </pre>
                      </td>
                      <td className="border border-slate-700 p-2 text-center w-full">
                        <pre className="whitespace-pre-wrap">
                          {test_case.output}
                        </pre>
                      </td>
                      <td className="border border-slate-700 p-2 text-center w-full">
                        <pre className="whitespace-pre-wrap">
                          {test_case.required_output}
                        </pre>
                      </td>
                      <td className="border border-slate-700 p-2 text-center">
                        {test_case.is_correct ? (
                          <p className="text-green-500">correct</p>
                        ) : (
                          <p className="text-red-500">wrong</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </table>
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <div className="flex">
        <div className="flex-[2]">
          <LeftPanel
            question={question}
            handleClickOpen={handleClickOpen}
            handleClose={handleClose}
            activePageTab={activePageTab}
            setActivePageTab={setActivePageTab}
            isSubmittingCode={isSubmittingCode}
            setIsSubmittingCode={setIsSubmittingCode}
            jobSubmissionId={jobSubmissionId}
            setJobSubmissionId={setJobSubmissionId}
          />
        </div>
        <div className="flex-[3]">
          <Editor
            question={question}
            activePageTab={activePageTab}
            setActivePageTab={setActivePageTab}
            setIsSubmittingCode={setIsSubmittingCode}
            setJobSubmissionId={setJobSubmissionId}
          />
        </div>
      </div>
    </>
  );
};

export default page;
