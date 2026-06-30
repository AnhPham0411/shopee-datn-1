import { Request, Response } from 'express';
import Order from '../models/Order';
import Purchase from '../models/Purchase';
import Product from '../models/Product';
import User from '../models/User';
import Voucher from '../models/Voucher';
import Promotion from '../models/Promotion';
import { createNotification } from './notification.controller';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { items, shippingAddress, shippingMethod, shippingFee: clientShippingFee, paymentMethod, voucherCode, recipientName: bodyRecipientName, recipientPhone: bodyRecipientPhone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Validate shippingFee to prevent negative or tampered values (N1)
    let calculatedShippingFee = 30000; // default standard
    const normalizedShipping = (shippingMethod || '').toLowerCase();
    if (normalizedShipping === 'hoatoc' || normalizedShipping === 'express') {
      calculatedShippingFee = 50000;
    } else if (normalizedShipping === 'tietkiem' || normalizedShipping === 'sameday') {
      calculatedShippingFee = 15000;
    }
    const shippingFee = calculatedShippingFee;

    let itemsTotal = 0;
    const orderItems = [];

    // Verify products, quantity, active promotion, and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm ${item.product_id}` });
      }

      // Check stock limit (1.1)
      if (product.quantity < item.buy_count) {
        return res.status(400).json({
          message: `Sản phẩm ${product.name} chỉ còn lại ${product.quantity} sản phẩm trong kho`
        });
      }

      // Check active Promotion (N7)
      const now = new Date();
      const activePromotion = await Promotion.findOne({
        product: product._id,
        isActive: true,
        start_time: { $lte: now },
        end_time: { $gte: now }
      });

      let itemPrice = product.price;
      if (activePromotion) {
        if (!activePromotion.stock_limit || activePromotion.sold_in_sale < activePromotion.stock_limit) {
          itemPrice = activePromotion.flash_price;
          // Increment sold in sale
          activePromotion.sold_in_sale += item.buy_count;
          await activePromotion.save();
        }
      }

      itemsTotal += itemPrice * item.buy_count;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        buy_count: item.buy_count,
        price: itemPrice,
        price_before_discount: product.price_before_discount
      });

      // Decrement product inventory and increment sold (1.1)
      product.quantity -= item.buy_count;
      product.sold += item.buy_count;
      await product.save();

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
        price: itemPrice,
        price_before_discount: product.price_before_discount,
        status: 1 // Chờ xác nhận
      });
      await newPurchase.save();
    }

    // Voucher handling (1.2)
    let discountAmount = 0;
    let voucher = null;

    if (voucherCode) {
      voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
      if (!voucher) {
        return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
      }

      // Validate Voucher (N6, usage_limit, min_order_value, expires_at)
      if (!voucher.isActive) {
        return res.status(400).json({ message: 'Mã giảm giá đã bị vô hiệu hóa' });
      }

      if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
        return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
      }

      if (new Date() > voucher.expires_at) {
        return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
      }

      if (itemsTotal < voucher.min_order_value) {
        return res.status(400).json({
          message: `Đơn hàng tối thiểu ${voucher.min_order_value.toLocaleString()}₫ để sử dụng mã này`
        });
      }

      // Calculate discount amount
      if (voucher.discount_type === 'percent') {
        discountAmount = (itemsTotal * voucher.discount_value) / 100;
        if (voucher.max_discount_amount && discountAmount > voucher.max_discount_amount) {
          discountAmount = voucher.max_discount_amount;
        }
      } else {
        discountAmount = voucher.discount_value;
      }

      // Ensure discount doesn't exceed subtotal
      if (discountAmount > itemsTotal) {
        discountAmount = itemsTotal;
      }

      // Increment voucher usage
      voucher.used_count += 1;
      await voucher.save();
    }

    const user = await User.findById(userId);
    const recipientName = bodyRecipientName || user?.name || 'Khách hàng';
    const recipientPhone = bodyRecipientPhone || user?.phone || '0123456789';

    const mappedShippingMethod = shippingMethod === 'hoatoc' ? 'express' : shippingMethod === 'tietkiem' ? 'sameday' : 'standard';
    const mappedPaymentMethod = paymentMethod === 'bank' ? 'bank_transfer' : 'cod';

    const totalAmount = Math.max(0, itemsTotal + shippingFee - discountAmount);

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
      discountAmount,
      totalAmount,
      status: 1, // 1: Chờ xác nhận
      voucherCode: voucherCode || undefined,
      voucherId: voucher ? voucher._id : undefined
    });

    await order.save();

    const orderCode = `#${order._id.toString().slice(-6).toUpperCase()}`;

    // Thông báo cho người mua
    await createNotification({
      user: userId,
      type: 'order',
      title: 'Đặt hàng thành công',
      message: `Đơn hàng ${orderCode} của bạn đã được tạo và đang chờ xác nhận.`,
      link: `/user/order/${order._id}`,
    });

    // Thông báo cho người bán có sản phẩm trong đơn
    const productIds = orderItems.map((i) => i.product);
    const productsForSeller = await Product.find({ _id: { $in: productIds } }).select('seller');
    const sellerIds = [...new Set(productsForSeller.map((p) => p.seller && p.seller.toString()).filter(Boolean))];
    for (const sellerId of sellerIds) {
      await createNotification({
        user: sellerId,
        type: 'order',
        title: 'Đơn hàng mới',
        message: `Bạn có đơn hàng mới ${orderCode} cần xử lý.`,
        link: '/store/orders',
      });
    }

    res.status(200).json({
      message: 'Đặt hàng thành công',
      data: order
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', data: error?.message || error });
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

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const order = await Order.findById(id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm quyền: chủ đơn / Admin / Store sở hữu sản phẩm trong đơn (chống IDOR)
    const isOwner = order.user.toString() === user._id.toString();
    const isAdmin = user.roles.includes('Admin');
    const isSellerOfAnyItem = user.roles.includes('Store') && order.items.some((item: any) => {
      const product = item.product;
      return product && product.seller && product.seller.toString() === user._id.toString();
    });

    if (!isOwner && !isAdmin && !isSellerOfAnyItem) {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
    }

    res.status(200).json({
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    const order = await Order.findById(id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const targetStatus = Number(status);
    if (![1, 2, 3, 4, 5, 6].includes(targetStatus)) {
      return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });
    }

    if (order.status === 4 || order.status === 5) {
      return res.status(400).json({ message: 'Đơn hàng đã kết thúc, không thể thay đổi trạng thái' });
    }

    // Authorization checks
    let isAuthorized = false;

    // 1. If buyer (owner of order)
    if (order.user.toString() === user._id.toString()) {
      isAuthorized = true;
      const isCancel = targetStatus === 5 && order.status === 1;
      const isConfirmReceived = targetStatus === 4 && order.status === 3;
      if (!isCancel && !isConfirmReceived) {
        return res.status(403).json({ message: 'Bạn chỉ được hủy đơn chờ xác nhận hoặc xác nhận đã nhận hàng' });
      }
    } 
    // 2. If admin
    else if (user.roles.includes('Admin')) {
      isAuthorized = true;
    } 
    // 3. If seller
    else if (user.roles.includes('Store')) {
      // Find if any item in the order belongs to this seller
      const isSellerOfAnyItem = order.items.some((item: any) => {
        const product = item.product;
        return product && product.seller && product.seller.toString() === user._id.toString();
      });
      if (isSellerOfAnyItem) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật trạng thái đơn hàng này' });
    }

    // Save old status to revert/handle inventory if needed
    const oldStatus = order.status;

    order.status = status;
    await order.save();

    // Thông báo cho người mua về thay đổi trạng thái đơn
    const STATUS_LABEL: Record<number, string> = {
      1: 'Chờ xác nhận', 6: 'Đã xác nhận', 2: 'Đang chuẩn bị hàng', 3: 'Đang giao', 4: 'Đã hoàn thành', 5: 'Đã hủy'
    };
    await createNotification({
      user: order.user,
      type: 'order',
      title: 'Cập nhật đơn hàng',
      message: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} ${STATUS_LABEL[Number(status)] ? `: ${STATUS_LABEL[Number(status)]}` : 'đã được cập nhật'}.`,
      link: `/user/order/${order._id}`,
    });

    // Cập nhật lại status của Purchase tương ứng để không gãy logic cũ
    for (const item of order.items) {
      await Purchase.updateMany(
        { user: order.user, product: item.product._id || item.product, status: { $gte: 1 } },
        { status: status }
      );
    }

    // If order was cancelled (status 5) and it wasn't cancelled before, restore stock and voucher
    if (status === 5 && oldStatus !== 5) {
      for (const item of order.items) {
        const product = await Product.findById(item.product._id || item.product);
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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', data: error?.message || error });
  }
};
