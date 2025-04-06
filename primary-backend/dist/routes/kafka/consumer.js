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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenOrderUpdateStatus = exports.consumer = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const kafkajs_1 = require("kafkajs");
const redis = new ioredis_1.default();
const kafka = new kafkajs_1.Kafka({
    clientId: '',
    brokers: ['localhost:9092']
});
exports.consumer = kafka.consumer({
    groupId: 'order-group',
});
const listenOrderUpdateStatus = (io) => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.consumer.connect();
    yield exports.consumer.subscribe({ topic: 'order-status-update', fromBeginning: false });
    exports.consumer.run({
        eachMessage: (_a) => __awaiter(void 0, [_a], void 0, function* ({ message }) {
            const data = JSON.parse(message.value.toString());
            redis.set(`order:${data.orderId}`, data.status);
            io.to(data.orderId).emit('order-status-update', data);
        })
    });
});
exports.listenOrderUpdateStatus = listenOrderUpdateStatus;
