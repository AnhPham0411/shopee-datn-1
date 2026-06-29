import { Request, Response } from 'express';
import Voucher from '../models/Voucher';

export const applyVoucher = async (req: Request, res: Response) => {
  try {
    const { code, order_value } = req.body;
    
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    
    if (!voucher) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ message: 'Mã giảm giá đã bị vô hiệu hóa' });
    }

    if (new Date() > voucher.expires_at) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }

    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
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
    const { code, title, discount_type, discount_value, min_order_value, max_discount_amount, expires_at, usage_limit } = req.body;
    
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ message: 'Mã giảm giá không được để trống' });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Tiêu đề mã giảm giá không được để trống' });
    }

    if (discount_type !== 'percent' && discount_type !== 'fixed') {
      return res.status(400).json({ message: 'Loại giảm giá không hợp lệ' });
    }

    if (typeof discount_value !== 'number' || discount_value <= 0) {
      return res.status(400).json({ message: 'Giá trị giảm giá phải lớn hơn 0' });
    }

    if (discount_type === 'percent' && discount_value > 100) {
      return res.status(400).json({ message: 'Phần trăm giảm giá tối đa là 100%' });
    }

    if (min_order_value !== undefined && (typeof min_order_value !== 'number' || min_order_value < 0)) {
      return res.status(400).json({ message: 'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0' });
    }

    if (max_discount_amount !== undefined && (typeof max_discount_amount !== 'number' || max_discount_amount < 0)) {
      return res.status(400).json({ message: 'Giá trị giảm tối đa phải lớn hơn hoặc bằng 0' });
    }

    if (!expires_at || new Date(expires_at).toString() === 'Invalid Date') {
      return res.status(400).json({ message: 'Hạn sử dụng không hợp lệ' });
    }

    if (new Date(expires_at) <= new Date()) {
      return res.status(400).json({ message: 'Hạn sử dụng phải ở trong tương lai' });
    }

    if (typeof usage_limit !== 'number' || usage_limit < 1) {
      return res.status(400).json({ message: 'Lượt sử dụng phải là số nguyên dương' });
    }

    const existing = await Voucher.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
    }

    const sellerId = (req as any).user.roles.includes('Admin') ? undefined : (req as any).user._id;

    const voucher = new Voucher({
      code: code.toUpperCase(),
      title: title.trim(),
      discount_type,
      discount_value,
      min_order_value: min_order_value || 0,
      max_discount_amount: max_discount_amount || undefined,
      expires_at: new Date(expires_at),
      usage_limit,
      seller: sellerId
    });

    await voucher.save();
    
    res.status(201).json({
      message: 'Tạo mã giảm giá thành công',
      data: voucher
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', data: error?.message || error });
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
