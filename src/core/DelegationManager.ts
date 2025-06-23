import { ethers } from 'ethers';
import type {
  DelegationConfig,
  Provider,
  Signer,
  Authorization,
  SignerInfo,
  DelegationResult,
  AuthorizationParams,
  RevocationOptions,
} from '../types/index.js';
import { ConfigManager } from '../utils/config.js';
import {
  TransactionError,
  AuthorizationError,
  DelegationError,
} from '../utils/errors.js';
import {
  validateBalance,
  formatBalance,
  waitWithTimeout,
} from '../utils/helpers.js';

export class DelegationManager {
  private provider!: Provider;
  private delegatorSigner!: Signer;
  private sponsorSigner?: Signer;
  private config: DelegationConfig;

  constructor(config: DelegationConfig | ConfigManager) {
    if (config instanceof ConfigManager) {
      this.config = config.getConfig();
    } else {
      this.config = new ConfigManager(config).getConfig();
    }

    this.initializeSigners();
  }

  private initializeSigners(): void {
    this.provider = new ethers.JsonRpcProvider(this.config.providerUrl);
    this.delegatorSigner = new ethers.Wallet(this.config.delegatorPrivateKey, this.provider);

    if (this.config.sponsorPrivateKey) {
      this.sponsorSigner = new ethers.Wallet(this.config.sponsorPrivateKey, this.provider);
    }
  }

  public static fromEnv(): DelegationManager {
    return new DelegationManager(ConfigManager.fromEnv());
  }

  public async getDelegatorInfo(): Promise<SignerInfo> {
    const balance = await this.provider.getBalance(this.delegatorSigner.address);
    const nonce = await this.delegatorSigner.getNonce();

    return {
      address: this.delegatorSigner.address,
      balance: formatBalance(balance),
      nonce,
    };
  }

  public async getSponsorInfo(): Promise<SignerInfo | null> {
    if (!this.sponsorSigner) {
      return null;
    }

    const balance = await this.provider.getBalance(this.sponsorSigner.address);
    const nonce = await this.sponsorSigner.getNonce();

    return {
      address: this.sponsorSigner.address,
      balance: formatBalance(balance),
      nonce,
    };
  }

  public async createRevocationAuthorization(
    params?: Partial<AuthorizationParams>
  ): Promise<Authorization> {
    try {
      const currentNonce = await this.delegatorSigner.getNonce();
      
      const authParams: AuthorizationParams = {
        address: ethers.ZeroAddress,
        nonce: currentNonce,
        chainId: this.config.chainId!,
        ...params,
      };

      const authorization = await this.delegatorSigner.authorize(authParams);
      
      return authorization;
    } catch (error) {
      throw new AuthorizationError(
        `Failed to create revocation authorization: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async revokeDelegation(
    authorization?: Authorization,
    options?: RevocationOptions
  ): Promise<DelegationResult> {
    try {
      await validateBalance(this.delegatorSigner);

      const auth = authorization || await this.createRevocationAuthorization();

      const txParams = {
        type: 4 as const,
        to: this.delegatorSigner.address,
        value: 0,
        gasLimit: options?.gasLimit || 50000,
        authorizationList: [auth],
        ...(options?.maxFeePerGas && { maxFeePerGas: options.maxFeePerGas }),
        ...(options?.maxPriorityFeePerGas && { maxPriorityFeePerGas: options.maxPriorityFeePerGas }),
      };

      const tx = await this.delegatorSigner.sendTransaction(txParams);
      const receipt = await waitWithTimeout(tx.wait(), 60000);

      if (!receipt) {
        throw new TransactionError('Transaction receipt is null', tx.hash);
      }

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        success: receipt.status === 1,
      };
    } catch (error) {
      if (error instanceof DelegationError) {
        throw error;
      }
      
      throw new TransactionError(
        `Failed to revoke delegation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async sponsoredRevokeDelegation(
    authorization?: Authorization,
    options?: RevocationOptions
  ): Promise<DelegationResult> {
    if (!this.sponsorSigner) {
      throw new DelegationError('Sponsor signer not configured');
    }

    try {
      await validateBalance(this.sponsorSigner);

      const auth = authorization || await this.createRevocationAuthorization();

      const txParams = {
        type: 4 as const,
        to: this.delegatorSigner.address,
        value: 0,
        gasLimit: options?.gasLimit || 50000,
        authorizationList: [auth],
        ...(options?.maxFeePerGas && { maxFeePerGas: options.maxFeePerGas }),
        ...(options?.maxPriorityFeePerGas && { maxPriorityFeePerGas: options.maxPriorityFeePerGas }),
      };

      const tx = await this.sponsorSigner.sendTransaction(txParams);
      const receipt = await waitWithTimeout(tx.wait(), 60000);

      if (!receipt) {
        throw new TransactionError('Transaction receipt is null', tx.hash);
      }

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        success: receipt.status === 1,
      };
    } catch (error) {
      if (error instanceof DelegationError) {
        throw error;
      }
      
      throw new TransactionError(
        `Failed to sponsor delegation revocation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public getProvider(): Provider {
    return this.provider;
  }

  public getDelegatorSigner(): Signer {
    return this.delegatorSigner;
  }

  public getSponsorSigner(): Signer | undefined {
    return this.sponsorSigner;
  }
}