import { Request, Response } from 'express';
import Order from '../models/Order';
import Purchase from '../models/Purchase';
import Product from '../models/Product';
import User from '../models/User';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { items, shippingAddress, shippingMethod, shippingFee, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    let itemsTotal = 0;
    const orderItems = [];

    // Verify products and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm ${item.product_id}` });
      }
      
      const itemPrice = product.price;
      itemsTotal += itemPrice * item.buy_count;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        buy_count: item.buy_count,
        price: product.price,
        price_before_discount: product.price_before_discount
      });

      // Xóa khỏi giỏ hàng nếu có
      await Purchase.findOneAndDelete({
        user: userId,
        product: product._id,
        status: -1
      });
      
      // Tạo một purchase history với status 1 để duy trì logic frontend cũ hoặc đánh giá sản phẩm (tương thích)
      // Purchase cho order history
      const newPurchase = new Purchase({
        user: userId,
        product: product._id,
        buy_count: item.buy_count,
        price: product.price,
        price_before_discount: product.price_before_discount,
        status: 1 // Chờ xác nhận
      });
      await newPurchase.save();
    }

    const user = await User.findById(userId);
    const recipientName = user?.name || 'Khách hàng';
    const recipientPhone = user?.phone || '0123456789';

    const mappedShippingMethod = shippingMethod === 'hoatoc' ? 'express' : shippingMethod === 'tietkiem' ? 'sameday' : 'standard';
    const mappedPaymentMethod = paymentMethod === 'bank' ? 'bank_transfer' : 'cod';

    const totalAmount = itemsTotal + shippingFee;

    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      recipientName,
      recipientPhone,
      shippingMethod: mappedShippingMethod,
      shippingFee,
      paymentMethod: mappedPaymentMethod,
      subTotal: itemsTotal,
      totalAmount,
      status: 1 // 1: Chờ xác nhận
    });

    await order.save();

    res.status(200).json({
      message: 'Đặt hàng thành công',
      data: order
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const status = req.query.status ? Number(req.query.status) : 0;

    let query: any = { user: userId };
    if (status > 0) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 });

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
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    order.status = status;
    await order.save();
    
    // Cập nhật lại status của Purchase tương ứng để không gãy logic cũ
    for (const item of order.items) {
      await Purchase.updateMany(
        { user: order.user, product: item.product, status: { $gte: 1 } },
        { status: status }
      );
    }

    res.status(200).json({
      message: 'Cập nhật trạng thái thành công',
      data: order
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
