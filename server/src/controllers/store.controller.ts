import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Purchase from '../models/Purchase';

export const registerStore = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.roles.includes('Store')) {
      return res.status(400).json({ message: 'Bạn đã là Store rồi' });
    }

    user.roles.push('Store');
    await user.save();

    res.status(200).json({
      message: 'Đăng ký bán hàng thành công',
      data: user
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getStoreProducts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const products = await Product.find({ seller: userId }).populate('category');
    
    res.status(200).json({
      message: 'Lấy danh sách sản phẩm thành công',
      data: products
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const createStoreProduct = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const body = req.body;

    const product = new Product({
      ...body,
      seller: userId
    });

    await product.save();

    res.status(200).json({
      message: 'Tạo sản phẩm thành công',
      data: product
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const updateStoreProduct = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;
    const body = req.body;

    const product = await Product.findOne({ _id: id, seller: userId });
    if (!product) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa sản phẩm này' });
    }

    Object.assign(product, body);
    await product.save();

    res.status(200).json({
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const deleteStoreProduct = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, seller: userId });
    if (!product) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này' });
    }

    await Product.deleteOne({ _id: id });

    res.status(200).json({
      message: 'Xóa sản phẩm thành công',
      data: {}
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getStoreOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    // Tìm các đơn hàng chứa sản phẩm do store này bán
    // Ở hệ thống này, Order chứa OrderItem (ref Product)
    // Cách làm:
    // 1. Tìm các sản phẩm của store
    const storeProducts = await Product.find({ seller: userId }).select('_id');
    const storeProductIds = storeProducts.map(p => p._id);

    // 2. Tìm các Purchase có product thuộc storeProductIds, status >= 1
    const purchases = await Purchase.find({
      product: { $in: storeProductIds },
      status: { $gte: 1 }
    }).populate('product').populate('user', 'name email address phone').sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Lấy đơn hàng thành công',
      data: purchases
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getStoreDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    const storeProducts = await Product.find({ seller: userId }).select('_id');
    const storeProductIds = storeProducts.map(p => p._id);

    // Tính tổng doanh thu từ các đơn hàng hoàn thành (status = 3 hoặc 4 tuỳ logic)
    // Giả sử status = 3 là đã giao (thành công)
    const completedPurchases = await Purchase.find({
      product: { $in: storeProductIds },
      status: 3
    });

    // Store nhận 90% giá trị sản phẩm, 10% chia cho nền tảng
    const totalRevenue = completedPurchases.reduce((total, p) => total + (p.price * p.buy_count * 0.9), 0);
    const totalOrders = completedPurchases.length;

    res.status(200).json({
      message: 'Lấy thống kê thành công',
      data: {
        totalRevenue,
        totalOrders
      }
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
