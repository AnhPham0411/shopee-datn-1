import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Purchase from '../models/Purchase';
import Category from '../models/Category';
import Voucher from '../models/Voucher';
import Review from '../models/Review';

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ roles: { $nin: ['Admin'] } });
    const totalStores = await User.countDocuments({ roles: 'Store' });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 1 });
    const completedOrders = await Order.countDocuments({ status: 4 });

    const orders = await Order.find({ status: 4 }).populate('items.product');
    
    let totalRevenue = 0;
    for (const o of orders) {
      for (const item of o.items) {
        const product = item.product as any;
        if (product && product.seller) {
          totalRevenue += (item.price * item.buy_count) * 0.1; // Nền tảng lấy 10%
        } else {
          totalRevenue += (item.price * item.buy_count); // Của admin tự bán thì 100%
        }
      }
      totalRevenue += o.shippingFee || 0; // Phí ship nền tảng giữ hoặc trả đối tác, giả định nền tảng thu
    }

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const chartData = [];
    for (let i = 0; i < last7Days.length; i++) {
      const start = last7Days[i];
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const dayOrders = await Order.find({
        status: 4,
        updatedAt: { $gte: start, $lt: end }
      }).populate('items.product');

      let dayRevenue = 0;
      for (const o of dayOrders) {
        for (const item of o.items) {
          const product = item.product as any;
          if (product && product.seller) {
            dayRevenue += (item.price * item.buy_count) * 0.1;
          } else {
            dayRevenue += (item.price * item.buy_count);
          }
        }
        dayRevenue += o.shippingFee || 0;
      }

      chartData.push({
        date: `${start.getDate()}/${start.getMonth() + 1}`,
        revenue: dayRevenue
      });
    }

    res.status(200).json({
      message: 'Lấy thống kê thành công',
      data: {
        totalUsers,
        totalStores,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        chartData
      }
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ roles: { $nin: ['Admin'] } }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Lấy danh sách người dùng thành công',
      data: users
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const toggleLockUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).user;

    if (adminUser && adminUser._id.toString() === id) {
      return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản của chính mình' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.roles.includes('Admin')) {
      return res.status(403).json({ message: 'Không thể khóa tài khoản Admin khác' });
    }

    user.isLocked = !user.isLocked;
    await user.save();

    res.status(200).json({
      message: user.isLocked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      data: user
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('seller', 'name email').sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Lấy danh sách sản phẩm thành công',
      data: products
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({
      message: 'Đã gỡ sản phẩm thành công'
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, price_before_discount, quantity, status, description } = req.body;
    const updated = await Product.findByIdAndUpdate(
      id,
      { name, price, price_before_discount, quantity, status, description },
      { new: true, runValidators: true }
    ).populate('category', 'name').populate('seller', 'name email');
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.status(200).json({ message: 'Cập nhật sản phẩm thành công', data: updated });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error }); }
};

export const getStores = async (req: Request, res: Response) => {
  try {
    const stores = await User.find({ roles: 'Store' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Lấy danh sách cửa hàng thành công',
      data: stores
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    
    const targetStatus = Number(status);
    if (![1, 2, 3, 4, 5].includes(targetStatus)) {
      return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    if (order.status === 4 || order.status === 5) {
      return res.status(400).json({ message: 'Đơn hàng đã kết thúc, không thể thay đổi trạng thái' });
    }

    const oldStatus = order.status;
    order.status = targetStatus;
    await order.save();
    
    // Sync Purchase status
    for (const item of order.items) {
      await Purchase.updateMany(
        { user: order.user, product: item.product, status: { $gte: 1 } },
        { status: status }
      );
    }

    // Revert stock on cancellation (status 5)
    if (status === 5 && oldStatus !== 5) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.buy_count;
          product.sold = Math.max(0, product.sold - item.buy_count);
          await product.save();
        }
      }
      if (order.voucherId) {
        await Voucher.findByIdAndUpdate(order.voucherId, { $inc: { used_count: -1 } });
      }
    }

    res.status(200).json({
      message: 'Cập nhật trạng thái thành công',
      data: order
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

// ── Category CRUD ────────────────────────────────────────────
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ message: 'Ok', data: categories });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Thiếu tên danh mục' });
    const cat = new Category({ name: name.trim(), image });
    await cat.save();
    res.status(201).json({ message: 'Tạo danh mục thành công', data: cat });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if there are active or hidden products in this category
    const productCount = await Product.countDocuments({ category: id, status: { $ne: 'deleted' } });
    if (productCount > 0) {
      return res.status(400).json({ message: 'Không thể xóa danh mục này vì vẫn còn sản phẩm đang thuộc danh mục' });
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: 'Đã xóa danh mục' });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Thiếu tên danh mục' });
    const cat = await Category.findByIdAndUpdate(id, { name: name.trim(), image }, { new: true });
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.status(200).json({ message: 'Cập nhật thành công', data: cat });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};

// ── Voucher admin management ─────────────────────────────────
export const adminGetVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Ok', data: vouchers });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};

export const adminCreateVoucher = async (req: Request, res: Response) => {
  try {
    const { code, title, discount_type, discount_value, min_order_value, max_discount_amount, expires_at, usage_limit } = req.body;
    const voucher = new Voucher({
      code, title, discount_type, discount_value,
      min_order_value: min_order_value || 0,
      max_discount_amount,
      expires_at: new Date(expires_at),
      usage_limit,
      scope: 'global'
    });
    await voucher.save();
    res.status(201).json({ message: 'Tạo voucher thành công', data: voucher });
  } catch (error: any) {
    res.status(500).json({ message: error.code === 11000 ? 'Mã voucher đã tồn tại' : 'Lỗi server', data: error });
  }
};

export const adminToggleVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const v = await Voucher.findById(id);
    if (!v) return res.status(404).json({ message: 'Không tìm thấy' });
    v.isActive = !v.isActive;
    await v.save();
    res.status(200).json({ message: v.isActive ? 'Đã kích hoạt' : 'Đã vô hiệu hóa', data: v });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};

export const adminDeleteVoucher = async (req: Request, res: Response) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa voucher' });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};

// ── Review management ────────────────────────────────────────
export const adminGetReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .limit(200);
    res.status(200).json({ message: 'Ok', data: reviews });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};

export const adminDeleteReview = async (req: Request, res: Response) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Đã xóa đánh giá' });
  } catch (error) { res.status(500).json({ message: 'Lỗi server', data: error }); }
};
