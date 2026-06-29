import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category';
import Product from './models/Product';
import User from './models/User';
import bcrypt from 'bcrypt';

dotenv.config();

const categoriesData = [
  { name: 'Thời trang nam', image: 'https://m.media-amazon.com/images/I/71rxmYWcGML._AC_SY879_.jpg' },
  { name: 'Thời trang nữ', image: 'https://m.media-amazon.com/images/I/71k3A9gK6SL._AC_SY879_.jpg' },
  { name: 'Phụ kiện điện thoại', image: 'https://m.media-amazon.com/images/I/61bK6PMOC8L._AC_SX679_.jpg' },
  { name: 'Balo & Túi xách', image: 'https://m.media-amazon.com/images/I/81q2X9xOkiL._AC_SY879_.jpg' },
  { name: 'Đồng hồ & Trang sức', image: 'https://m.media-amazon.com/images/I/51xxA+6E+xL._AC_SY879_.jpg' }
];

const realisticProducts = [
  // Thời trang nam
  { name: 'Áo thun nam basic cổ tròn', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', price: 150000 },
  { name: 'Áo nỉ hoodie nam dáng rộng', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', price: 250000 },
  { name: 'Quần jean nam dáng đứng', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', price: 300000 },
  { name: 'Áo sơ mi nam công sở tay dài', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?w=800&q=80', price: 220000 },
  { name: 'Quần short nam thể thao nhẹ', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80', price: 120000 },
  { name: 'Áo polo nam thanh lịch', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', price: 180000 },
  { name: 'Quần tây nam âu phục', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80', price: 350000 },
  { name: 'Áo khoác gió nam dù', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', price: 280000 },
  { name: 'Bộ thể thao nam mùa hè', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', price: 200000 },
  { name: 'Áo len nam cổ lọ ấm áp', categoryName: 'Thời trang nam', image: 'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800&q=80', price: 320000 },
  
  // Thời trang nữ
  { name: 'Đầm xòe hoa nhí mùa hè', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', price: 280000 },
  { name: 'Áo sơ mi nữ tay bồng', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80', price: 190000 },
  { name: 'Chân váy chữ A xếp ly', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1583496661160-c5dcb4c65887?w=800&q=80', price: 160000 },
  { name: 'Quần jean ống rộng nữ', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80', price: 320000 },
  { name: 'Áo thun croptop nữ', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80', price: 110000 },
  { name: 'Đầm dạ hội nữ sang trọng', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1566160983935-d224d081f9b3?w=800&q=80', price: 550000 },
  { name: 'Áo blazer nữ công sở', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=800&q=80', price: 420000 },
  { name: 'Quần kaki nữ ống suông', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80', price: 250000 },
  { name: 'Chân váy midi vintage', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80', price: 210000 },
  { name: 'Áo khoác len cardigan', categoryName: 'Thời trang nữ', image: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=800&q=80', price: 290000 },

  // Phụ kiện điện thoại
  { name: 'Ốp lưng trong suốt chống sốc', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800&q=80', price: 50000 },
  { name: 'Sạc dự phòng 10000mAh', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80', price: 350000 },
  { name: 'Cáp sạc Type-C bọc dù', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80', price: 80000 },
  { name: 'Giá đỡ điện thoại hợp kim', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80', price: 120000 },
  { name: 'Tai nghe Bluetooth TWS', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', price: 450000 },
  { name: 'Kính cường lực chống nhìn trộm', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80', price: 90000 },
  { name: 'Củ sạc nhanh 20W', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80', price: 150000 },
  { name: 'Giá kẹp điện thoại ô tô', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1616422285623-11fcac19f18a?w=800&q=80', price: 180000 },
  { name: 'Dây đeo điện thoại thời trang', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=800&q=80', price: 45000 },
  { name: 'Loa Bluetooth mini', categoryName: 'Phụ kiện điện thoại', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', price: 250000 },

  // Balo & Túi xách
  { name: 'Balo laptop chống nước', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', price: 400000 },
  { name: 'Túi đeo chéo nam thể thao', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1547949007-5392a1125298?w=800&q=80', price: 180000 },
  { name: 'Túi xách nữ da PU', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', price: 350000 },
  { name: 'Ví da nam gập đôi', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', price: 250000 },
  { name: 'Balo mini nữ thời trang', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&q=80', price: 220000 },
  { name: 'Túi tote vải canvas', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1597633244018-b217ab2a02e6?w=800&q=80', price: 120000 },
  { name: 'Cặp da công sở nam', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', price: 550000 },
  { name: 'Túi du lịch sức chứa lớn', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', price: 380000 },
  { name: 'Ví cầm tay nữ đính đá', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=800&q=80', price: 280000 },
  { name: 'Balo máy ảnh chuyên nghiệp', categoryName: 'Balo & Túi xách', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80', price: 650000 },

  // Đồng hồ & Trang sức
  { name: 'Đồng hồ Casio dây thép', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', price: 850000 },
  { name: 'Dây chuyền bạc đính đá', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1599643478524-fb524b056345?w=800&q=80', price: 300000 },
  { name: 'Đồng hồ nữ dây kim loại', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1584208124888-3a20b9c799e2?w=800&q=80', price: 750000 },
  { name: 'Bông tai bạc ngọc trai', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', price: 150000 },
  { name: 'Lắc tay nam mắt xích', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', price: 200000 },
  { name: 'Đồng hồ thông minh thể thao', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80', price: 1250000 },
  { name: 'Nhẫn bạc nữ cỏ 4 lá', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1605100804763-247f67b8548e?w=800&q=80', price: 180000 },
  { name: 'Đồng hồ cơ nam lộ máy', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80', price: 2500000 },
  { name: 'Bộ trang sức bạc cao cấp', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', price: 850000 },
  { name: 'Vòng phong thủy đá tự nhiên', categoryName: 'Đồng hồ & Trang sức', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', price: 350000 }
];

const mockProducts: any[] = [];

// Insert the 50 unique products
realisticProducts.forEach((p) => {
  const discount = Math.floor(Math.random() * 30) + 5;
  mockProducts.push({
    name: p.name,
    price: p.price,
    price_before_discount: Math.floor(p.price * (1 + discount / 100)),
    rating: Number((Math.random() * (5 - 4.0) + 4.0).toFixed(1)),
    quantity: Math.floor(Math.random() * 500) + 50,
    sold: Math.floor(Math.random() * 2000) + 100,
    view: Math.floor(Math.random() * 5000) + 500,
    categoryName: p.categoryName,
    image: p.image
  });
});


const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopee-clone';
    await mongoose.connect(uri);
    console.log('Connected to DB');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    
    const hashed = await bcrypt.hash('123456', 10);
    const user = new User({ email: 'admin@shopee.com', password: hashed, roles: ['Admin', 'User'] });
    await user.save();
    console.log('Created admin user: admin@shopee.com / 123456');

    // Create Categories
    const insertedCategories = await Category.insertMany(categoriesData);
    const categoryMap = insertedCategories.reduce((map, cat) => {
      map[cat.name] = cat._id;
      return map;
    }, {} as Record<string, mongoose.Types.ObjectId>);
    console.log('Created categories');

    // Create Products
    const productsToInsert = mockProducts.map(p => ({
      ...p,
      category: categoryMap[p.categoryName],
      images: [p.image]
    }));

    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`Created ${insertedProducts.length} products`);

    // Create Promotions
    const Promotion = require('./models/Promotion').default;
    await Promotion.deleteMany({});
    
    const now = new Date();
    const end_time = new Date();
    end_time.setHours(end_time.getHours() + 24);

    const promotionsToInsert = insertedProducts.slice(0, 15).map((p: any) => {
      const pDiscount = Math.floor(Math.random() * 30) + 10;
      return {
        product: p._id,
        discount_percent: pDiscount,
        original_price: p.price_before_discount || p.price,
        flash_price: Math.floor(p.price * (1 - pDiscount / 100)),
        start_time: now,
        end_time: end_time
      };
    });

    await Promotion.insertMany(promotionsToInsert);
    console.log(`Created ${promotionsToInsert.length} promotions`);

    console.log('Seed done!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
