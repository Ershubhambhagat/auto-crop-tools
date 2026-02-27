/**
 * Auto Crop Photo Tool
 * A browser-based document/photo cropping tool with automatic edge detection
 */

// Global state
const state = {
    cvReady: false,
    currentImage: null,
    originalImageData: null,
    cropCorners: [], // [topLeft, topRight, bottomRight, bottomLeft]
    canvasOffset: { x: 0, y: 0 },
    scale: 1,
    activeHandle: null,
    cameraStream: null,
    facingMode: 'environment'
};

// DOM Elements
const elements = {};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Cache DOM elements
    elements.landingScreen = document.getElementById('landing-screen');
    elements.cameraScreen = document.getElementById('camera-screen');
    elements.editorScreen = document.getElementById('editor-screen');
    elements.resultScreen = document.getElementById('result-screen');
    elements.errorModal = document.getElementById('error-modal');

    elements.uploadBtn = document.getElementById('upload-btn');
    elements.cameraBtn = document.getElementById('camera-btn');
    elements.fileInput = document.getElementById('file-input');

    elements.cameraVideo = document.getElementById('camera-video');
    elements.cameraCapture = document.getElementById('camera-capture');
    elements.cameraCancel = document.getElementById('camera-cancel');
    elements.cameraSwitch = document.getElementById('camera-switch');

    elements.editorCanvas = document.getElementById('editor-canvas');
    elements.editorBack = document.getElementById('editor-back');
    elements.editorReset = document.getElementById('editor-reset');
    elements.confirmCrop = document.getElementById('confirm-crop');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.detectionStatus = document.getElementById('detection-status');

    elements.cropSvg = document.getElementById('crop-svg');
    elements.cropPolygon = document.getElementById('crop-polygon');
    elements.cropHandles = [
        document.getElementById('crop-handle-0'),
        document.getElementById('crop-handle-1'),
        document.getElementById('crop-handle-2'),
        document.getElementById('crop-handle-3')
    ];
    elements.cropLines = [
        document.getElementById('crop-line-0'),
        document.getElementById('crop-line-1'),
        document.getElementById('crop-line-2'),
        document.getElementById('crop-line-3')
    ];

    elements.resultCanvas = document.getElementById('result-canvas');
    elements.resultInfo = document.getElementById('result-info');
    elements.downloadAgain = document.getElementById('download-again');
    elements.cropAnother = document.getElementById('crop-another');

    elements.errorMessage = document.getElementById('error-message');
    elements.errorClose = document.getElementById('error-close');

    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Landing screen
    elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
    elements.cameraBtn.addEventListener('click', startCamera);
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Camera screen
    elements.cameraCapture.addEventListener('click', capturePhoto);
    elements.cameraCancel.addEventListener('click', stopCamera);
    elements.cameraSwitch.addEventListener('click', switchCamera);

    // Editor screen
    elements.editorBack.addEventListener('click', goToLanding);
    elements.editorReset.addEventListener('click', resetCropArea);
    elements.confirmCrop.addEventListener('click', performCrop);

    // Crop handles - touch and mouse events
    elements.cropHandles.forEach((handle, index) => {
        handle.addEventListener('mousedown', (e) => startDrag(e, index));
        handle.addEventListener('touchstart', (e) => startDrag(e, index), { passive: false });
    });

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Result screen
    elements.downloadAgain.addEventListener('click', downloadResult);
    elements.cropAnother.addEventListener('click', goToLanding);

    // Error modal
    elements.errorClose.addEventListener('click', closeError);

    // Window resize
    window.addEventListener('resize', handleResize);
}

// OpenCV Ready callback (called from HTML)
window.onOpenCvReady = function() {
    state.cvReady = true;
    console.log('OpenCV.js is ready');
};

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goToLanding() {
    stopCamera();
    showScreen('landing-screen');
    state.currentImage = null;
    state.originalImageData = null;
}

// Error handling
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.classList.add('active');
}

function closeError() {
    elements.errorModal.classList.remove('active');
}

// File upload handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        showError('Please select a valid image file (JPG, PNG, or WEBP)');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        loadImage(event.target.result);
    };
    reader.onerror = () => {
        showError('Failed to read the file. Please try again.');
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
}

// Camera handling
async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: state.facingMode,
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };

        state.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        elements.cameraVideo.srcObject = state.cameraStream;
        showScreen('camera-screen');
    } catch (err) {
        console.error('Camera error:', err);
        if (err.name === 'NotAllowedError') {
            showError('Camera access was denied. Please allow camera access and try again.');
        } else if (err.name === 'NotFoundError') {
            showError('No camera found on this device.');
        } else {
            showError('Failed to access camera. Please try uploading a photo instead.');
        }
    }
}

function stopCamera() {
    if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(track => track.stop());
        state.cameraStream = null;
    }
    elements.cameraVideo.srcObject = null;
    showScreen('landing-screen');
}

async function switchCamera() {
    state.facingMode = state.facingMode === 'environment' ? 'user' : 'environment';
    if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(track => track.stop());
    }
    await startCamera();
}

function capturePhoto() {
    const video = elements.cameraVideo;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    stopCamera();
    loadImage(canvas.toDataURL('image/jpeg', 0.95));
}

// Image loading and processing
function loadImage(dataUrl) {
    const img = new Image();
    img.onload = () => {
        state.currentImage = img;
        showScreen('editor-screen');
        setupEditor();

        if (state.cvReady) {
            detectEdges();
        } else {
            // Wait for OpenCV to be ready
            elements.loadingOverlay.classList.add('active');
            elements.detectionStatus.textContent = 'Loading edge detection...';

            const checkReady = setInterval(() => {
                if (state.cvReady) {
                    clearInterval(checkReady);
                    detectEdges();
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkReady);
                if (!state.cvReady) {
                    elements.loadingOverlay.classList.remove('active');
                    setDefaultCropArea();
                    elements.detectionStatus.textContent = 'Edge detection unavailable - manual adjustment only';
                    elements.detectionStatus.className = 'detection-status warning';
                }
            }, 10000);
        }
    };
    img.onerror = () => {
        showError('Failed to load the image. Please try again.');
        goToLanding();
    };
    img.src = dataUrl;
}

function setupEditor() {
    const canvas = elements.editorCanvas;
    const container = canvas.parentElement;
    const img = state.currentImage;

    // Calculate scale to fit image in container
    const containerRect = container.getBoundingClientRect();
    const maxWidth = containerRect.width;
    const maxHeight = containerRect.height;

    const scaleX = maxWidth / img.width;
    const scaleY = maxHeight / img.height;
    state.scale = Math.min(scaleX, scaleY, 1);

    canvas.width = img.width * state.scale;
    canvas.height = img.height * state.scale;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Store original image data
    state.originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Calculate canvas offset in container
    updateCanvasOffset();
}

function updateCanvasOffset() {
    const canvas = elements.editorCanvas;
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    state.canvasOffset = {
        x: canvasRect.left - containerRect.left,
        y: canvasRect.top - containerRect.top
    };
}

function handleResize() {
    if (state.currentImage) {
        setupEditor();
        if (state.cropCorners.length === 4) {
            updateCropOverlay();
        }
    }
}

// Edge detection using OpenCV
function detectEdges() {
    elements.loadingOverlay.classList.add('active');

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            const result = findDocumentContour();

            if (result && result.length === 4) {
                state.cropCorners = result;
                elements.detectionStatus.textContent = 'Document detected - adjust corners if needed';
                elements.detectionStatus.className = 'detection-status success';
            } else {
                setDefaultCropArea();
                elements.detectionStatus.textContent = 'No clear document found - adjust corners manually';
                elements.detectionStatus.className = 'detection-status warning';
            }

            updateCropOverlay();
        } catch (err) {
            console.error('Edge detection error:', err);
            setDefaultCropArea();
            elements.detectionStatus.textContent = 'Detection error - adjust corners manually';
            elements.detectionStatus.className = 'detection-status warning';
            updateCropOverlay();
        }

        elements.loadingOverlay.classList.remove('active');
    }, 100);
}

function findDocumentContour() {
    const canvas = elements.editorCanvas;

    // Read image from canvas
    let src = cv.imread(canvas);
    let gray = new cv.Mat();

    try {
        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Try multiple detection methods for robustness
        const methods = [
            () => detectWithCanny(gray, 75, 200),      // Standard Canny
            () => detectWithCanny(gray, 50, 150),      // Lower thresholds
            () => detectWithCanny(gray, 30, 100),      // Even lower for low contrast
            () => detectWithAdaptiveThreshold(gray),   // Adaptive threshold
            () => detectWithMorphology(gray),          // Morphological operations
            () => detectWithColorEdges(src)            // Color-based edge detection
        ];

        for (const method of methods) {
            const result = method();
            if (result) {
                return result;
            }
        }

        return null;

    } finally {
        src.delete();
        gray.delete();
    }
}

// Method 1: Canny edge detection with given thresholds
function detectWithCanny(gray, lowThresh, highThresh) {
    let blurred = new cv.Mat();
    let edges = new cv.Mat();
    let dilated = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        // Apply bilateral filter to reduce noise while preserving edges
        cv.bilateralFilter(gray, blurred, 9, 75, 75);

        // Apply Canny edge detection
        cv.Canny(blurred, edges, lowThresh, highThresh);

        // Dilate edges to close gaps
        let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
        cv.dilate(edges, dilated, kernel, new cv.Point(-1, -1), 2);
        kernel.delete();

        // Find contours
        cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        return findBestQuadrilateral(contours, gray.cols, gray.rows);

    } finally {
        blurred.delete();
        edges.delete();
        dilated.delete();
        contours.delete();
        hierarchy.delete();
    }
}

// Method 2: Adaptive threshold for varying lighting conditions
function detectWithAdaptiveThreshold(gray) {
    let blurred = new cv.Mat();
    let thresh = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        // Adaptive threshold handles varying lighting
        cv.adaptiveThreshold(blurred, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                            cv.THRESH_BINARY, 11, 2);

        // Invert if document is darker than background
        let inverted = new cv.Mat();
        cv.bitwise_not(thresh, inverted);

        cv.findContours(thresh, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
        let result = findBestQuadrilateral(contours, gray.cols, gray.rows);

        if (!result) {
            contours.delete();
            hierarchy.delete();
            contours = new cv.MatVector();
            hierarchy = new cv.Mat();
            cv.findContours(inverted, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
            result = findBestQuadrilateral(contours, gray.cols, gray.rows);
        }

        inverted.delete();
        return result;

    } finally {
        blurred.delete();
        thresh.delete();
        contours.delete();
        hierarchy.delete();
    }
}

// Method 3: Morphological operations for handling wrinkled/damaged documents
function detectWithMorphology(gray) {
    let blurred = new cv.Mat();
    let edges = new cv.Mat();
    let closed = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        cv.Canny(blurred, edges, 50, 150);

        // Close operation to fill gaps in edges
        let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9));
        cv.morphologyEx(edges, closed, cv.MORPH_CLOSE, kernel);
        kernel.delete();

        cv.findContours(closed, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        return findBestQuadrilateral(contours, gray.cols, gray.rows);

    } finally {
        blurred.delete();
        edges.delete();
        closed.delete();
        contours.delete();
        hierarchy.delete();
    }
}

// Method 4: Color-based edge detection (for colored documents on busy backgrounds)
function detectWithColorEdges(src) {
    let hsv = new cv.Mat();
    let channels = new cv.MatVector();
    let edges = new cv.Mat();
    let combined = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        // Convert to HSV for better color separation
        cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
        let rgb = hsv.clone();
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV);
        rgb.delete();

        cv.split(hsv, channels);

        // Apply Canny on value channel (brightness)
        let blurred = new cv.Mat();
        cv.GaussianBlur(channels.get(2), blurred, new cv.Size(5, 5), 0);
        cv.Canny(blurred, edges, 50, 150);

        // Also try saturation channel
        let satEdges = new cv.Mat();
        let satBlurred = new cv.Mat();
        cv.GaussianBlur(channels.get(1), satBlurred, new cv.Size(5, 5), 0);
        cv.Canny(satBlurred, satEdges, 50, 150);

        // Combine both edge maps
        cv.bitwise_or(edges, satEdges, combined);

        // Dilate to close gaps
        let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
        let dilated = new cv.Mat();
        cv.dilate(combined, dilated, kernel, new cv.Point(-1, -1), 2);
        kernel.delete();

        cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

        blurred.delete();
        satBlurred.delete();
        satEdges.delete();
        dilated.delete();

        return findBestQuadrilateral(contours, src.cols, src.rows);

    } finally {
        hsv.delete();
        for (let i = 0; i < channels.size(); i++) {
            channels.get(i).delete();
        }
        channels.delete();
        edges.delete();
        combined.delete();
        contours.delete();
        hierarchy.delete();
    }
}

// Find the best quadrilateral contour
function findBestQuadrilateral(contours, width, height) {
    let bestContour = null;
    let maxScore = 0;
    const imageArea = width * height;
    const minArea = imageArea * 0.05;  // Minimum 5% of image
    const maxArea = imageArea * 0.98;  // Maximum 98% of image

    for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);

        if (area < minArea || area > maxArea) continue;

        // Approximate contour to polygon
        const peri = cv.arcLength(contour, true);
        const approx = new cv.Mat();
        cv.approxPolyDP(contour, approx, 0.02 * peri, true);

        // Check if it's a quadrilateral
        if (approx.rows === 4) {
            // Score based on area and how rectangular it is
            const score = scoreQuadrilateral(approx, area, imageArea);

            if (score > maxScore) {
                maxScore = score;
                if (bestContour) bestContour.delete();
                bestContour = approx.clone();
            }
        }

        approx.delete();
    }

    if (bestContour && maxScore > 0.1) {
        // Extract corner points
        const points = [];
        for (let i = 0; i < 4; i++) {
            points.push({
                x: bestContour.data32S[i * 2],
                y: bestContour.data32S[i * 2 + 1]
            });
        }
        bestContour.delete();

        return orderPoints(points);
    }

    if (bestContour) bestContour.delete();
    return null;
}

// Score a quadrilateral based on how likely it is to be a document
function scoreQuadrilateral(approx, area, imageArea) {
    // Check if convex
    if (!cv.isContourConvex(approx)) return 0;

    // Get the four corners
    const points = [];
    for (let i = 0; i < 4; i++) {
        points.push({
            x: approx.data32S[i * 2],
            y: approx.data32S[i * 2 + 1]
        });
    }

    // Calculate angles at each corner
    let angleScore = 0;
    for (let i = 0; i < 4; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % 4];
        const p3 = points[(i + 2) % 4];

        const angle = calculateAngle(p1, p2, p3);
        // Ideal angle is 90 degrees, penalize deviation
        const deviation = Math.abs(angle - 90);
        angleScore += Math.max(0, 1 - deviation / 45);
    }
    angleScore /= 4;

    // Area score (prefer larger contours)
    const areaScore = Math.min(area / imageArea, 0.9) / 0.9;

    // Combine scores
    return angleScore * 0.6 + areaScore * 0.4;
}

// Calculate angle at point p2 (in degrees)
function calculateAngle(p1, p2, p3) {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    const cos = dot / (mag1 * mag2);
    return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
}

function orderPoints(points) {
    // Sort by y coordinate
    points.sort((a, b) => a.y - b.y);

    // Top two points
    const top = points.slice(0, 2).sort((a, b) => a.x - b.x);
    // Bottom two points
    const bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);

    // Return in order: top-left, top-right, bottom-right, bottom-left
    return [top[0], top[1], bottom[1], bottom[0]];
}

function setDefaultCropArea() {
    const canvas = elements.editorCanvas;
    const padding = Math.min(canvas.width, canvas.height) * 0.1;

    state.cropCorners = [
        { x: padding, y: padding }, // top-left
        { x: canvas.width - padding, y: padding }, // top-right
        { x: canvas.width - padding, y: canvas.height - padding }, // bottom-right
        { x: padding, y: canvas.height - padding } // bottom-left
    ];
}

function resetCropArea() {
    if (state.cvReady) {
        detectEdges();
    } else {
        setDefaultCropArea();
        updateCropOverlay();
    }
}

// Crop overlay handling
function updateCropOverlay() {
    if (state.cropCorners.length !== 4) return;

    updateCanvasOffset();

    const corners = state.cropCorners;
    const offset = state.canvasOffset;

    // Update polygon
    const pointsStr = corners.map(p =>
        `${p.x + offset.x},${p.y + offset.y}`
    ).join(' ');
    elements.cropPolygon.setAttribute('points', pointsStr);

    // Update handles and lines
    corners.forEach((corner, i) => {
        const x = corner.x + offset.x;
        const y = corner.y + offset.y;

        elements.cropHandles[i].setAttribute('cx', x);
        elements.cropHandles[i].setAttribute('cy', y);

        const nextCorner = corners[(i + 1) % 4];
        elements.cropLines[i].setAttribute('x1', x);
        elements.cropLines[i].setAttribute('y1', y);
        elements.cropLines[i].setAttribute('x2', nextCorner.x + offset.x);
        elements.cropLines[i].setAttribute('y2', nextCorner.y + offset.y);
    });
}

// Drag handling for corner adjustment
function startDrag(e, index) {
    e.preventDefault();
    state.activeHandle = index;
}

function handleDrag(e) {
    if (state.activeHandle === null) return;
    e.preventDefault();

    const container = elements.editorCanvas.parentElement;
    const containerRect = container.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // Calculate position relative to canvas
    const x = clientX - containerRect.left - state.canvasOffset.x;
    const y = clientY - containerRect.top - state.canvasOffset.y;

    // Clamp to canvas bounds
    const canvas = elements.editorCanvas;
    const clampedX = Math.max(0, Math.min(x, canvas.width));
    const clampedY = Math.max(0, Math.min(y, canvas.height));

    state.cropCorners[state.activeHandle] = { x: clampedX, y: clampedY };
    updateCropOverlay();
}

function endDrag() {
    state.activeHandle = null;
}

// Perform crop with perspective correction
function performCrop() {
    if (state.cropCorners.length !== 4) return;

    elements.loadingOverlay.classList.add('active');

    setTimeout(() => {
        try {
            let resultCanvas;

            if (state.cvReady) {
                resultCanvas = cropWithPerspective();
            } else {
                resultCanvas = cropWithoutPerspective();
            }

            // Display result
            const ctx = elements.resultCanvas.getContext('2d');
            elements.resultCanvas.width = resultCanvas.width;
            elements.resultCanvas.height = resultCanvas.height;
            ctx.drawImage(resultCanvas, 0, 0);

            // Auto download
            downloadResult();

            // Show result screen
            elements.loadingOverlay.classList.remove('active');
            showScreen('result-screen');

        } catch (err) {
            console.error('Crop error:', err);
            elements.loadingOverlay.classList.remove('active');
            showError('Failed to crop the image. Please try again.');
        }
    }, 50);
}

function cropWithPerspective() {
    const img = state.currentImage;
    const corners = state.cropCorners.map(c => ({
        x: c.x / state.scale,
        y: c.y / state.scale
    }));

    // Calculate output dimensions
    const width = Math.max(
        distance(corners[0], corners[1]),
        distance(corners[3], corners[2])
    );
    const height = Math.max(
        distance(corners[0], corners[3]),
        distance(corners[1], corners[2])
    );

    // Create source image on canvas
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = img.width;
    srcCanvas.height = img.height;
    srcCanvas.getContext('2d').drawImage(img, 0, 0);

    let src = cv.imread(srcCanvas);
    let dst = new cv.Mat();

    try {
        // Source points (in order: TL, TR, BR, BL)
        const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
            corners[0].x, corners[0].y,
            corners[1].x, corners[1].y,
            corners[2].x, corners[2].y,
            corners[3].x, corners[3].y
        ]);

        // Destination points
        const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            width, 0,
            width, height,
            0, height
        ]);

        // Get perspective transform matrix
        const M = cv.getPerspectiveTransform(srcPoints, dstPoints);

        // Apply perspective transform
        cv.warpPerspective(src, dst, M, new cv.Size(width, height));

        // Write to canvas
        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = width;
        resultCanvas.height = height;
        cv.imshow(resultCanvas, dst);

        srcPoints.delete();
        dstPoints.delete();
        M.delete();

        return resultCanvas;

    } finally {
        src.delete();
        dst.delete();
    }
}

function cropWithoutPerspective() {
    // Fallback: simple rectangular crop without perspective correction
    const corners = state.cropCorners.map(c => ({
        x: c.x / state.scale,
        y: c.y / state.scale
    }));

    // Find bounding box
    const minX = Math.min(...corners.map(c => c.x));
    const maxX = Math.max(...corners.map(c => c.x));
    const minY = Math.min(...corners.map(c => c.y));
    const maxY = Math.max(...corners.map(c => c.y));

    const width = maxX - minX;
    const height = maxY - minY;

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;

    const ctx = resultCanvas.getContext('2d');
    ctx.drawImage(
        state.currentImage,
        minX, minY, width, height,
        0, 0, width, height
    );

    return resultCanvas;
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Download functionality
function downloadResult() {
    const canvas = elements.resultCanvas;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `cropped_${timestamp}.jpg`;

    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();

    // Update result info
    elements.resultInfo.textContent = `Saved as: ${filename}`;
}
