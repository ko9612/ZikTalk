import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

function TextReader() {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchText = async () => {
      // 1. 텍스트 파일의 Public URL 가져오기
      const { data } = supabase.storage
        .from("ziktalk")
        .getPublicUrl("test.txt"); // 경로 및 파일명

      if (!data?.publicUrl) return;

      try {
        // 2. Public URL에서 fetch로 내용 읽기
        const response = await fetch(data.publicUrl);
        const content = await response.text();
        setText(content);
      } catch (error) {
        console.error("❌ 텍스트 파일 로드 실패:", error);
      }
    };

    fetchText();
  }, []);

  return (
    <div>
      <h2>📄 텍스트 내용:</h2>
      <pre>{text}</pre>
    </div>
  );
}

export default TextReader;
