import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1', // IP หรือ host ของ Redis Server
    port: parseInt(process.env.REDIS_PORT || '6379', 10), // พอร์ตที่ Redis ใช้
    password: process.env.REDIS_PASSWORD || '', // รหัสผ่าน (ถ้ามี)
    db: parseInt(process.env.REDIS_DB || '0', 10), // เลือก database (0 เป็นค่า default)
});

export default redis;