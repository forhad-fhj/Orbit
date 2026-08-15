import { Request, Response, NextFunction } from 'express';
import { BaseResponse } from '@socialplatform/shared-types';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  const response: BaseResponse = {
    success: false,
    error: err.message || 'Internal Server Error'
  };

  res.status(err.status || 500).json(response);
};
