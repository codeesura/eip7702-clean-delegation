import { ethers } from 'ethers';
import type { Signer } from '../types/index.js';
import { InsufficientBalanceError } from './errors.js';

export function formatBalance(balance: bigint): string {
  return ethers.formatEther(balance);
}

export function parseBalance(balance: string): bigint {
  return ethers.parseEther(balance);
}

export async function validateBalance(
  signer: Signer,
  minimumBalance: bigint = ethers.parseEther('0.001')
): Promise<void> {
  const balance = await signer.provider!.getBalance(signer.address);
  
  if (balance < minimumBalance) {
    throw new InsufficientBalanceError(
      signer.address,
      formatBalance(minimumBalance),
      formatBalance(balance)
    );
  }
}

export function isValidPrivateKey(privateKey: string): boolean {
  try {
    new ethers.Wallet(privateKey);
    return true;
  } catch {
    return false;
  }
}

export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export async function waitWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  
  return Promise.race([promise, timeout]);
}