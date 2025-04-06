import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const statusSchema = z.object({
    status: z.nativeEnum(OrderStatus),
  });