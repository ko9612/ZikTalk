import {
  loginUser,
  registerUser,
  generateVerificationCode,
  sendVerificationEmail,
  generateTokens,
} from "../services/authService.js";
import jwt from "jsonwebtoken";

const NODE_ENV = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_COOKIE_EXPIRE_MS =
  Number(process.env.JWT_REFRESH_COOKIE_EXPIRE_MS) || 7 * 24 * 60 * 60 * 1000;

export const signin = async (req, res) => {
  try {
    const user = await loginUser(req.body);

    const { userName } = user;
    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV,
      sameSite: "Lax",
      maxAge: JWT_REFRESH_COOKIE_EXPIRE_MS,
    });

    res.status(200).json({ message: "로그인 성공", userName, accessToken });
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

export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "토큰 없음" });

  try {
    // refreshToken 검증
    const payload = jwt.verify(token, JWT_REFRESH_SECRET);

    // accessToken 재발급
    const accessToken = jwt.sign({ id: payload.id }, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    });

    res.status(200).json({ message: "accessToken 재발급 성공", accessToken });
  } catch (e) {
    console.error("토큰 오류:", e);
    return res.status(401).json({ message: "토큰 오류" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: NODE_ENV,
      sameSite: "Lax",
    });

    return res.status(200).json({ message: "로그아웃 완료" });
  } catch (e) {
    console.error("로그아웃 오류:", e);
    res.status(500).json({ message: "서버 오류" });
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
