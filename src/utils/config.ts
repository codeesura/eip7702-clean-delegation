import type { DelegationConfig } from '../types/index.js';
import { ConfigurationError } from './errors.js';
import { isValidPrivateKey } from './helpers.js';

export class ConfigManager {
  private config: DelegationConfig;

  constructor(config: DelegationConfig) {
    this.config = this.validateConfig(config);
  }

  private validateConfig(config: DelegationConfig): DelegationConfig {
    const errors: string[] = [];

    if (!config.providerUrl) {
      errors.push('Provider URL is required');
    }

    if (!config.delegatorPrivateKey) {
      errors.push('Delegator private key is required');
    } else if (!isValidPrivateKey(config.delegatorPrivateKey)) {
      errors.push('Invalid delegator private key format');
    }

    if (config.sponsorPrivateKey && !isValidPrivateKey(config.sponsorPrivateKey)) {
      errors.push('Invalid sponsor private key format');
    }

    if (config.chainId && config.chainId <= 0) {
      errors.push('Chain ID must be a positive number');
    }


    if (errors.length > 0) {
      throw new ConfigurationError(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return {
      chainId: 1,
      gasLimit: 50_000,
      ...config,
    };
  }

  public getConfig(): DelegationConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<DelegationConfig>): void {
    this.config = this.validateConfig({ ...this.config, ...updates });
  }

  public static fromEnv(): ConfigManager {
    const config: DelegationConfig = {
      providerUrl: process.env.PROVIDER_URL || '',
      delegatorPrivateKey: process.env.DELEGATOR_PRIVATE_KEY || '',
      sponsorPrivateKey: process.env.SPONSOR_PRIVATE_KEY,
      chainId: process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : 1,
    };

    return new ConfigManager(config);
  }
}