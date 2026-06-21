import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { signToken, verifyToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({
        message: 'Lỗi validate',
        data: { email: 'Email đã tồn tại' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, roles: ['User'] });
    await user.save();

    const payload = { userId: user._id };
    const access_token = signToken(payload);
    const refresh_token = signToken(payload, true);

    const userResponse = {
      _id: user._id,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      message: 'Đăng ký thành công',
      data: {
        access_token,
        refresh_token,
        expires: 86400,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(422).json({
        message: 'Lỗi validate',
        data: { email: 'Email hoặc mật khẩu không đúng', password: 'Email hoặc mật khẩu không đúng' }
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return res.status(422).json({
        message: 'Lỗi validate',
        data: { email: 'Email hoặc mật khẩu không đúng', password: 'Email hoặc mật khẩu không đúng' }
      });
    }

    const payload = { userId: user._id };
    const access_token = signToken(payload);
    const refresh_token = signToken(payload, true);

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      address: user.address,
      avatar: user.avatar,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      message: 'Đăng nhập thành công',
      data: {
        access_token,
        refresh_token,
        expires: 86400,
        user: userResponse
      }
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Đăng xuất thành công' });
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
       return res.status(401).json({ message: 'Lỗi xác thực', data: { name: 'UNAUTHORIZED', message: 'Token không được gửi' } });
    }

    let decoded: any;
    try {
      decoded = verifyToken(refresh_token, true);
    } catch (err) {
      return res.status(401).json({ message: 'Lỗi xác thực', data: { name: 'EXPIRED_TOKEN', message: 'Token hết hạn' } });
    }

    const payload = { userId: decoded.userId };
    const access_token = signToken(payload);
    const new_refresh_token = signToken(payload, true);

    res.status(200).json({
      message: 'Refresh token thành công',
      data: {
        access_token,
        refresh_token: new_refresh_token
      }
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      address: user.address,
      avatar: user.avatar,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      message: 'Lấy thông tin thành công',
      data: userResponse
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
