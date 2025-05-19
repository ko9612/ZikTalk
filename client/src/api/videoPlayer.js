// hooks/useSupabaseVideo.js
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

/**
 * Supabase 스토리지에서 Public URL을 가져오는 훅
 * @param {string} filePath - Supabase 스토리지 내 파일 경로 (예: "interview_1.webm")
 * @param {string} bucket - Supabase 스토리지 버킷 이름 (기본값: "ziktalk")
 * @returns {string} videoUrl - Supabase public URL
 */
const videoPlayer = (filePath, bucket = "ziktalk") => {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (!filePath) return;

    const fetchVideoUrl = async () => {
      const { data, error } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (error || !data?.publicUrl) {
        console.error("❌ Supabase URL 가져오기 실패:", error);
        return;
      }

      setVideoUrl(data.publicUrl);
    };

    fetchVideoUrl();
  }, [filePath, bucket]);

  return videoUrl;
};

export default videoPlayer;
