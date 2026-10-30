import dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  apiPrefix: string;
}

export const config: EnvironmentConfig = {
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  apiPrefix: process.env.API_PREFIX || '/api',
};

