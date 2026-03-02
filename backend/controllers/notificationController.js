const { Notification } = require('../models');

exports.getNotifications = async (req, res) => {
  const { isRead, limit = 20 } = req.query;
  const where = {};
  if (isRead !== undefined) where.isRead = isRead === 'true';
  const notifications = await Notification.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
  });
  res.json({ success: true, data: notifications });
};

exports.markRead = async (req, res) => {
  await Notification.update({ isRead: true }, { where: { id: req.params.id } });
  res.json({ success: true, message: 'Marked as read.' });
};

exports.markAllRead = async (req, res) => {
  await Notification.update({ isRead: true }, { where: { isRead: false } });
  res.json({ success: true, message: 'All notifications marked as read.' });
};

exports.getUnreadCount = async (req, res) => {
  const count = await Notification.count({ where: { isRead: false } });
  res.json({ success: true, count });
};
