import { Request, Response } from 'express';
import Purchase from '../models/Purchase';
import Product from '../models/Product';

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { product_id, buy_count } = req.body;
    const userId = (req as any).user._id;

    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    let purchase = await Purchase.findOne({
      user: userId,
      product: product_id,
      status: -1 // in cart
    });

    if (purchase) {
      purchase.buy_count += buy_count;
      await purchase.save();
    } else {
      purchase = new Purchase({
        user: userId,
        product: product_id,
        buy_count,
        price: product.price,
        price_before_discount: product.price_before_discount,
        status: -1
      });
      await purchase.save();
    }

    res.status(200).json({
      message: 'Thêm vào giỏ hàng thành công',
      data: purchase
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const userId = (req as any).user._id;

    const query: any = { user: userId };
    if (status) query.status = Number(status);

    const purchases = await Purchase.find(query)
      .populate('product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Lấy đơn mua thành công',
      data: purchases
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const { product_id, buy_count } = req.body;
    const userId = (req as any).user._id;

    const purchase = await Purchase.findOne({
      user: userId,
      product: product_id,
      status: -1
    });

    if (!purchase) return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ' });

    purchase.buy_count = buy_count;
    await purchase.save();

    res.status(200).json({
      message: 'Cập nhật giỏ hàng thành công',
      data: purchase
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const deletePurchaseFromCart = async (req: Request, res: Response) => {
  try {
    const purchaseIds = req.body; // array of strings
    const userId = (req as any).user._id;

    const result = await Purchase.deleteMany({
      _id: { $in: purchaseIds },
      user: userId,
      status: -1
    });

    res.status(200).json({
      message: 'Xóa thành công',
      data: { deleted_count: result.deletedCount }
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const buyProducts = async (req: Request, res: Response) => {
  try {
    const items = req.body; // array of { product_id, buy_count }
    const userId = (req as any).user._id;
    const purchasedList = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) continue;

      // Create or update purchase to status 1 (waiting)
      let purchase = await Purchase.findOne({
        user: userId,
        product: item.product_id,
        status: -1
      });

      if (purchase) {
        purchase.status = 1;
        purchase.buy_count = item.buy_count;
        await purchase.save();
        purchasedList.push(purchase);
      } else {
        purchase = new Purchase({
          user: userId,
          product: item.product_id,
          buy_count: item.buy_count,
          price: product.price,
          price_before_discount: product.price_before_discount,
          status: 1
        });
        await purchase.save();
        purchasedList.push(purchase);
      }
    }

    res.status(200).json({
      message: 'Mua hàng thành công',
      data: purchasedList
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
