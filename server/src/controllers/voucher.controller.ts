import { Request, Response } from 'express';
import Voucher from '../models/Voucher';

export const applyVoucher = async (req: Request, res: Response) => {
  try {
    const { code, order_value } = req.body;
    
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    
    if (!voucher) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }

    if (new Date() > voucher.expires_at) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }

    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    if (order_value < voucher.min_order_value) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu phải từ ${voucher.min_order_value}đ để áp dụng` });
    }

    let discount_amount = 0;
    if (voucher.discount_type === 'fixed') {
      discount_amount = voucher.discount_value;
    } else {
      discount_amount = order_value * (voucher.discount_value / 100);
      if (voucher.max_discount_amount && discount_amount > voucher.max_discount_amount) {
        discount_amount = voucher.max_discount_amount;
      }
    }

    res.status(200).json({
      message: 'Áp dụng mã giảm giá thành công',
      data: {
        discount_amount,
        voucher_id: voucher._id
      }
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const { code, discount_type, discount_value, min_order_value, max_discount_amount, expires_at, usage_limit } = req.body;
    
    const existing = await Voucher.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
    }

    const sellerId = (req as any).user.roles.includes('Admin') ? undefined : (req as any).user._id;

    const voucher = new Voucher({
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      min_order_value,
      max_discount_amount,
      expires_at,
      usage_limit,
      seller: sellerId
    });

    await voucher.save();
    
    res.status(201).json({
      message: 'Tạo mã giảm giá thành công',
      data: voucher
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getVouchers = async (req: Request, res: Response) => {
  try {
    const isAdmin = (req as any).user.roles.includes('Admin');
    let query = {};
    if (!isAdmin) {
      query = { seller: (req as any).user._id };
    }
    const vouchers = await Voucher.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      message: 'Lấy danh sách mã giảm giá thành công',
      data: vouchers
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getPublicVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await Voucher.find({ 
      isActive: true, 
      expires_at: { $gt: new Date() } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      message: 'Lấy danh sách mã giảm giá công khai thành công',
      data: vouchers
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
