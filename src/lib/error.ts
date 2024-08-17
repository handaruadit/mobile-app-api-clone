export class BusinessRuleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleValidationError';
  }
}
