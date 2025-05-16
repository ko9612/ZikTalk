import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();
  const [, , removeCookie] = useCookies(["token"]);

  const logout = () => {
    removeCookie("token", { path: "/" });
    navigate("/");
  };

  return logout;
};
