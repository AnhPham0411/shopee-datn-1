import { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';

export const getProducts = async (req: Request, res: Response) => {
  try {
    let { 
      page = '1', 
      limit = '30', 
      sort_by = 'createdAt', 
      order = 'desc', 
      price_min, 
      price_max, 
      rating_filter, 
      category, 
      name, 
      exclude,
      stock_status,
      has_discount,
      storeId
    } = req.query as any;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const query: any = { status: 'active' };
    if (category) {
      if (typeof category === 'string' && category.includes(',')) {
        const ids = category.split(',').filter(id => /^[0-9a-fA-F]{24}$/.test(id));
        if (ids.length > 0) query.category = { $in: ids };
      } else if (typeof category === 'string' && /^[0-9a-fA-F]{24}$/.test(category)) {
        query.category = category;
      }
    }
    if (name) {
      const safeName = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query.name = { $regex: safeName(name as string), $options: 'i' };
    }
    if (exclude && typeof exclude === 'string' && /^[0-9a-fA-F]{24}$/.test(exclude)) {
      query._id = { $ne: exclude };
    }
    if (rating_filter) query.rating = { $gte: Number(rating_filter) };
    if (price_min || price_max) {
      query.price = {};
      if (price_min) query.price.$gte = Number(price_min);
      if (price_max) query.price.$lte = Number(price_max);
    }
    
    if (stock_status === 'in_stock') {
      query.quantity = { $gt: 0 };
    } else if (stock_status === 'out_of_stock') {
      query.quantity = { $lte: 0 };
    }

    if (has_discount === 'true') {
      query.$expr = { $gt: ["$price_before_discount", "$price"] };
    }
    
    if (storeId && typeof storeId === 'string' && /^[0-9a-fA-F]{24}$/.test(storeId)) {
      query.seller = storeId;
    }

    const sortOption: any = {};
    sortOption[sort_by] = order === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      message: 'Lấy các sản phẩm thành công',
      data: {
        products,
        pagination: {
          page,
          limit,
          page_size: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, status: 'active' }).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.status(200).json({
      message: 'Lấy chi tiết sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { category, limit = '6', recently_viewed } = req.query;
    
    const query: any = { status: 'active' };
    const orConditions: any[] = [];

    if (category && typeof category === 'string' && /^[0-9a-fA-F]{24}$/.test(category)) {
      orConditions.push({ category });
    }

    if (recently_viewed) {
      const ids = (recently_viewed as string).split(',')
        .filter(id => id && /^[0-9a-fA-F]{24}$/.test(id));
      if (ids.length > 0) {
        orConditions.push({ _id: { $in: ids } });
      }
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    const recommendations = await Product.find(query)
      .sort({ view: -1, sold: -1 })
      .limit(Number(limit))
      .populate('category', 'name');

    res.status(200).json({
      message: 'Lấy sản phẩm gợi ý thành công',
      data: recommendations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

const escapeRegex = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

export const suggestProducts = async (req: Request, res: Response) => {
  try {
    const { q = '', limit = '5' } = req.query as any;
    
    if (!q || String(q).trim().length === 0) {
      return res.status(200).json({
        message: 'Gợi ý sản phẩm',
        data: []
      });
    }

    const safeQ = escapeRegex(String(q).trim());
    const query = { name: { $regex: safeQ, $options: 'i' }, status: 'active' };
    
    const products = await Product.find(query)
      .select('name image price')
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      message: 'Gợi ý sản phẩm',
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
