import { testApi } from "@/api/testApi";
import React, { useEffect, useState } from "react";

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
      <div>api test:{testData}</div>
    </div>
  );
};

export default Test;
