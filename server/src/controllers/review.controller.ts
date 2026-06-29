import { Request, Response } from 'express';
import Review from '../models/Review';
import Purchase from '../models/Purchase';
import Product from '../models/Product';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment, images } = req.body;
    const { id: productId } = req.params;
    const userId = (req as any).user._id;

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: 'Điểm đánh giá phải là số nguyên từ 1 đến 5', data: null });
    }

    // Check if user has already reviewed the product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi', data: null });
    }

    // Check if user has purchased the product (status >= 1)
    const hasPurchased = await Purchase.findOne({
      product: productId,
      user: userId,
      status: { $gte: 1 }
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'Bạn chưa mua sản phẩm này nên không thể đánh giá', data: null });
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
      images: images || [],
    });
    await review.save();

    // Update product rating
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Product.findByIdAndUpdate(productId, { rating: Number(avgRating.toFixed(1)) });

    res.status(200).json({
      message: 'Đánh giá sản phẩm thành công',
      data: review
    });
  } catch (error: any) { 
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }
    console.error(error); 
    res.status(500).json({ message: 'Lỗi server', data: error });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { id: productId } = req.params;
    let { rating, page = '1', limit = '10' } = req.query as any;

    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    const query: any = { product: productId };
    if (rating && Number(rating) > 0) {
      query.rating = Number(rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'email name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    // Calculate rating distribution
    const allProductReviews = await Review.find({ product: productId });
    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    allProductReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
      }
    });

    res.status(200).json({
      message: 'Lấy đánh giá thành công',
      data: {
        reviews,
        pagination: {
          page,
          limit,
          page_size: Math.ceil(total / limit)
        },
        ratingDistribution,
        totalReviews: allProductReviews.length
      }
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
