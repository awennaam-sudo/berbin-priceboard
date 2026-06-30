require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initDB() {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await prisma.admin.create({
        data: { username: 'admin', password: hashed }
      });
      console.log('Default admin created: username=admin password=admin123');
    }
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

initDB();

module.exports = prisma;
