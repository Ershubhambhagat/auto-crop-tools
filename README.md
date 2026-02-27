# Auto Crop Photo Tool

A free, browser-based auto-crop tool for documents, receipts, and photos. **100% client-side** - no data leaves your device. Fast, private, and works offline.

## Features

### Core Features
- **Auto Edge Detection** - OpenCV.js automatically detects document edges
- **Perspective Correction** - Straightens photos taken at angles
- **Manual Corner Adjustment** - Drag corners to fine-tune
- **Camera Capture** - Take photos directly with flash & brightness controls

### New Features
- **Image Rotation** - Rotate 90° left/right (keyboard: R)
- **Zoom & Pan** - Pinch-to-zoom or use +/- buttons for precise editing
- **Grid Overlay** - Rule of thirds grid (keyboard: G)
- **Aspect Ratio Presets** - A4, Letter, Square, ID Card, Passport, 4:3, 16:9
- **Undo/Redo** - Undo corner adjustments (Ctrl+Z / Ctrl+Y)
- **Batch Mode** - Process multiple images in sequence
- **Custom Output Size** - Set exact width/height in pixels
- **Export Formats** - JPG, PNG, or PDF output
- **Quality Control** - Adjust JPG compression quality
- **Edge Sharpening** - Enhance edges after cropping
- **Auto Enhance** - Automatic brightness/contrast optimization
- **Progress Indicator** - Loading progress with percentage
- **Haptic Feedback** - Vibration feedback on mobile
- **Sound Effects** - Audio feedback (toggleable)
- **Keyboard Shortcuts** - Full keyboard support

### Privacy & Performance
- **100% Private** - All processing happens in your browser
- **No Server** - No uploads, no APIs, no tracking
- **Works Offline** - After initial load, works without internet
- **Fast** - Optimized for quick processing

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Rotate right |
| Shift+R | Rotate left |
| G | Toggle grid |
| + | Zoom in |
| - | Zoom out |
| 0 | Reset zoom |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Enter | Confirm crop |

## Deployment

### GitHub Pages (Free)
1. Create a new GitHub repository
2. Upload all files
3. Go to Settings → Pages
4. Select "Deploy from main branch"
5. Your site will be at `https://yourusername.github.io/repo-name`

### Vercel (Free)
```bash
npx vercel
```

### Netlify (Free)
Drag and drop the project folder at [netlify.com](https://netlify.com)

### Local Development
```bash
npx serve .
```
Or simply open `index.html` in a browser.

## Technical Details

### Tech Stack
- Pure HTML5, CSS3, JavaScript (ES6+)
- OpenCV.js 4.9.0 for edge detection
- jsPDF for PDF export
- Web Audio API for sound
- Vibration API for haptics
- No build tools required

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

### External Dependencies (Free CDN)
- OpenCV.js - Edge detection
- jsPDF - PDF export

## Files

```
auto-crop-tool/
├── index.html     # Main HTML (22KB)
├── styles.css     # All styling (20KB)
├── app.js         # Application logic (52KB)
├── package.json   # For dev server
├── vercel.json    # Vercel config
├── .gitignore     # Git ignore
└── README.md      # This file
```

## Usage Flow

1. **Upload or Capture** - Choose photo or use camera
2. **Auto Detection** - Edges detected automatically
3. **Adjust** - Rotate, zoom, drag corners
4. **Preview** - Set size, format, enhancements
5. **Download** - Save as JPG, PNG, or PDF

## License

MIT License - Free for personal and commercial use.
