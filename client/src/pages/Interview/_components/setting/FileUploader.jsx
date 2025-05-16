import React, { useState } from "react";
import axios from "axios";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("⚠️ 파일을 선택하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/supa/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setStatus(`✅ 업로드 성공: ${res.data.path}`);
    } catch (err) {
      setStatus(`❌ 업로드 실패: ${err.message}`);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>업로드</button>
      <p>{status}</p>
    </div>
  );
};

export default FileUploader;
