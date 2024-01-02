import mongoose from 'mongoose';

const init = async (): Promise<mongoose.Connection | undefined> => {
  const { MONGO_URI } = process.env;

  console.log('MONGO_URI ', MONGO_URI);

  if (!MONGO_URI) {
    return;
  }

  mongoose.set('strictQuery', false);
  // Mongoose doesn't validatre on update by default, this enables it
  mongoose.set('runValidators', true);
  await mongoose.connect(MONGO_URI);
  mongoose.Promise = global.Promise;

  const db = mongoose.connection;

  db.on('error', () => {
    console.error('[MONGODB] connection error');
  });

  db.once('open', () => {
    console.log('[MONGODB] Connected');
  });

  return db;
};

export default init;
