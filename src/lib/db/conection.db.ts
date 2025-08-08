import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prismaDB = new PrismaClient().$extends(withAccelerate());
