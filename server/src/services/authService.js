import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcrypt";
import prisma from "../utils/prisma.js";
import { sendEmail } from "./emailService.js";

const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

// 로그인
export const loginUser = async (data) => {
  const { email, password } = data;

  // 이메일 확인
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("존재하지 않는 이메일입니다.");
    error.status = 404;
    throw error;
  }

  // 비밀번호 확인
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("비밀번호가 일치하지 않습니다.");
    error.status = 401;
    throw error;
  }

  return {
    userId: user.id,
    userName: user.name,
  };
};

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.userId, userName: user.userName },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    }
  );
  const refreshToken = jwt.sign(
    { userId: user.userId, userName: user.userName },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    }
  );

  return { accessToken, refreshToken };
};

// 회원 가입 유저 등록
export const registerUser = async (data) => {
  const { name, email, password, role, career } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    const error = new Error("사용 중인 이메일입니다.");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await hash(password, 10);

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      career: Number(career),
    },
  });
};

// 이메일 인증

// 인증 번호 생성 (6자리 숫자)
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 이메일 인증 번호 발송
export const sendVerificationEmail = async (email, verificationCode) => {
  await sendEmail(email, {
    subject: "[ZikTalk] 직톡 회원가입 이메일 인증 메일입니다.",
    html: `
        <div style="text-align: center; font-family: Arial, sans-serif;">
        <img src="cid:logo" alt="ZikTalk 로고" style="width:120px;" />
          <h2>ZikTalk 회원가입 인증번호</h2>
          <p>아래 인증번호를 <strong>3분 내에</strong> 입력해주세요.</p>
          <div style="color: #1a73e8;">회원가입 인증번호는 <strong style="font-size: 20px; font-weight: bold;">${verificationCode}</strong> 입니다.</div>
          <br />
          <p>감사합니다.<br/>ZikTalk 팀 드림</p>
        </div>
      `,
    attachments: [
      {
        filename: "logo.png",
        path: "./src/assets/images/logo.webp",
        cid: "logo",
      },
    ],
  });
};
