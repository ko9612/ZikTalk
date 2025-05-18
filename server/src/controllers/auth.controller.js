import {
  loginUser,
  registerUser,
  generateVerificationCode,
  sendVerificationEmail,
  generateTokens,
} from "../services/authService.js";

const isProduction = process.env.NODE_ENV === "production";

export const signin = async (req, res) => {
  try {
    const user = await loginUser(req.body);

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    res.status(200).json({ message: "로그인 성공", user, accessToken });
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
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken: newAccessToken });
  } catch (e) {
    console.error("토큰 오류:", e);
    return res.status(401).json({ message: "토큰 오류" });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
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
