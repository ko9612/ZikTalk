import {
  loginUser,
  registerUser,
  generateVerificationCode,
  sendVerificationEmail,
} from "../services/authService.js";

export const signin = async (req, res) => {
  try {
    const user = await loginUser(req.body);
    res.status(201).json({ message: "로그인 성공", user });
  } catch (error) {
    if (error.status === 401) {
      res.status(401).json({ message: error.message });
    } else if (error.status === 404) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "로그인 실패", error: error.message });
    }
  }
};

export const signup = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: "회원가입 성공", user });
  } catch (error) {
    if (error.status === 409) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: "회원가입 실패", error: error.message });
    }
  }
};

export const verification = async (req, res) => {
  const { email } = req.body;
  const verificationCode = generateVerificationCode();
  try {
    await sendVerificationEmail(email, verificationCode);
    return res.status(200).json({
      message: "인증번호가 발송되었습니다.",
      verificationCode,
    });
  } catch (e) {
    res.status(500).json({ message: "인증번호 발송에 실패했습니다." });
  }
};
