import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async addToList(key: string, value: string, ttl?: number) {
    await this.redis.lpush(key, value);
    if (ttl) this.redis.expire(key, ttl);
  }

  removeFromList(key: string, value: string, count = 0) {
    return this.redis.lrem(key, count, value);
  }

  getFirstFromList(key: string) {
    return this.redis.lindex(key, 0);
  }

  getLastFromList(key: string) {
    return this.redis.lindex(key, -1);
  }

  removeFirstFromList(key: string) {
    return this.redis.lpop(key);
  }

  removeLastFromList(key: string) {
    return this.redis.rpop(key);
  }

  getData(key: string) {
    return this.redis.get(key);
  }

  async setData(key: string, value: string, ttl?: number) {
    await this.redis.set(key, value);
    if (ttl) this.redis.expire(key, ttl);
  }

  deleteData(key: string) {
    return this.redis.del(key);
  }

  getExpireTime(key: string) {
    return this.redis.ttl(key);
  }
}
