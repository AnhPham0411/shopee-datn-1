import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { signToken, verifyToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: Record<string, string> = {};

    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      errors.email = 'Email không đúng định dạng';
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        message: 'Lỗi validate',
        data: errors
      });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(422).json({
        message: 'Lỗi validate',
        data: { email: 'Email đã tồn tại' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email: email.toLowerCase(), password: hashedPassword, roles: ['User'] });
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Không tiết lộ email có tồn tại hay không (chống dò email)
    if (!user) {
      return res.status(200).json({ message: 'Nếu email tồn tại, mã OTP đã được gửi' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    await user.save();

    // Production: gửi OTP qua email (nodemailer). Demo đồ án: log + trả về để thử nghiệm.
    console.log(`[Forgot Password] OTP cho ${email}: ${otp}`);

    res.status(200).json({
      message: 'Mã OTP đã được gửi (demo)',
      data: { devOtp: otp } // chỉ dùng cho demo; production KHÔNG trả OTP về client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải từ 6 ký tự trở lên' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOtp +resetOtpExpires');
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: 'Yêu cầu đặt lại mật khẩu không hợp lệ' });
    }

    if (user.resetOtp !== String(otp)) {
      return res.status(400).json({ message: 'Mã OTP không đúng' });
    }
    if (user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
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
