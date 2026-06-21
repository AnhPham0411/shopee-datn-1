import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
      await wishlist.save();
    }

    res.status(200).json({
      message: 'Lấy danh sách yêu thích thành công',
      data: wishlist.products
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();

    res.status(200).json({
      message: 'Thêm vào yêu thích thành công',
      data: wishlist.products
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id: productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Danh sách yêu thích không tồn tại' });
    }

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId) as any;
    await wishlist.save();

    res.status(200).json({
      message: 'Xóa khỏi yêu thích thành công',
      data: wishlist.products
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
