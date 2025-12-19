/**
 * LLM 配置模块
 * 从环境变量读取配置
 */

export type LLMProvider = 'deepseek';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseURL: string;
  model: string;
}

/**
 * 获取 LLM 配置
 */
export function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || 'deepseek') as LLMProvider;
  
  if (provider === 'deepseek') {
    return {
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-reasoner',
    };
  }

  // 默认 DeepSeek
  return {
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-reasoner',
  };
}

