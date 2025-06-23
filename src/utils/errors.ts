export class DelegationError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DelegationError';
  }
}

export class ConfigurationError extends DelegationError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

export class TransactionError extends DelegationError {
  constructor(message: string, public readonly txHash?: string) {
    super(message, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
  }
}

export class InsufficientBalanceError extends DelegationError {
  constructor(address: string, required: string, available: string) {
    super(
      `Insufficient balance for address ${address}. Required: ${required}, Available: ${available}`,
      'INSUFFICIENT_BALANCE'
    );
    this.name = 'InsufficientBalanceError';
  }
}

export class AuthorizationError extends DelegationError {
  constructor(message: string) {
    super(message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}