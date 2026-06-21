import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const signToken = (payload: object, isRefresh = false) => {
  const secret = isRefresh ? process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey' : process.env.JWT_SECRET || 'supersecretjwtkey';
  const expiresIn = isRefresh ? process.env.JWT_REFRESH_EXPIRES_IN || '7d' : process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string, isRefresh = false) => {
  const secret = isRefresh ? process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey' : process.env.JWT_SECRET || 'supersecretjwtkey';
  return jwt.verify(token, secret);
};
