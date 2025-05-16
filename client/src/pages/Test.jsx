import { testApi } from "@/api/testApi";
import React, { useEffect, useState } from "react";
import RecordSection from "@/pages/Interview/_components/interview/RecordSection";
import InterviewList from "@/pages/Interview/_components/interview/InterviewList";
import FileUploader from "@/pages/Interview/_components/setting/FileUploader";
import TextReader from "@/pages/Interview/_components/setting/ReadFile";

const Test = () => {
  // api test
  const [testData, setTestData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const response = await testApi();
      if (response && response.data) setTestData(response.data.message);
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* <RecordSection />
      {<InterviewList />}
      <video
        src={`http://localhost:5001/api/uploads/interview.webm`}
        type="video/webm"
        controls
      />
      <InterviewList /> */}
      <FileUploader />
      {/* <TextReader /> */}
    </div>
  );
};

export default Test;
