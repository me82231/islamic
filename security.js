/**
 * Security Middleware
 * Rate limiting, input sanitization, and security headers
 */

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate-limiting library
 */
export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }
  
  // Get or create rate limit data for this IP
  const rateData = rateLimitMap.get(ip) || { count: 0, timestamp: now };
  
  // Reset if window expired
  if (now - rateData.timestamp > RATE_LIMIT_WINDOW) {
    rateData.count = 0;
    rateData.timestamp = now;
  }
  
  // Check limit
  if (rateData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }
  
  // Increment counter
  rateData.count++;
  rateLimitMap.set(ip, rateData);
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', RATE_LIMIT_MAX_REQUESTS - rateData.count);
  res.setHeader('X-RateLimit-Reset', rateData.timestamp + RATE_LIMIT_WINDOW);
  
  next();
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(req, res, next) {
  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.query) {
    sanitizeObject(req.query);
  }
  if (req.params) {
    sanitizeObject(req.params);
  }
  next();
}

function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potentially dangerous characters
      obj[key] = obj[key]
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

/**
 * Security headers middleware
 */
export function securityHeaders(req, res, next) {
  // Restrict CORS to localhost in development
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ];
  
  if (process.env.NODE_ENV === 'production') {
    // In production, only allow configured origin
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    // In development, allow localhost
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Don't expose server information
  res.removeHeader('X-Powered-By');
  
  next();
}

/**
 * Stricter rate limiting for translation endpoints
 */
export function translationRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const key = `translate:${ip}`;
  const rateData = rateLimitMap.get(key) || { count: 0, timestamp: now };
  
  // Stricter limits for translations: 20 per minute
  const TRANSLATION_LIMIT = 20;
  const TRANSLATION_WINDOW = 60000;
  
  if (now - rateData.timestamp > TRANSLATION_WINDOW) {
    rateData.count = 0;
    rateData.timestamp = now;
  }
  
  if (rateData.count >= TRANSLATION_LIMIT) {
    return res.status(429).json({
      success: false,
      message: 'Translation rate limit exceeded. Please wait a moment.'
    });
  }
  
  rateData.count++;
  rateLimitMap.set(key, rateData);
  
  next();
}
