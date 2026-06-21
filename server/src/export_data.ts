import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const exportDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shopee-clone');
    console.log('Connected to DB...');
    
    const collections = await mongoose.connection.db.collections();
    const backupData: Record<string, any> = {};
    
    for (let collection of collections) {
      const data = await collection.find({}).toArray();
      backupData[collection.collectionName] = data;
      console.log(`Exported ${data.length} documents from ${collection.collectionName}`);
    }
    
    const backupPath = path.join(__dirname, '../../database_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`\n✅ THÀNH CÔNG! Toàn bộ Database đã được đóng gói vào file: database_backup.json (ở ngoài cùng thư mục dự án).`);
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
};

exportDB();
