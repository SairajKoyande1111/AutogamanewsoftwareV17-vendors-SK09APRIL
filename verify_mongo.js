
import mongoose from 'mongoose';
import { connectDB } from './server/db.js';
import { ServiceMasterModel, PPFMasterModel, AccessoryMasterModel, AccessoryCategoryModel } from './server/storage.js';

async function verify() {
  await connectDB();
  console.log('--- SERVICES ---');
  const services = await ServiceMasterModel.find().lean();
  console.log(JSON.stringify(services, null, 2));

  console.log('\n--- PPF ---');
  const ppfs = await PPFMasterModel.find().lean();
  console.log(JSON.stringify(ppfs, null, 2));

  console.log('\n--- ACCESSORIES ---');
  const accessories = await AccessoryMasterModel.find().lean();
  console.log(JSON.stringify(accessories, null, 2));

  console.log('\n--- ACCESSORY CATEGORIES ---');
  const categories = await AccessoryCategoryModel.find().lean();
  console.log(JSON.stringify(categories, null, 2));

  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
