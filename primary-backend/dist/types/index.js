"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.statusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.OrderStatus),
});
