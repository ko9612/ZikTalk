// backend 연동 test
import axios from "axios";

export const testApi = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api");
    return response;
  } catch (err) {
    return err.response;
  }
};
