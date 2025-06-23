import { ethers } from 'ethers';

export interface DelegationConfig {
  providerUrl: string;
  delegatorPrivateKey: string;
  sponsorPrivateKey?: string;
  chainId?: number;
  gasLimit?: number;
}

export interface SignerInfo {
  address: string;
  balance: string;
  nonce: number;
}

export interface DelegationResult {
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  success: boolean;
}

export interface AuthorizationParams {
  address: string;
  nonce: number;
  chainId: number;
}

export interface RevocationOptions {
  gasLimit?: number;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export type Provider = ethers.JsonRpcProvider;
export type Signer = ethers.Wallet;
export type Authorization = ethers.Authorization;
export type TransactionReceipt = ethers.TransactionReceipt;