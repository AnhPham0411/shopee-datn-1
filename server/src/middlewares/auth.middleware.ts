import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Lỗi xác thực', data: { name: 'EXPIRED_TOKEN', message: 'Token không được gửi' } });
    }
    
    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
         return res.status(401).json({ message: 'Lỗi xác thực', data: { name: 'EXPIRED_TOKEN', message: 'Token hết hạn' } });
      }
      return res.status(401).json({ message: 'Lỗi xác thực', data: { name: 'UNAUTHORIZED', message: 'Token không hợp lệ' } });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Lỗi xác thực', data: { name: 'UNAUTHORIZED', message: 'Người dùng không tồn tại' } });
    }

    if (user.isLocked) {
      return res.status(403).json({ message: 'Lỗi xác thực', data: { name: 'ACCOUNT_LOCKED', message: 'Tài khoản của bạn đã bị khóa' } });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Lỗi xác thực' });
    }
    
    const hasRole = user.roles.some((role: string) => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }
    
    next();
  };
};
