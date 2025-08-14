import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
});

export const imageQueue = new Queue("analise-imagens", { connection });
export const redisConnection = connection;