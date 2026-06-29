import { Request, Response } from 'express';
import Notification from '../models/Notification';

/** Helper tạo thông báo — dùng nội bộ từ các controller khác */
export const createNotification = async (params: {
  user: any;
  type?: string;
  title: string;
  message: string;
  link?: string;
}) => {
  try {
    await Notification.create({
      user: params.user,
      type: params.type || 'system',
      title: params.title,
      message: params.message,
      link: params.link,
    });
  } catch (error) {
    // Không để lỗi thông báo làm hỏng luồng chính
    console.error('createNotification error:', error);
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.status(200).json({
      message: 'Lấy thông báo thành công',
      data: { notifications, unreadCount },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    await Notification.updateOne({ _id: req.params.id, user: userId }, { isRead: true });
    res.status(200).json({ message: 'Đã đọc thông báo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'Đã đọc tất cả thông báo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
