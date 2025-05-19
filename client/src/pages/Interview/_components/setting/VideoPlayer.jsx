import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const fetchVideoUrl = async () => {
      const { data, error } = supabase.storage
        .from("ziktalk")
        .getPublicUrl("interview_1.webm"); // 경로 및 파일명

      if (error || !data?.publicUrl) {
        console.error("❌ Supabase URL 가져오기 실패:", error);
        return;
      }

      setVideoUrl(data.publicUrl); // 바로 URL만 저장
    };

    fetchVideoUrl();
  }, []);

  return (
    <div>
      {videoUrl ? (
        <video
          src={videoUrl}
          type="video/webm"
          controls
          className="rounded-xl shadow-lg"
        />
      ) : (
        <p>영상을 불러오는 중입니다...</p>
      )}
    </div>
  );
};

export default VideoPlayer1;
