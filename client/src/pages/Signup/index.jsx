import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginInfo } from "@/store/loginStore";
import SignupForm from "./_components/SignupForm";

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
      <SignupForm />
    </>
  );
};

export default Index;
