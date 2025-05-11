// prisma 클라이언트 초기화
// 데이터베이스와의 연결 유지, 전역에서 클라이언트 재사용하기 위함

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;
