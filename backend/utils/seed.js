require('dotenv').config();
const bcrypt = require('bcryptjs');
const { syncDatabase, User, Underwriter, Client } = require('../models');

const seed = async () => {
  await syncDatabase();

  const adminExists = await User.findOne({ where: { email: 'admin@hermliz.com' } });
  if (!adminExists) {
    await User.create({
      name: 'Herman Oluoch',
      email: 'admin@hermliz.com',
      phone: '0752555679',
      password: 'Admin@1234',
      role: 'broker_admin',
    });
    console.log('✅ Admin user created: admin@hermliz.com / Admin@1234');
  }

  const underwriters = [
    { name: 'APA Insurance', shortName: 'APA', contactPerson: 'APA Contact', contactPhone: '0700000001', defaultCommissionRate: 12.50 },
    { name: 'Britam Insurance', shortName: 'BRITAM', contactPerson: 'Britam Contact', contactPhone: '0700000002', defaultCommissionRate: 12.00 },
    { name: 'CIC Insurance', shortName: 'CIC', contactPerson: 'CIC Contact', contactPhone: '0700000003', defaultCommissionRate: 11.00 },
    { name: 'Jubilee Insurance', shortName: 'JUBILEE', contactPerson: 'Jubilee Contact', contactPhone: '0700000004', defaultCommissionRate: 12.50 },
    { name: 'AAR Insurance', shortName: 'AAR', contactPerson: 'AAR Contact', contactPhone: '0700000005', defaultCommissionRate: 10.00 },
    { name: 'Kenya Orient', shortName: 'KORIENT', contactPerson: 'KO Contact', contactPhone: '0700000006', defaultCommissionRate: 11.50 },
    { name: 'Madison Insurance', shortName: 'MADISON', contactPerson: 'Madison Contact', contactPhone: '0700000007', defaultCommissionRate: 12.00 },
    { name: 'Sanlam Insurance', shortName: 'SANLAM', contactPerson: 'Sanlam Contact', contactPhone: '0700000008', defaultCommissionRate: 11.00 },
    { name: 'Old Mutual', shortName: 'OLDMUTUAL', contactPerson: 'OM Contact', contactPhone: '0700000009', defaultCommissionRate: 10.50 },
    { name: 'GA Insurance', shortName: 'GA', contactPerson: 'GA Contact', contactPhone: '0700000010', defaultCommissionRate: 11.00 },
  ];

  for (const uw of underwriters) {
    await Underwriter.findOrCreate({ where: { shortName: uw.shortName }, defaults: uw });
  }
  console.log('✅ Underwriters seeded.');

  const demoClient = await Client.findOne({ where: { nationalId: '12345678' } });
  if (!demoClient) {
    await Client.create({
      fullName: 'John Demo Client',
      nationalId: '12345678',
      phone: '0712345678',
      email: 'demo@client.com',
      address: 'Bondo, Siaya',
      occupation: 'Farmer',
    });
    console.log('✅ Demo client created.');
  }

  console.log('\n🎉 Seed completed! Login: admin@hermliz.com / Admin@1234\n');
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
