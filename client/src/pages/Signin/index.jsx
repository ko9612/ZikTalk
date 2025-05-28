import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginInfo } from "@/store/loginStore";
import SigninSection from "./_components/SigninForm";

const Index = () => {
  const { loginState } = loginInfo();
  const navigate = useNavigate();

  useEffect(() => {
    if (loginState) {
      navigate("/", { replace: true });
    }
  }, [loginState, navigate]);

  return (
    <>
      <SigninSection />
    </>
  );
};

export default Index;
