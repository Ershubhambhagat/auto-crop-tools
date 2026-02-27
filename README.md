# Auto Crop Photo Tool

A free, browser-based auto-crop tool for documents, receipts, and photos. All processing happens locally - no data leaves your device.

## Features

- **Auto Edge Detection**: Uses OpenCV.js to automatically detect document edges
- **Perspective Correction**: Straightens photos taken at angles
- **Manual Adjustment**: Drag corners to fine-tune crop area
- **Camera Capture**: Take photos directly from your device camera
- **Image Upload**: Support for JPG, PNG, and WEBP formats
- **Auto Download**: Cropped images automatically download
- **100% Private**: All processing is client-side, no server uploads
- **Mobile Responsive**: Works on phones, tablets, and desktops
- **Works Offline**: After initial load, works without internet

## Demo

Open `index.html` in a modern browser or deploy to any static hosting service.

## Deployment

### Option 1: GitHub Pages (Recommended)

1. Create a new GitHub repository
2. Upload all files (`index.html`, `styles.css`, `app.js`, `README.md`)
3. Go to repository Settings > Pages
4. Select "Deploy from a branch"
5. Choose `main` branch and `/ (root)` folder
6. Click Save
7. Your site will be available at `https://yourusername.github.io/repo-name`

### Option 2: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project folder
3. Run `vercel`
4. Follow prompts to deploy
5. Or connect your GitHub repo at [vercel.com](https://vercel.com)

### Option 3: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the project folder to deploy
3. Or connect your GitHub repo for automatic deployments

### Option 4: Local Use

Simply open `index.html` in any modern browser. Note that camera functionality requires HTTPS or localhost.

## Technical Details

### Tech Stack
- Pure HTML5, CSS3, JavaScript (ES6+)
- OpenCV.js 4.9.0 for edge detection
- No build tools required
- No backend dependencies

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

### Edge Detection Algorithm

1. Convert image to grayscale
2. Apply Gaussian blur to reduce noise
3. Use adaptive thresholding for varying lighting conditions
4. Apply Canny edge detection
5. Dilate edges to close gaps
6. Find contours and identify largest quadrilateral
7. Order corners and apply perspective transform

### Privacy

- No data is sent to any server
- No analytics or tracking
- No cookies or local storage of images
- All processing happens in your browser

## Files

```
auto-crop-tool/
├── index.html    # Main HTML structure
├── styles.css    # All styling
├── app.js        # Application logic
└── README.md     # This file
```

## Usage

1. Open the app in a browser
2. Choose "Upload Photo" or "Take Photo"
3. Wait for automatic edge detection
4. Adjust corners by dragging if needed
5. Click "Confirm Crop"
6. Image downloads automatically
7. Click "Crop Another Photo" to continue

## Troubleshooting

**Camera not working:**
- Ensure you've granted camera permissions
- Use HTTPS or localhost (required for camera access)
- Try a different browser

**Edge detection not working:**
- OpenCV.js may still be loading (wait a few seconds)
- For complex backgrounds, use manual adjustment

**Slow performance:**
- Large images may take longer to process
- Try reducing image size before upload

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

Contributions welcome! Please open an issue or pull request.
