import { PrismaClient } from "@prisma/client";

let prisma;

if (!globalThis.prisma) {
  globalThis.prisma = new PrismaClient();
}
prisma = globalThis.prisma;

export default prisma;

/*
// ESM 방식 (예: ESM 지원 프로젝트, "type": "module" 설정된 경우)
import prisma from "../utils/prisma.js"; // 확장자 .js 명시해야 안전함

// 사용 예시
const users = await prisma.user.findMany();
*/
