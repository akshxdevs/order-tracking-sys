"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../routes/db/db");
function Main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.prismaClient.restaurent.create({ data: { resName: "Burger Heaven" } });
        yield db_1.prismaClient.user.create({ data: { name: "John", username: "john123", phoneNo: "1234567890" } });
        yield db_1.prismaClient.deliveryAgent.create({ data: { name: "Bob", phoneNo: "9876543210" } });
    });
}
Main();
