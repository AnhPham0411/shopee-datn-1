import { Request, Response } from 'express';
import User from '../models/User';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const body = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    delete body.password;
    delete body.roles;
    delete body.email;

    Object.assign(user, body);
    await user.save();

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
      message: 'Cập nhật thành công',
      data: userResponse
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server' });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    // req.file is populated by multer
    if (!req.file) {
      return res.status(400).json({ message: 'Không tìm thấy file upload' });
    }
    
    // In a real app we would upload to S3 / Cloudinary and return the URL
    // Here we can just return a fake or base64 URL, or if we serve static files, we return the path
    const url = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Upload thành công',
      data: url
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server' });
  }
};
