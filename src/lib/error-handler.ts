export class AppError extends Error {
    constructor(
      public readonly message: string,
      public readonly statusCode: number = 500,
      public readonly details?: any
    ) {
      super(message)
      Object.setPrototypeOf(this, new.target.prototype)
    }
  
    toJSON() {
      return {
        error: this.message,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details })
      }
    }
  }
  
  export const handleError = (error: unknown) => {
    if (error instanceof AppError) {
      return error
    }
  
    if (error instanceof Error) {
      console.error('Unexpected error:', error)
      return new AppError(error.message || 'An unexpected error occurred')
    }
  
    console.error('Non-Error exception:', error)
    return new AppError('An unknown error occurred')
  }
  
  export const errorHandler = (handler: Function) => {
    return async (...args: any[]) => {
      try {
        return await handler(...args)
      } catch (error) {
        return handleError(error)
      }
    }
  }