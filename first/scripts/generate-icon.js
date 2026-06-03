const sharp = require('sharp')

const SIZE = 144
const svg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#4f46e5"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#818cf8"/>
      <stop offset="100%" style="stop-color:#3730a3"/>
    </linearGradient>
  </defs>

  <!-- 圆角矩形背景 -->
  <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="32" fill="url(#bg)"/>

  <!-- 顶部光晕 -->
  <ellipse cx="72" cy="20" rx="50" ry="35" fill="url(#shine)" opacity="0.3"/>

  <!-- 闪电/响应图标 -->
  <g transform="translate(72,38)" fill="white" opacity="0.95">
    <polygon points="-8,-16 4,-2 -2,-2 8,16 -4,0 2,0"/>
  </g>

  <!-- 主文字 3XL -->
  <text x="72" y="100" text-anchor="middle"
        font-family="Arial,Helvetica,sans-serif"
        font-weight="900" font-size="38" fill="white"
        letter-spacing="2">3XL</text>

  <!-- 底部小字 -->
  <text x="72" y="126" text-anchor="middle"
        font-family="Arial,Helvetica,sans-serif"
        font-weight="600" font-size="11" fill="rgba(255,255,255,0.75)"
        letter-spacing="3">&#x56DE;&#x5E94;</text>
</svg>`

sharp(Buffer.from(svg))
  .png()
  .toFile('d:/first-cc/miniapp/icon.png')
  .then(() => console.log('Icon generated: d:/first-cc/miniapp/icon.png (144x144)'))
  .catch(err => console.error('Error:', err))
