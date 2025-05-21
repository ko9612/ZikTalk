import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

const VideoPlayer1 = () => {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const fetchVideoUrl = async () => {
      const { data, error } = supabase.storage
        .from("ziktalk")
        .getPublicUrl("cmauzs94900003b6mebh15cbq_1.webm"); // 경로 및 파일명

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
        <video controls className="rounded-xl shadow-lg">
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
        </video>
      ) : (
        <p>영상을 불러오는 중입니다...</p>
      )}
    </div>
  );
};

export default VideoPlayer1;
