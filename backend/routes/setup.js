const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Underwriter, Client } = require('../models');

router.get('/seed', async (req, res) => {
  try {
    // Check secret key to prevent abuse
    if (req.query.key !== 'hermliz_seed_2024') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const results = [];

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@hermliz.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Herman Oluoch',
        email: 'admin@hermliz.com',
        phone: '0752555679',
        password: 'Admin@1234',
        role: 'broker_admin',
      });
      results.push('✅ Admin user created');
    } else {
      // Force reset password in case it was wrong
      const hashed = await bcrypt.hash('Admin@1234', 12);
      await adminExists.update({ password: hashed });
      results.push('✅ Admin password reset');
    }

    // Seed underwriters
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
    results.push('✅ Underwriters seeded (10)');

    // Create demo client
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
      results.push('✅ Demo client created');
    }

    res.json({
      success: true,
      message: '🎉 Seed completed!',
      results,
      credentials: {
        email: 'admin@hermliz.com',
        password: 'Admin@1234'
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
