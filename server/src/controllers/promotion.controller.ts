import { Request, Response } from 'express';
import Promotion from '../models/Promotion';
import Product from '../models/Product';

export const getActivePromotions = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      start_time: { $lte: now },
      end_time: { $gte: now }
    }).populate('product');

    res.status(200).json({
      message: 'Lấy chương trình khuyến mãi thành công',
      data: promotions
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
