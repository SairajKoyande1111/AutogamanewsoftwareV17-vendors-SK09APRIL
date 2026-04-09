import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const AccessoryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const AccessoryCategory = mongoose.models.AccessoryCategory || mongoose.model('AccessoryCategory', AccessoryCategorySchema);

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const toDelete = ["hello", "hwqdh"];
    const result = await AccessoryCategory.deleteMany({ name: { $in: toDelete } });
    console.log(`Deleted ${result.deletedCount} categories:`, toDelete);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

cleanup();
