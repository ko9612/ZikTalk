import bcrypt, { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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

  // JWT 토큰 발급
  const token = jwt.sign(
    { 
      userId: user.id, 
      id: user.id,
      userName: user.name, 
      userEmail: user.email,
      role: user.role,
      career: user.career
    },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: "24h",
    }
  );

  return {
    message: "로그인 성공",
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      token: token,
    },
  };
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
