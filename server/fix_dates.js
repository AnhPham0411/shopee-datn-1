const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopee-clone').then(async () => {
  const db = mongoose.connection.db;
  
  const collections = ['orders', 'users', 'products', 'stores', 'categories', 'vouchers', 'reviews'];
  for (const collName of collections) {
    try {
      const coll = db.collection(collName);
      const docs = await coll.find({}).toArray();
      let updated = 0;
      for (const doc of docs) {
        let needsUpdate = false;
        const updateDoc = {};
        
        if (typeof doc.createdAt === 'string') {
          updateDoc.createdAt = new Date(doc.createdAt);
          needsUpdate = true;
        }
        if (typeof doc.updatedAt === 'string') {
          updateDoc.updatedAt = new Date(doc.updatedAt);
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await coll.updateOne({ _id: doc._id }, { $set: updateDoc });
          updated++;
        }
      }
      console.log(`Updated ${updated} documents in ${collName}`);
    } catch(e) {
      console.log('Skipping', collName);
    }
  }
  
  process.exit(0);
});
