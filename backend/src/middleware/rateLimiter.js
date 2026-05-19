const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => req.user?.id ? `user_${req.user.id}` : ipKeyGenerator(req, res),
  message: { error: 'AI rate limit exceeded. Maximum 20 AI requests per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter };
