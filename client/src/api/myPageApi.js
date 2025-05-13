// 마이페이지 관련 api
import axios from "axios";

export const myPageApi = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/mypage/bookmarks",
    );
    return response;
  } catch (err) {
    return err.response;
  }
};
