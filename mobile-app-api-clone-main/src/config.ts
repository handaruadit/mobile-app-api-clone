export interface IConfig {
  express: {
    port: number;
    bodyLimit: string;
    corsHeaders: string[];
  };
  app: {
    queryLimit: number;
  };
}

const config: IConfig = {
  express: {
    port: 8080,
    bodyLimit: '100kb',
    corsHeaders: ['Link']
  },
  app: {
    queryLimit: process.env.QUERY_LIMIT ? parseInt(process.env.QUERY_LIMIT, 10) : 100
  }
};

export default config;
