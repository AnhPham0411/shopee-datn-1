import { Request, Response } from 'express';
import Order from '../models/Order';

/**
 * Mô phỏng callback (IPN) của cổng thanh toán.
 * Production sẽ thay bằng webhook thật từ VNPay/Momo có xác thực chữ ký.
 */
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { success } = req.body;
    const userId = (req as any).user._id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ chủ đơn được thanh toán đơn của mình
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền thanh toán đơn hàng này' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Đơn hàng đã được thanh toán' });
    }

    if (order.status === 5) {
      return res.status(400).json({ message: 'Đơn hàng đã hủy, không thể thanh toán' });
    }

    order.paymentStatus = success ? 'paid' : 'failed';
    await order.save();

    res.status(200).json({
      message: success ? 'Thanh toán thành công' : 'Thanh toán thất bại',
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
