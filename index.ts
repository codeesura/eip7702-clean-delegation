#!/usr/bin/env bun
import dotenv from 'dotenv';
import { DelegationManager } from './src/index.js';
import {
  ConfigurationError,
  InsufficientBalanceError,
  TransactionError,
  AuthorizationError,
} from './src/index.js';

dotenv.config();

console.log('EIP-7702 Clean Delegation Tool');
console.log('================================\n');

async function main() {
  try {
    console.log('Initializing delegation manager...');
    const manager = DelegationManager.fromEnv();

    console.log('Getting account information...');
    const delegatorInfo = await manager.getDelegatorInfo();
    console.log(`Delegator: ${delegatorInfo.address}`);
    console.log(`Balance: ${delegatorInfo.balance} ETH`);
    console.log(`Nonce: ${delegatorInfo.nonce}\n`);

    const sponsorInfo = await manager.getSponsorInfo();
    if (sponsorInfo) {
      console.log('Sponsor account detected:');
      console.log(`Address: ${sponsorInfo.address}`);
      console.log(`Balance: ${sponsorInfo.balance} ETH`);
      console.log(`Nonce: ${sponsorInfo.nonce}\n`);
    }

    console.log('Creating revocation authorization...');
    const authorization = await manager.createRevocationAuthorization();
    console.log('Authorization created successfully\n');

    if (sponsorInfo) {
      console.log('Executing sponsored delegation revocation...');
      const result = await manager.sponsoredRevokeDelegation(authorization);
      
      if (result.success) {
        console.log('Delegation revoked successfully via sponsor!');
        console.log(`Transaction: ${result.transactionHash}`);
        console.log(`Block: ${result.blockNumber}`);
        console.log(`Gas Used: ${result.gasUsed}`);
      } else {
        console.log('Revocation transaction failed');
        process.exit(1);
      }
    } else {
      console.log('Executing delegation revocation...');
      const result = await manager.revokeDelegation(authorization);
      
      if (result.success) {
        console.log('Delegation revoked successfully!');
        console.log(`Transaction: ${result.transactionHash}`);
        console.log(`Block: ${result.blockNumber}`);
        console.log(`Gas Used: ${result.gasUsed}`);
      } else {
        console.log('Revocation transaction failed');
        process.exit(1);
      }
    }

    console.log('\nOperation completed successfully!');

  } catch (error) {
    console.error('\nError occurred:');
    
    if (error instanceof ConfigurationError) {
      console.error('Configuration Error:', error.message);
      console.error('Please check your .env file and ensure all required variables are set.');
    } else if (error instanceof InsufficientBalanceError) {
      console.error('Insufficient Balance:', error.message);
      console.error('Please add more ETH to your account.');
    } else if (error instanceof AuthorizationError) {
      console.error('Authorization Error:', error.message);
      console.error('Please check your private keys and network configuration.');
    } else if (error instanceof TransactionError) {
      console.error('Transaction Error:', error.message);
      console.error('This might be a gas or network issue.');
    } else {
      console.error('Unknown Error:', error instanceof Error ? error.message : 'Something went wrong');
    }
    
    console.error('\nFor help, check the README.md file or your configuration.');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nProcess interrupted. Exiting gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nProcess terminated. Exiting gracefully...');
  process.exit(0);
});

// Run the main function
main();