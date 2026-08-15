export class ForbiddenError extends Error {
  public status: number;
  constructor(message: string = 'Access denied: Gender barrier violation.') {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}
