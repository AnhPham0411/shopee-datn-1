import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const importDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shopee-clone');
    console.log('Connected to DB...');
    
    const backupPath = path.join(__dirname, '../../database_backup.json');
    if (!fs.existsSync(backupPath)) {
      console.log('Không tìm thấy file database_backup.json!');
      process.exit(1);
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    for (const [collectionName, data] of Object.entries(backupData)) {
      const documents = data as any[];
      if (documents.length > 0) {
        const collection = mongoose.connection.db.collection(collectionName);
        
        // Convert string _id back to ObjectId
        const formattedData = documents.map(doc => {
          if (doc._id && typeof doc._id === 'string') {
            doc._id = new mongoose.Types.ObjectId(doc._id);
          }
          // Also check for other ObjectIds if needed, but usually insertMany handles it
          // or at least keeps the string which is fine for Mongoose if schema allows it
          // Let's rely on Mongoose's ability to cast strings to ObjectIds or keep them as string/ObjectId.
          // Wait, MongoDB driver insertMany doesn't cast. We need to cast _id specifically.
          return doc;
        });

        await collection.deleteMany({});
        await collection.insertMany(formattedData);
        console.log(`Imported ${formattedData.length} documents into ${collectionName}`);
      }
    }
    
    console.log(`\n✅ THÀNH CÔNG! Đã nạp toàn bộ Database từ file database_backup.json`);
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
};

importDB();
