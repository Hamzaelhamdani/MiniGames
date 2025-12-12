# How to Play Pong on Your Phone

## Quick Start Guide

### Option 1: Local Network (Easiest for Testing)

1. **Find your computer's IP address:**
   - Windows: Open Command Prompt and type `ipconfig`
   - Look for "IPv4 Address" (usually starts with 192.168.x.x)

2. **Start a local web server:**
   ```powershell
   # In the miniprogram-2 folder, run:
   python -m http.server 8000
   # OR if you have Node.js:
   npx http-server -p 8000
   ```

3. **On your phone:**
   - Connect to the same WiFi network as your computer
   - Open your phone's browser
   - Go to: `http://YOUR_IP_ADDRESS:8000`
   - Example: `http://192.168.1.100:8000`

### Option 2: Deploy to a Web Host

Upload the three files to any web hosting service:
- **GitHub Pages** (free)
- **Netlify** (free)
- **Vercel** (free)

Then access the URL from your phone's browser.

### Option 3: Direct File Access (Limited)

Some mobile browsers allow opening local HTML files directly, but this varies by device and browser.

---

## Mobile Controls

Once the game loads on your phone:

- **Touch controls** will automatically appear at the bottom of the game screen
- **Left side buttons** (white): Control the left paddle
- **Right side buttons** (orange): Control the right paddle
- Tap **▲** to move paddle up
- Tap **▼** to move paddle down

---

## Tips for Best Mobile Experience

- Use **portrait mode** for optimal layout
- Ensure your phone screen is at least 360px wide
- Use a modern browser (Chrome, Safari, Firefox)
- Touch controls work in both AI and Friend modes
- For Friend mode, two players can use the same phone!

---

## Troubleshooting

**Touch controls not appearing?**
- Make sure your screen width is 768px or less
- Try refreshing the page
- Check that JavaScript is enabled

**Game running slow?**
- Close other browser tabs
- Restart your browser
- Try a different browser

**Can't connect via local network?**
- Verify both devices are on the same WiFi
- Check your computer's firewall settings
- Make sure the web server is running
