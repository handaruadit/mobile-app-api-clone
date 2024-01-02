import { createClient, RedisClientType } from 'redis';

export default class RedisCache {
  client: RedisClientType;
  expirationTime: number;
  connected = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL
    });

    this.client
      .connect()
      .then(() => {
        //
      })
      .catch(console.error);

    this.client.on('error', (err) => {
      this.connected = false;
      console.warn(`[Redis] ${err}`);
    });

    this.client.on('connect', () => {
      this.connected = true;
      console.warn('[Redis] Connected ', process.env.REDIS_URL);
    });

    this.client.on('ready', () => {
      this.connected = true;
      console.warn('[Redis] Ready ', process.env.REDIS_URL);
    });

    this.client.on('end', () => {
      this.connected = false;
      console.warn('[Redis] Ended ', process.env.REDIS_URL);
    });

    this.expirationTime = parseInt(process.env.REDIS_CACHE_TTL || '1200', 10);
  }

  formatKey = (id: string, query: Record<string, string>) => {
    const options = { ...query };

    const objAsString = Object.keys(options).reduce((acc, key) => {
      if (options[key]) {
        acc = `${acc}-${key}-${options[key]}`;
      }
      return acc;
    }, '');

    return `${id}-${objAsString}`;
  };

  set = async (key: string, data: string) => {
    if (this.connected) {
      await this.client.set(key, data);
      await this.client.expire(key, this.expirationTime);
    }
  };

  setCache = async (
    id: string,
    query: Record<string, string>,
    data: Record<string, any>
  ) => {
    const key = this.formatKey(id, query);
    await this.set(key, JSON.stringify(data));
  };

  getCache = async (id: string, query: Record<string, string>) => {
    if (!this.connected) {
      return null;
    }

    const key = this.formatKey(id, query);
    const data = (await this.client.get(key)) ?? '';

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  };

  clearCache = async (id: string) => {
    if (this.connected) {
      if (process.env.LOGS) {
        console.log('CLEAR CACHE -- ', id);
      }

      const pattern = `${id}*`;
      const promises = [];
      let cursor = 0;
      do {
        const reply = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 1000
        });

        cursor = reply.cursor;

        if (reply.keys.length > 0) {
          promises.push(this.client.del(reply.keys));
        }
      } while (cursor !== 0);

      try {
        await Promise.all(promises);
      } catch (error) {
        //
      }
    }
  };

  flush = async () => {
    if (this.connected) {
      await this.client.flushAll();
    }
  };
}
