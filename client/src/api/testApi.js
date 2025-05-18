// backend 연동 test
import axios from "axios";
const serverUrl = import.meta.env.VITE_SERVER_URL;
export const testApi = async () => {
  try {
    const response = await axios.get(serverUrl);
    return response;
  } catch (err) {
    return err.response;
  }
};
