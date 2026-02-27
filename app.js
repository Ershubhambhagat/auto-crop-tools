/**
 * Auto Crop Photo Tool - Full Featured Version
 * 100% Free, Client-side only, Fast performance
 */

// Global state
const state = {
    cvReady: false,
    currentImage: null,
    originalImageData: null,
    cropCorners: [],
    canvasOffset: { x: 0, y: 0 },
    scale: 1,
    activeHandle: null,
    cameraStream: null,
    facingMode: 'environment',
    flashOn: false,
    flashSupported: false,
    brightness: 100,
    contrast: 100,
    // New features
    rotation: 0,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    dragStartZoom: undefined,
    isDragging: false,
    lastPinchDistance: 0,
    gridVisible: false,
    aspectRatio: 'free',
    undoStack: [],
    redoStack: [],
    // Batch mode
    batchMode: false,
    batchImages: [],
    batchIndex: 0,
    // Export settings
    exportFormat: 'jpg',
    targetSizeUnit: 'kb', // 'kb' or 'mb'
    targetSizeValue: 50,  // Value in current unit
    targetSizeBytes: 50 * 1024, // Actual target in bytes
    originalCropWidth: 0,
    originalCropHeight: 0,
    outputWidth: 0,
    outputHeight: 0,
    sharpenEnabled: false,
    autoEnhanceEnabled: false
};

// DOM Elements
const elements = {};

// Aspect ratio presets
const aspectRatios = {
    'free': null,
    'a4': 210 / 297,
    'letter': 8.5 / 11,
    'square': 1,
    '4:3': 4 / 3,
    '16:9': 16 / 9,
    'id-card': 85.6 / 53.98,
    'passport': 35 / 45
};

// Initialize
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    cacheElements();
    setupEventListeners();
}

function cacheElements() {
    // Screens
    elements.landingScreen = document.getElementById('landing-screen');
    elements.cameraScreen = document.getElementById('camera-screen');
    elements.editorScreen = document.getElementById('editor-screen');
    elements.previewScreen = document.getElementById('preview-screen');
    elements.resultScreen = document.getElementById('result-screen');
    elements.errorModal = document.getElementById('error-modal');

    // Landing
    elements.uploadBtn = document.getElementById('upload-btn');
    elements.cameraBtn = document.getElementById('camera-btn');
    elements.batchBtn = document.getElementById('batch-btn');
    elements.fileInput = document.getElementById('file-input');
    elements.batchFileInput = document.getElementById('batch-file-input');

    // Camera
    elements.cameraVideo = document.getElementById('camera-video');
    elements.cameraCapture = document.getElementById('camera-capture');
    elements.cameraCancel = document.getElementById('camera-cancel');
    elements.cameraFlash = document.getElementById('camera-flash');
    elements.flashIconOff = document.getElementById('flash-icon-off');
    elements.flashIconOn = document.getElementById('flash-icon-on');
    elements.flashUnsupported = document.getElementById('flash-unsupported');
    elements.brightnessSlider = document.getElementById('brightness-slider');
    elements.brightnessValue = document.getElementById('brightness-value');
    elements.contrastSlider = document.getElementById('contrast-slider');
    elements.contrastValue = document.getElementById('contrast-value');

    // Editor
    elements.editorCanvas = document.getElementById('editor-canvas');
    elements.canvasWrapper = document.getElementById('canvas-wrapper');
    elements.editorCanvasContainer = document.getElementById('editor-canvas-container');
    elements.editorBack = document.getElementById('editor-back');
    elements.editorReset = document.getElementById('editor-reset');
    elements.editorUndo = document.getElementById('editor-undo');
    elements.editorRedo = document.getElementById('editor-redo');
    elements.confirmCrop = document.getElementById('confirm-crop');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.loadingText = document.getElementById('loading-text');
    elements.progressFill = document.getElementById('progress-fill');
    elements.progressText = document.getElementById('progress-text');
    elements.detectionStatus = document.getElementById('detection-status');
    elements.imageDimensions = document.getElementById('image-dimensions');
    elements.zoomLevel = document.getElementById('zoom-level');

    // Editor toolbar
    elements.rotateLeft = document.getElementById('rotate-left');
    elements.rotateRight = document.getElementById('rotate-right');
    elements.toggleGrid = document.getElementById('toggle-grid');
    elements.zoomIn = document.getElementById('zoom-in');
    elements.zoomOut = document.getElementById('zoom-out');
    elements.zoomReset = document.getElementById('zoom-reset');
    elements.aspectRatioSelect = document.getElementById('aspect-ratio');

    // Crop overlay
    elements.cropSvg = document.getElementById('crop-svg');
    elements.cropPolygon = document.getElementById('crop-polygon');
    elements.gridOverlay = document.getElementById('grid-overlay');
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
    elements.gridLines = {
        h1: document.getElementById('grid-h1'),
        h2: document.getElementById('grid-h2'),
        v1: document.getElementById('grid-v1'),
        v2: document.getElementById('grid-v2')
    };

    // Preview
    elements.previewBack = document.getElementById('preview-back');
    elements.previewCanvas = document.getElementById('preview-canvas');
    elements.formatBtns = document.querySelectorAll('.format-btn');
    elements.unitKb = document.getElementById('unit-kb');
    elements.unitMb = document.getElementById('unit-mb');
    elements.fileSizeSlider = document.getElementById('file-size-slider');
    elements.sliderMin = document.getElementById('slider-min');
    elements.sliderCurrent = document.getElementById('slider-current');
    elements.sliderMax = document.getElementById('slider-max');
    elements.quickPresets = document.querySelectorAll('.quick-preset');
    elements.originalDimensions = document.getElementById('original-dimensions');
    elements.outputDimensions = document.getElementById('output-dimensions');
    elements.sharpenToggle = document.getElementById('sharpen-toggle');
    elements.autoEnhanceToggle = document.getElementById('auto-enhance-toggle');
    elements.fileSizeEstimate = document.getElementById('file-size-estimate');
    elements.downloadBtn = document.getElementById('download-btn');
    elements.presetBtns = document.querySelectorAll('.preset-btn');

    // Result
    elements.resultCanvas = document.getElementById('result-canvas');
    elements.resultInfo = document.getElementById('result-info');
    elements.downloadAgain = document.getElementById('download-again');
    elements.cropAnother = document.getElementById('crop-another');
    elements.batchIndicator = document.getElementById('batch-indicator');
    elements.batchProgress = document.getElementById('batch-progress');
    elements.batchNext = document.getElementById('batch-next');

    // Modal
    elements.errorMessage = document.getElementById('error-message');
    elements.errorClose = document.getElementById('error-close');

    // Filename input
    elements.filenameInput = document.getElementById('filename-input');
    elements.filenameSuffix = document.getElementById('filename-suffix');
    elements.filenamePreview = document.getElementById('filename-preview');
}

function setupEventListeners() {
    // Landing
    elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
    elements.cameraBtn.addEventListener('click', startCamera);
    elements.batchBtn.addEventListener('click', () => elements.batchFileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.batchFileInput.addEventListener('change', handleBatchSelect);

    // Camera
    elements.cameraCapture.addEventListener('click', capturePhoto);
    elements.cameraCancel.addEventListener('click', stopCamera);
    elements.cameraFlash.addEventListener('click', toggleFlash);
    elements.brightnessSlider.addEventListener('input', updateCameraFilters);
    elements.contrastSlider.addEventListener('input', updateCameraFilters);

    // Editor toolbar
    elements.editorBack.addEventListener('click', goToLanding);
    elements.editorReset.addEventListener('click', resetCropArea);
    elements.editorUndo.addEventListener('click', undo);
    elements.editorRedo.addEventListener('click', redo);
    elements.rotateLeft.addEventListener('click', () => rotateImage(-90));
    elements.rotateRight.addEventListener('click', () => rotateImage(90));
    elements.toggleGrid.addEventListener('click', toggleGrid);
    elements.zoomIn.addEventListener('click', () => adjustZoom(0.25));
    elements.zoomOut.addEventListener('click', () => adjustZoom(-0.25));
    elements.zoomReset.addEventListener('click', resetZoom);
    elements.aspectRatioSelect.addEventListener('change', onAspectRatioChange);
    elements.confirmCrop.addEventListener('click', performCrop);

    // Crop handles
    elements.cropHandles.forEach((handle, index) => {
        handle.addEventListener('mousedown', (e) => startDrag(e, index));
        handle.addEventListener('touchstart', (e) => startDrag(e, index), { passive: false });
    });

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Pan & Zoom gestures
    elements.editorCanvasContainer.addEventListener('wheel', handleWheel, { passive: false });
    elements.editorCanvasContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    elements.editorCanvasContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    elements.editorCanvasContainer.addEventListener('touchend', handleTouchEnd);

    // Preview
    elements.previewBack.addEventListener('click', () => showScreen('editor-screen'));
    elements.formatBtns.forEach(btn => btn.addEventListener('click', onFormatChange));
    elements.unitKb.addEventListener('click', () => setTargetUnit('kb'));
    elements.unitMb.addEventListener('click', () => setTargetUnit('mb'));
    elements.fileSizeSlider.addEventListener('input', onFileSizeChange);
    elements.quickPresets.forEach(btn => btn.addEventListener('click', onQuickPresetClick));
    elements.sharpenToggle.addEventListener('change', updatePreview);
    elements.autoEnhanceToggle.addEventListener('change', updatePreview);
    elements.downloadBtn.addEventListener('click', downloadFile);

    // Result
    elements.downloadAgain.addEventListener('click', downloadFile);
    elements.cropAnother.addEventListener('click', goToLanding);
    elements.batchNext.addEventListener('click', processNextBatch);

    // Modal
    elements.errorClose.addEventListener('click', closeError);

    // Filename input
    elements.filenameInput.addEventListener('input', updateFilenamePreview);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Window resize
    window.addEventListener('resize', handleResize);
}

// Haptic feedback only
function vibrate(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goToLanding() {
    stopCamera();
    state.batchMode = false;
    state.batchImages = [];
    state.batchIndex = 0;
    state.rotation = 0;
    state.zoom = 1;
    state.undoStack = [];
    state.redoStack = [];
    showScreen('landing-screen');
}

// Error handling
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.classList.add('active');
}

function closeError() {
    elements.errorModal.classList.remove('active');
}

// Progress indicator
function showProgress(text, percent) {
    elements.loadingText.textContent = text;
    elements.progressFill.style.width = percent + '%';
    elements.progressText.textContent = Math.round(percent) + '%';
}

// File handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        showError('Please select a valid image file (JPG, PNG, or WEBP)');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => loadImage(event.target.result);
    reader.onerror = () => showError('Failed to read the file.');
    reader.readAsDataURL(file);
    e.target.value = '';
}

function handleBatchSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    state.batchMode = true;
    state.batchImages = [];
    state.batchIndex = 0;

    let loaded = 0;
    files.forEach((file, index) => {
        if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            state.batchImages[index] = event.target.result;
            loaded++;
            if (loaded === files.filter(f => f.type.match(/^image\//)).length) {
                state.batchImages = state.batchImages.filter(Boolean);
                if (state.batchImages.length > 0) {
                    loadImage(state.batchImages[0]);
                }
            }
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
}

// Camera
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

        state.brightness = 100;
        state.contrast = 100;
        state.flashOn = false;
        elements.brightnessSlider.value = 100;
        elements.contrastSlider.value = 100;
        elements.brightnessValue.textContent = '100%';
        elements.contrastValue.textContent = '100%';
        updateCameraFilters();
        updateFlashIcon();

        await checkFlashSupport();
        showScreen('camera-screen');
    } catch (err) {
        if (err.name === 'NotAllowedError') {
            showError('Camera access denied. Please allow camera access.');
        } else if (err.name === 'NotFoundError') {
            showError('No camera found on this device.');
        } else {
            showError('Failed to access camera. Try uploading a photo instead.');
        }
    }
}

async function checkFlashSupport() {
    state.flashSupported = false;
    if (state.cameraStream) {
        const track = state.cameraStream.getVideoTracks()[0];
        if (track) {
            try {
                const capabilities = track.getCapabilities();
                state.flashSupported = capabilities && capabilities.torch;
            } catch (e) {}
        }
    }
    elements.cameraFlash.style.opacity = state.flashSupported ? '1' : '0.5';
}

async function toggleFlash() {
    if (!state.flashSupported) {
        elements.flashUnsupported.style.display = 'block';
        setTimeout(() => elements.flashUnsupported.style.display = 'none', 3000);
        return;
    }

    state.flashOn = !state.flashOn;
    if (state.cameraStream) {
        const track = state.cameraStream.getVideoTracks()[0];
        if (track) {
            try {
                await track.applyConstraints({ advanced: [{ torch: state.flashOn }] });
            } catch (e) {
                state.flashOn = false;
            }
        }
    }
    updateFlashIcon();
}

function updateFlashIcon() {
    elements.flashIconOff.style.display = state.flashOn ? 'none' : 'block';
    elements.flashIconOn.style.display = state.flashOn ? 'block' : 'none';
    elements.cameraFlash.classList.toggle('flash-on', state.flashOn);
}

function updateCameraFilters() {
    state.brightness = parseInt(elements.brightnessSlider.value);
    state.contrast = parseInt(elements.contrastSlider.value);
    elements.brightnessValue.textContent = state.brightness + '%';
    elements.contrastValue.textContent = state.contrast + '%';
    elements.cameraVideo.style.filter =
        `brightness(${state.brightness / 100}) contrast(${state.contrast / 100})`;
}

function stopCamera() {
    if (state.flashOn && state.cameraStream) {
        const track = state.cameraStream.getVideoTracks()[0];
        if (track) {
            try { track.applyConstraints({ advanced: [{ torch: false }] }); } catch (e) {}
        }
    }
    if (state.cameraStream) {
        state.cameraStream.getTracks().forEach(track => track.stop());
        state.cameraStream = null;
    }
    elements.cameraVideo.srcObject = null;
    elements.cameraVideo.style.filter = '';
    state.flashOn = false;
    showScreen('landing-screen');
}

function capturePhoto() {
    vibrate(50);

    const video = elements.cameraVideo;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.filter = `brightness(${state.brightness / 100}) contrast(${state.contrast / 100})`;
    ctx.drawImage(video, 0, 0);

    if (state.flashOn && state.cameraStream) {
        const track = state.cameraStream.getVideoTracks()[0];
        if (track) {
            try { track.applyConstraints({ advanced: [{ torch: false }] }); } catch (e) {}
        }
    }

    stopCamera();
    loadImage(canvas.toDataURL('image/jpeg', 0.95));
}

// Image loading
function loadImage(dataUrl) {
    const img = new Image();
    img.onload = () => {
        state.currentImage = img;
        state.rotation = 0;
        state.zoom = 1;
        state.undoStack = [];
        state.redoStack = [];
        showScreen('editor-screen');
        setupEditor();

        if (state.cvReady) {
            detectEdges();
        } else {
            elements.loadingOverlay.classList.add('active');
            showProgress('Loading edge detection...', 0);

            const checkReady = setInterval(() => {
                if (state.cvReady) {
                    clearInterval(checkReady);
                    detectEdges();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(checkReady);
                if (!state.cvReady) {
                    elements.loadingOverlay.classList.remove('active');
                    setDefaultCropArea();
                    requestAnimationFrame(() => {
                        updateCanvasOffset();
                        updateCropOverlay();
                    });
                    elements.detectionStatus.textContent = 'Manual adjustment only';
                    elements.detectionStatus.className = 'detection-status warning';
                }
            }, 15000);
        }
    };
    img.onerror = () => {
        showError('Failed to load the image.');
        goToLanding();
    };
    img.src = dataUrl;
}

function setupEditor() {
    const canvas = elements.editorCanvas;
    const container = elements.editorCanvasContainer;
    const img = state.currentImage;

    // Handle rotation
    let drawWidth = img.width;
    let drawHeight = img.height;
    if (state.rotation === 90 || state.rotation === 270 || state.rotation === -90) {
        drawWidth = img.height;
        drawHeight = img.width;
    }

    const containerRect = container.getBoundingClientRect();
    // Use slightly smaller area to ensure crop handles are visible
    const maxWidth = containerRect.width - 40;
    const maxHeight = containerRect.height - 40;

    const scaleX = maxWidth / drawWidth;
    const scaleY = maxHeight / drawHeight;
    // Always scale to fit within container (never larger than container)
    state.scale = Math.min(scaleX, scaleY);

    canvas.width = drawWidth * state.scale;
    canvas.height = drawHeight * state.scale;

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((state.rotation * Math.PI) / 180);

    if (state.rotation === 90 || state.rotation === -270) {
        ctx.drawImage(img, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
    } else if (state.rotation === 180 || state.rotation === -180) {
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    } else if (state.rotation === 270 || state.rotation === -90) {
        ctx.drawImage(img, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
    } else {
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    }
    ctx.restore();

    state.originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Wait for layout to complete before calculating offset
    requestAnimationFrame(() => {
        updateCanvasOffset();
        updateZoomDisplay();
        // If crop corners exist, update the overlay
        if (state.cropCorners.length === 4) {
            updateCropOverlay();
        }
    });

    elements.imageDimensions.textContent = `${Math.round(drawWidth)} x ${Math.round(drawHeight)}`;
}

function updateCanvasOffset() {
    const canvas = elements.editorCanvas;
    const container = elements.editorCanvasContainer;
    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate offset from container edge to canvas edge
    let offsetX = canvasRect.left - containerRect.left;
    let offsetY = canvasRect.top - containerRect.top;

    // Ensure valid offsets (fallback to center calculation if invalid)
    if (isNaN(offsetX) || isNaN(offsetY) || offsetX < 0 || offsetY < 0) {
        offsetX = (containerRect.width - canvas.width) / 2;
        offsetY = (containerRect.height - canvas.height) / 2;
    }

    state.canvasOffset = {
        x: Math.max(0, offsetX),
        y: Math.max(0, offsetY)
    };
}

// Rotation
function rotateImage(degrees) {
    state.rotation = (state.rotation + degrees) % 360;
    if (state.rotation < 0) state.rotation += 360;
    setupEditor();
    detectEdges();
}

// Zoom & Pan
function adjustZoom(delta) {
    const newZoom = Math.max(0.5, Math.min(3, state.zoom + delta));
    state.zoom = newZoom;
    applyZoom();
}

function resetZoom() {
    state.zoom = 1;
    state.panOffset = { x: 0, y: 0 };
    applyZoom();
}

function applyZoom() {
    elements.canvasWrapper.style.transform =
        `scale(${state.zoom}) translate(${state.panOffset.x}px, ${state.panOffset.y}px)`;
    updateCanvasOffset();
    updateCropOverlay();
    updateZoomDisplay();
}

function updateZoomDisplay() {
    elements.zoomLevel.textContent = Math.round(state.zoom * 100) + '%';
}

function handleWheel(e) {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        adjustZoom(e.deltaY > 0 ? -0.1 : 0.1);
    }
}

let touchStartDistance = 0;
let touchStartZoom = 1;

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        touchStartDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartZoom = state.zoom;
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 2) {
        e.preventDefault();
        const distance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = distance / touchStartDistance;
        state.zoom = Math.max(0.5, Math.min(3, touchStartZoom * scale));
        applyZoom();
    }
}

function handleTouchEnd(e) {
    touchStartDistance = 0;
}

// Grid
function toggleGrid() {
    state.gridVisible = !state.gridVisible;
    elements.gridOverlay.style.display = state.gridVisible ? 'block' : 'none';
    elements.toggleGrid.classList.toggle('active', state.gridVisible);
    if (state.gridVisible) updateGridLines();
}

function updateGridLines() {
    if (!state.gridVisible || state.cropCorners.length !== 4) return;

    const corners = state.cropCorners;
    const offset = state.canvasOffset;

    // Calculate thirds
    const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

    const top1 = lerp(corners[0], corners[1], 1/3);
    const top2 = lerp(corners[0], corners[1], 2/3);
    const bottom1 = lerp(corners[3], corners[2], 1/3);
    const bottom2 = lerp(corners[3], corners[2], 2/3);
    const left1 = lerp(corners[0], corners[3], 1/3);
    const left2 = lerp(corners[0], corners[3], 2/3);
    const right1 = lerp(corners[1], corners[2], 1/3);
    const right2 = lerp(corners[1], corners[2], 2/3);

    elements.gridLines.v1.setAttribute('x1', top1.x + offset.x);
    elements.gridLines.v1.setAttribute('y1', top1.y + offset.y);
    elements.gridLines.v1.setAttribute('x2', bottom1.x + offset.x);
    elements.gridLines.v1.setAttribute('y2', bottom1.y + offset.y);

    elements.gridLines.v2.setAttribute('x1', top2.x + offset.x);
    elements.gridLines.v2.setAttribute('y1', top2.y + offset.y);
    elements.gridLines.v2.setAttribute('x2', bottom2.x + offset.x);
    elements.gridLines.v2.setAttribute('y2', bottom2.y + offset.y);

    elements.gridLines.h1.setAttribute('x1', left1.x + offset.x);
    elements.gridLines.h1.setAttribute('y1', left1.y + offset.y);
    elements.gridLines.h1.setAttribute('x2', right1.x + offset.x);
    elements.gridLines.h1.setAttribute('y2', right1.y + offset.y);

    elements.gridLines.h2.setAttribute('x1', left2.x + offset.x);
    elements.gridLines.h2.setAttribute('y1', left2.y + offset.y);
    elements.gridLines.h2.setAttribute('x2', right2.x + offset.x);
    elements.gridLines.h2.setAttribute('y2', right2.y + offset.y);
}

// Aspect Ratio
function onAspectRatioChange() {
    state.aspectRatio = elements.aspectRatioSelect.value;
    if (state.aspectRatio !== 'free' && state.cropCorners.length === 4) {
        applyAspectRatio();
    }
}

function applyAspectRatio() {
    const ratio = aspectRatios[state.aspectRatio];
    if (!ratio) return;

    const corners = state.cropCorners;
    const centerX = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4;
    const centerY = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4;

    const currentWidth = Math.max(
        Math.abs(corners[1].x - corners[0].x),
        Math.abs(corners[2].x - corners[3].x)
    );
    const currentHeight = Math.max(
        Math.abs(corners[3].y - corners[0].y),
        Math.abs(corners[2].y - corners[1].y)
    );

    let newWidth, newHeight;
    if (currentWidth / currentHeight > ratio) {
        newHeight = currentHeight;
        newWidth = newHeight * ratio;
    } else {
        newWidth = currentWidth;
        newHeight = newWidth / ratio;
    }

    const halfW = newWidth / 2;
    const halfH = newHeight / 2;

    saveState();
    state.cropCorners = [
        { x: centerX - halfW, y: centerY - halfH },
        { x: centerX + halfW, y: centerY - halfH },
        { x: centerX + halfW, y: centerY + halfH },
        { x: centerX - halfW, y: centerY + halfH }
    ];
    updateCropOverlay();
}

// Undo/Redo
function saveState() {
    state.undoStack.push(JSON.stringify(state.cropCorners));
    state.redoStack = [];
    updateUndoRedoButtons();
}

function undo() {
    if (state.undoStack.length === 0) return;
    state.redoStack.push(JSON.stringify(state.cropCorners));
    state.cropCorners = JSON.parse(state.undoStack.pop());
    updateCropOverlay();
    updateUndoRedoButtons();
}

function redo() {
    if (state.redoStack.length === 0) return;
    state.undoStack.push(JSON.stringify(state.cropCorners));
    state.cropCorners = JSON.parse(state.redoStack.pop());
    updateCropOverlay();
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    elements.editorUndo.disabled = state.undoStack.length === 0;
    elements.editorRedo.disabled = state.redoStack.length === 0;
}

// Keyboard shortcuts
function handleKeyboard(e) {
    if (elements.editorScreen.classList.contains('active')) {
        if (e.key === 'r' || e.key === 'R') {
            rotateImage(e.shiftKey ? -90 : 90);
        } else if (e.key === 'g' || e.key === 'G') {
            toggleGrid();
        } else if (e.key === '+' || e.key === '=') {
            adjustZoom(0.25);
        } else if (e.key === '-') {
            adjustZoom(-0.25);
        } else if (e.key === '0') {
            resetZoom();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            redo();
        } else if (e.key === 'Enter') {
            performCrop();
        }
    }
}

function handleResize() {
    if (state.currentImage) {
        setupEditor();
        if (state.cropCorners.length === 4) {
            updateCropOverlay();
        }
    }
}

// OpenCV Ready
window.onOpenCvReady = function() {
    state.cvReady = true;
    console.log('OpenCV.js ready');
};

// Edge Detection
function detectEdges() {
    elements.loadingOverlay.classList.add('active');
    showProgress('Detecting edges...', 10);

    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
        setTimeout(() => {
            try {
                showProgress('Analyzing image...', 30);
                const result = findDocumentContour();
                showProgress('Processing...', 70);

                if (result && result.length === 4) {
                    state.cropCorners = result;
                    // Ensure detected corners are within canvas bounds
                    clampCornersToCanvas();
                    elements.detectionStatus.textContent = 'Document detected - adjust if needed';
                    elements.detectionStatus.className = 'detection-status success';
                } else {
                    setDefaultCropArea();
                    elements.detectionStatus.textContent = 'No document found - adjust manually';
                    elements.detectionStatus.className = 'detection-status warning';
                }

                showProgress('Complete', 100);

                // Update canvas offset and crop overlay after a small delay
                requestAnimationFrame(() => {
                    updateCanvasOffset();
                    updateCropOverlay();
                });
            } catch (err) {
                console.error('Detection error:', err);
                setDefaultCropArea();
                elements.detectionStatus.textContent = 'Detection error - adjust manually';
                elements.detectionStatus.className = 'detection-status warning';

                requestAnimationFrame(() => {
                    updateCanvasOffset();
                    updateCropOverlay();
                });
            }

            setTimeout(() => {
                elements.loadingOverlay.classList.remove('active');
            }, 300);
        }, 100);
    });
}

function findDocumentContour() {
    const canvas = elements.editorCanvas;
    let src = cv.imread(canvas);
    let gray = new cv.Mat();
    let enhanced = new cv.Mat();

    try {
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Try with original grayscale first
        const methods = [
            () => detectWithCanny(gray, 75, 200),
            () => detectWithCanny(gray, 50, 150),
            () => detectWithCanny(gray, 30, 100),
            () => detectWithAdaptiveThreshold(gray),
            () => detectWithMorphology(gray)
        ];

        for (const method of methods) {
            const result = method();
            if (result) return result;
        }

        // If no result, try with contrast enhanced image
        cv.equalizeHist(gray, enhanced);
        const enhancedMethods = [
            () => detectWithCanny(enhanced, 50, 150),
            () => detectWithCanny(enhanced, 30, 100),
            () => detectWithAdaptiveThreshold(enhanced),
            () => detectWithContrastBoost(gray)
        ];

        for (const method of enhancedMethods) {
            const result = method();
            if (result) return result;
        }

        return null;
    } finally {
        src.delete();
        gray.delete();
        enhanced.delete();
    }
}

function detectWithContrastBoost(gray) {
    let boosted = new cv.Mat();
    let edges = new cv.Mat();
    let dilated = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        // Apply CLAHE for better contrast
        let clahe = new cv.CLAHE(3.0, new cv.Size(8, 8));
        clahe.apply(gray, boosted);

        cv.GaussianBlur(boosted, boosted, new cv.Size(5, 5), 0);
        cv.Canny(boosted, edges, 40, 120);
        let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
        cv.dilate(edges, dilated, kernel, new cv.Point(-1, -1), 3);
        kernel.delete();
        cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        return findBestQuadrilateral(contours, gray.cols, gray.rows);
    } finally {
        boosted.delete();
        edges.delete();
        dilated.delete();
        contours.delete();
        hierarchy.delete();
    }
}

function detectWithCanny(gray, lowThresh, highThresh) {
    let blurred = new cv.Mat();
    let edges = new cv.Mat();
    let dilated = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        cv.Canny(blurred, edges, lowThresh, highThresh);
        let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
        cv.dilate(edges, dilated, kernel, new cv.Point(-1, -1), 2);
        kernel.delete();
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

function detectWithAdaptiveThreshold(gray) {
    let blurred = new cv.Mat();
    let thresh = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        cv.adaptiveThreshold(blurred, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
        cv.findContours(thresh, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
        return findBestQuadrilateral(contours, gray.cols, gray.rows);
    } finally {
        blurred.delete();
        thresh.delete();
        contours.delete();
        hierarchy.delete();
    }
}

function detectWithMorphology(gray) {
    let blurred = new cv.Mat();
    let edges = new cv.Mat();
    let closed = new cv.Mat();
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    try {
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        cv.Canny(blurred, edges, 50, 150);
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

function findBestQuadrilateral(contours, width, height) {
    let bestContour = null;
    let maxScore = 0;
    const imageArea = width * height;
    // Lower minimum area to detect smaller documents
    const minArea = imageArea * 0.02;
    const maxArea = imageArea * 0.99;

    for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        if (area < minArea || area > maxArea) continue;

        const peri = cv.arcLength(contour, true);
        const approx = new cv.Mat();
        // Try different approximation tolerances
        const tolerances = [0.02, 0.03, 0.04, 0.05];

        for (const tol of tolerances) {
            cv.approxPolyDP(contour, approx, tol * peri, true);

            if (approx.rows === 4) {
                const score = scoreQuadrilateral(approx, area, imageArea);
                if (score > maxScore) {
                    maxScore = score;
                    if (bestContour) bestContour.delete();
                    bestContour = approx.clone();
                }
                break; // Found a quad with this contour
            }
        }
        approx.delete();
    }

    // Lower threshold to accept more detections
    if (bestContour && maxScore > 0.05) {
        const points = [];
        for (let i = 0; i < 4; i++) {
            points.push({ x: bestContour.data32S[i * 2], y: bestContour.data32S[i * 2 + 1] });
        }
        bestContour.delete();
        return orderPoints(points);
    }

    if (bestContour) bestContour.delete();
    return null;
}

function scoreQuadrilateral(approx, area, imageArea) {
    // Allow slightly non-convex shapes (perspective distortion)
    const points = [];
    for (let i = 0; i < 4; i++) {
        points.push({ x: approx.data32S[i * 2], y: approx.data32S[i * 2 + 1] });
    }

    // Check if shape is roughly convex (allow some tolerance)
    if (!cv.isContourConvex(approx)) {
        // Still allow if angles are reasonable
        let validShape = true;
        for (let i = 0; i < 4; i++) {
            const angle = calculateAngle(points[i], points[(i + 1) % 4], points[(i + 2) % 4]);
            if (angle < 30 || angle > 150) {
                validShape = false;
                break;
            }
        }
        if (!validShape) return 0;
    }

    // Score based on angles being close to 90 degrees (allow more tolerance)
    let angleScore = 0;
    for (let i = 0; i < 4; i++) {
        const angle = calculateAngle(points[i], points[(i + 1) % 4], points[(i + 2) % 4]);
        // More lenient angle scoring - allow angles between 60-120 degrees
        angleScore += Math.max(0, 1 - Math.abs(angle - 90) / 60);
    }

    // Score based on area - prefer larger documents
    const areaScore = Math.min(area / imageArea, 0.95) / 0.95;

    // Combined score with higher weight on area
    return (angleScore / 4) * 0.4 + areaScore * 0.6;
}

function calculateAngle(p1, p2, p3) {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * 180 / Math.PI;
}

function orderPoints(points) {
    points.sort((a, b) => a.y - b.y);
    const top = points.slice(0, 2).sort((a, b) => a.x - b.x);
    const bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);
    return [top[0], top[1], bottom[1], bottom[0]];
}

function setDefaultCropArea() {
    const canvas = elements.editorCanvas;
    // Use smaller padding (5%) for near full-screen crop on reset
    const padding = Math.min(canvas.width, canvas.height) * 0.05;
    state.cropCorners = [
        { x: padding, y: padding },
        { x: canvas.width - padding, y: padding },
        { x: canvas.width - padding, y: canvas.height - padding },
        { x: padding, y: canvas.height - padding }
    ];
}

// Clamp corners to ensure they stay within canvas bounds
function clampCornersToCanvas() {
    const canvas = elements.editorCanvas;
    const minPadding = 10; // Minimum padding from edge

    state.cropCorners = state.cropCorners.map(corner => ({
        x: Math.max(minPadding, Math.min(corner.x, canvas.width - minPadding)),
        y: Math.max(minPadding, Math.min(corner.y, canvas.height - minPadding))
    }));
}

function resetCropArea() {
    // Always set default full-screen crop first so user can see something
    setDefaultCropArea();
    updateCanvasOffset();
    updateCropOverlay();

    // Then try to detect edges if OpenCV is ready
    if (state.cvReady) {
        detectEdges();
    }
}

// Crop overlay
function updateCropOverlay() {
    if (state.cropCorners.length !== 4) return;
    updateCanvasOffset();

    const corners = state.cropCorners;
    const offset = state.canvasOffset;
    const container = elements.editorCanvasContainer;
    const containerRect = container.getBoundingClientRect();

    // Set SVG viewBox to match container size
    elements.cropSvg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);

    // Create polygon points with offset
    const pointsStr = corners.map(p => `${p.x + offset.x},${p.y + offset.y}`).join(' ');
    elements.cropPolygon.setAttribute('points', pointsStr);

    // Update handles and lines
    corners.forEach((corner, i) => {
        const x = corner.x + offset.x;
        const y = corner.y + offset.y;
        elements.cropHandles[i].setAttribute('cx', x);
        elements.cropHandles[i].setAttribute('cy', y);
        const next = corners[(i + 1) % 4];
        elements.cropLines[i].setAttribute('x1', x);
        elements.cropLines[i].setAttribute('y1', y);
        elements.cropLines[i].setAttribute('x2', next.x + offset.x);
        elements.cropLines[i].setAttribute('y2', next.y + offset.y);
    });

    updateGridLines();
    updateUndoRedoButtons();
}

// Drag handling
function startDrag(e, index) {
    e.preventDefault();
    saveState();
    state.activeHandle = index;
    state.dragStartZoom = state.zoom; // Store original zoom
    vibrate(10);

    // Auto-zoom to the corner being adjusted for better precision
    if (state.zoom < 1.5) {
        state.zoom = 2;
        // Center zoom on the handle being dragged
        const corner = state.cropCorners[index];
        const canvas = elements.editorCanvas;
        state.panOffset = {
            x: -(corner.x - canvas.width / 2) * 0.5,
            y: -(corner.y - canvas.height / 2) * 0.5
        };
        applyZoom();
    }
}

function handleDrag(e) {
    if (state.activeHandle === null) return;
    e.preventDefault();

    const container = elements.editorCanvasContainer;
    const containerRect = container.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // Calculate position accounting for zoom and pan
    const x = (clientX - containerRect.left - state.canvasOffset.x - state.panOffset.x * state.zoom) / state.zoom;
    const y = (clientY - containerRect.top - state.canvasOffset.y - state.panOffset.y * state.zoom) / state.zoom;

    const canvas = elements.editorCanvas;
    const clampedX = Math.max(0, Math.min(x, canvas.width));
    const clampedY = Math.max(0, Math.min(y, canvas.height));

    state.cropCorners[state.activeHandle] = { x: clampedX, y: clampedY };

    // Update pan to follow the corner if zoomed in
    if (state.zoom > 1) {
        state.panOffset = {
            x: -(clampedX - canvas.width / 2) * 0.5,
            y: -(clampedY - canvas.height / 2) * 0.5
        };
        applyZoom();
    }

    if (state.aspectRatio !== 'free') {
        applyAspectRatioToHandle(state.activeHandle);
    }

    updateCropOverlay();
}

function applyAspectRatioToHandle(handleIndex) {
    // Simplified aspect ratio maintenance during drag
    const ratio = aspectRatios[state.aspectRatio];
    if (!ratio) return;
    // For now, just update - full aspect ratio lock would need more complex logic
}

function endDrag() {
    if (state.activeHandle !== null) {
        // Reset zoom after drag if it was auto-zoomed
        if (state.dragStartZoom !== undefined && state.dragStartZoom < 1.5) {
            setTimeout(() => {
                state.zoom = 1;
                state.panOffset = { x: 0, y: 0 };
                applyZoom();
            }, 300);
        }
    }
    state.activeHandle = null;
    state.dragStartZoom = undefined;
}

// Perform crop
function performCrop() {
    if (state.cropCorners.length !== 4) return;

    elements.loadingOverlay.classList.add('active');
    showProgress('Cropping...', 20);

    setTimeout(() => {
        try {
            let resultCanvas;
            if (state.cvReady) {
                resultCanvas = cropWithPerspective();
            } else {
                resultCanvas = cropWithoutPerspective();
            }

            showProgress('Processing...', 60);

            // Store original dimensions
            state.originalCropWidth = resultCanvas.width;
            state.originalCropHeight = resultCanvas.height;
            state.outputWidth = resultCanvas.width;
            state.outputHeight = resultCanvas.height;

            // Copy to preview canvas
            elements.previewCanvas.width = resultCanvas.width;
            elements.previewCanvas.height = resultCanvas.height;
            elements.previewCanvas.getContext('2d').drawImage(resultCanvas, 0, 0);

            // Also copy to result canvas
            elements.resultCanvas.width = resultCanvas.width;
            elements.resultCanvas.height = resultCanvas.height;
            elements.resultCanvas.getContext('2d').drawImage(resultCanvas, 0, 0);

            showProgress('Complete', 100);
            vibrate([50, 50, 50]);

            elements.loadingOverlay.classList.remove('active');

            // Setup preview screen
            setupPreviewScreen();
            showScreen('preview-screen');

        } catch (err) {
            console.error('Crop error:', err);
            elements.loadingOverlay.classList.remove('active');
            showError('Failed to crop the image.');
        }
    }, 50);
}

function cropWithPerspective() {
    const img = state.currentImage;

    // Get corners in original image coordinates
    let corners = state.cropCorners.map(c => ({
        x: c.x / state.scale,
        y: c.y / state.scale
    }));

    // Handle rotation
    if (state.rotation !== 0) {
        const centerX = img.width / 2;
        const centerY = img.height / 2;
        const rad = (-state.rotation * Math.PI) / 180;

        if (state.rotation === 90 || state.rotation === 270) {
            corners = corners.map(c => {
                const nx = c.y;
                const ny = state.rotation === 90 ? img.width - c.x : c.x;
                return { x: nx, y: ny };
            });
        } else if (state.rotation === 180) {
            corners = corners.map(c => ({
                x: img.width - c.x,
                y: img.height - c.y
            }));
        }
    }

    const width = Math.max(distance(corners[0], corners[1]), distance(corners[3], corners[2]));
    const height = Math.max(distance(corners[0], corners[3]), distance(corners[1], corners[2]));

    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = img.width;
    srcCanvas.height = img.height;
    srcCanvas.getContext('2d').drawImage(img, 0, 0);

    let src = cv.imread(srcCanvas);
    let dst = new cv.Mat();

    try {
        const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
            corners[0].x, corners[0].y,
            corners[1].x, corners[1].y,
            corners[2].x, corners[2].y,
            corners[3].x, corners[3].y
        ]);

        const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0, width, 0, width, height, 0, height
        ]);

        const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
        cv.warpPerspective(src, dst, M, new cv.Size(width, height));

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
    const corners = state.cropCorners.map(c => ({
        x: c.x / state.scale,
        y: c.y / state.scale
    }));

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
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((state.rotation * Math.PI) / 180);
    ctx.drawImage(state.currentImage, -minX - width / 2, -minY - height / 2);
    ctx.restore();

    return resultCanvas;
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Preview Screen
function setupPreviewScreen() {
    // Reset format to JPG
    state.exportFormat = 'jpg';
    elements.formatBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === 'jpg');
    });

    // Reset toggles
    elements.sharpenToggle.checked = false;
    elements.autoEnhanceToggle.checked = false;
    state.sharpenEnabled = false;
    state.autoEnhanceEnabled = false;

    // Set default file size target (50KB)
    state.targetSizeUnit = 'kb';
    state.targetSizeValue = 50;
    state.targetSizeBytes = 50 * 1024;
    setTargetUnit('kb');

    // Show original dimensions
    elements.originalDimensions.textContent = `${state.originalCropWidth} x ${state.originalCropHeight}`;

    // Reset filename
    elements.filenameInput.value = 'cropped';

    // Calculate estimated output dimensions
    calculateOutputDimensions();
}

function setTargetUnit(unit) {
    state.targetSizeUnit = unit;

    elements.unitKb.classList.toggle('active', unit === 'kb');
    elements.unitMb.classList.toggle('active', unit === 'mb');

    // Update slider range based on unit
    if (unit === 'kb') {
        elements.fileSizeSlider.min = 1;
        elements.fileSizeSlider.max = 500;
        elements.fileSizeSlider.value = Math.min(state.targetSizeValue, 500);
        elements.sliderMin.textContent = '1 KB';
        elements.sliderMax.textContent = '500 KB';
    } else {
        elements.fileSizeSlider.min = 1;
        elements.fileSizeSlider.max = 20;
        elements.fileSizeSlider.value = Math.min(state.targetSizeValue, 20) || 1;
        elements.sliderMin.textContent = '1 MB';
        elements.sliderMax.textContent = '20 MB';
    }

    onFileSizeChange();
}

function onFileSizeChange() {
    state.targetSizeValue = parseInt(elements.fileSizeSlider.value);

    // Update display
    if (state.targetSizeUnit === 'kb') {
        elements.sliderCurrent.textContent = state.targetSizeValue + ' KB';
        state.targetSizeBytes = state.targetSizeValue * 1024;
    } else {
        elements.sliderCurrent.textContent = state.targetSizeValue + ' MB';
        state.targetSizeBytes = state.targetSizeValue * 1024 * 1024;
    }

    // Update quick preset active state
    elements.quickPresets.forEach(btn => {
        const size = parseInt(btn.dataset.size);
        const unit = btn.dataset.unit;
        btn.classList.toggle('active',
            size === state.targetSizeValue && unit === state.targetSizeUnit);
    });

    calculateOutputDimensions();
}

function onQuickPresetClick(e) {
    const size = parseInt(e.target.dataset.size);
    const unit = e.target.dataset.unit;

    state.targetSizeValue = size;
    setTargetUnit(unit);
    elements.fileSizeSlider.value = size;
    onFileSizeChange();
}

function onFormatChange(e) {
    state.exportFormat = e.target.dataset.format;
    elements.formatBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === state.exportFormat);
    });
    calculateOutputDimensions();
    updateFilenamePreview();
}

function updatePreview() {
    state.sharpenEnabled = elements.sharpenToggle.checked;
    state.autoEnhanceEnabled = elements.autoEnhanceToggle.checked;
    calculateOutputDimensions();
}

function calculateOutputDimensions() {
    // Estimate required dimensions to achieve target file size
    const targetBytes = state.targetSizeBytes;
    const originalPixels = state.originalCropWidth * state.originalCropHeight;

    // Compression ratios (approximate)
    let bytesPerPixel;
    if (state.exportFormat === 'jpg') {
        bytesPerPixel = 0.15; // Adjustable based on quality
    } else if (state.exportFormat === 'png') {
        bytesPerPixel = 1.5; // PNG is larger
    } else {
        bytesPerPixel = 0.2; // PDF
    }

    // Calculate max pixels for target size
    const targetPixels = targetBytes / bytesPerPixel;

    // Calculate scale factor
    const scaleFactor = Math.sqrt(targetPixels / originalPixels);

    if (scaleFactor >= 1) {
        // Target is larger than original, use original size
        state.outputWidth = state.originalCropWidth;
        state.outputHeight = state.originalCropHeight;
    } else {
        // Need to scale down
        state.outputWidth = Math.round(state.originalCropWidth * scaleFactor);
        state.outputHeight = Math.round(state.originalCropHeight * scaleFactor);

        // Ensure minimum dimensions
        if (state.outputWidth < 50) state.outputWidth = 50;
        if (state.outputHeight < 50) state.outputHeight = 50;
    }

    // Update display
    elements.outputDimensions.textContent = `${state.outputWidth} x ${state.outputHeight}`;

    // Update file size estimate
    updateFileSizeEstimate();
}

function updateFileSizeEstimate() {
    // Show target size
    if (state.targetSizeUnit === 'kb') {
        elements.fileSizeEstimate.textContent = `Target: ${state.targetSizeValue} KB`;
    } else {
        elements.fileSizeEstimate.textContent = `Target: ${state.targetSizeValue} MB`;
    }
    updateFilenamePreview();
}

function updateFilenamePreview() {
    const baseName = elements.filenameInput.value.trim() || 'cropped';
    const ext = state.exportFormat === 'png' ? 'png' : (state.exportFormat === 'pdf' ? 'pdf' : 'jpg');

    // Format size suffix
    let sizeSuffix;
    if (state.targetSizeUnit === 'kb') {
        sizeSuffix = `_${state.targetSizeValue}kb`;
    } else {
        sizeSuffix = `_${state.targetSizeValue}mb`;
    }

    elements.filenameSuffix.textContent = `${sizeSuffix}.${ext}`;
    elements.filenamePreview.textContent = `${baseName}${sizeSuffix}.${ext}`;
}

// Download - Compress to target file size
function downloadFile() {
    elements.loadingOverlay.classList.add('active');
    showProgress('Compressing...', 10);

    setTimeout(() => {
        try {
            const baseName = elements.filenameInput.value.trim() || 'cropped';

            if (state.exportFormat === 'pdf') {
                const canvas = createOutputCanvas();
                downloadAsPDF(canvas, baseName);
            } else {
                // Compress to target file size
                const result = compressToTargetSize();

                // Calculate actual size for filename
                const actualSizeKB = Math.round(result.size / 1024);
                let sizeSuffix;
                if (actualSizeKB >= 1024) {
                    sizeSuffix = `_${(actualSizeKB / 1024).toFixed(1)}mb`;
                } else {
                    sizeSuffix = `_${actualSizeKB}kb`;
                }

                const link = document.createElement('a');
                const ext = state.exportFormat === 'png' ? 'png' : 'jpg';
                // Add SKB suffix (hidden from preview, only in download)
                link.download = `${baseName}${sizeSuffix}SKB.${ext}`;
                link.href = result.dataUrl;
                link.click();

                // Show actual file size (display without SKB)
                elements.resultInfo.textContent = `Saved: ${baseName}${sizeSuffix}SKB.${ext} (${result.width}x${result.height})`;
            }

            vibrate([50, 50, 50]);
            elements.loadingOverlay.classList.remove('active');

            if (state.batchMode) {
                elements.batchIndicator.style.display = 'flex';
                elements.batchProgress.textContent = `${state.batchIndex + 1} of ${state.batchImages.length}`;
                elements.batchNext.style.display = state.batchIndex < state.batchImages.length - 1 ? 'block' : 'none';
            }

            showScreen('result-screen');
        } catch (err) {
            console.error('Download error:', err);
            elements.loadingOverlay.classList.remove('active');
            showError('Failed to process image.');
        }
    }, 50);
}

// Compress image to target file size using binary search
function compressToTargetSize() {
    const targetBytes = state.targetSizeBytes;
    const mimeType = state.exportFormat === 'png' ? 'image/png' : 'image/jpeg';

    // Start with estimated dimensions
    let width = state.outputWidth;
    let height = state.outputHeight;
    let quality = 0.92;
    let dataUrl;
    let actualSize;

    // For PNG, we can only reduce dimensions
    if (state.exportFormat === 'png') {
        return compressPngToTarget(targetBytes);
    }

    // For JPG, use binary search on quality first, then dimensions
    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(elements.previewCanvas, 0, 0, width, height);

        // Apply enhancements if enabled
        if (state.cvReady && (state.sharpenEnabled || state.autoEnhanceEnabled)) {
            applyEnhancements(canvas);
        }

        dataUrl = canvas.toDataURL(mimeType, quality);
        actualSize = getDataUrlSize(dataUrl);

        showProgress('Compressing...', 10 + (attempts / maxAttempts) * 80);

        // Check if we're close enough (within 10% over target is OK)
        if (actualSize <= targetBytes * 1.1 && actualSize >= targetBytes * 0.5) {
            break;
        }

        if (actualSize > targetBytes) {
            // File too big - reduce quality first
            if (quality > 0.1) {
                quality -= 0.1;
            } else {
                // Quality at minimum, reduce dimensions
                const scale = Math.sqrt(targetBytes / actualSize) * 0.9;
                width = Math.max(50, Math.round(width * scale));
                height = Math.max(50, Math.round(height * scale));
                quality = 0.8; // Reset quality for new dimensions
            }
        } else {
            // File too small - can increase quality
            if (quality < 0.95 && width === state.outputWidth) {
                quality += 0.05;
            } else {
                break; // Close enough
            }
        }

        attempts++;
    }

    return {
        dataUrl: dataUrl,
        size: actualSize,
        width: width,
        height: height
    };
}

// Compress PNG by reducing dimensions
function compressPngToTarget(targetBytes) {
    let width = state.outputWidth;
    let height = state.outputHeight;
    let dataUrl;
    let actualSize;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(elements.previewCanvas, 0, 0, width, height);

        if (state.cvReady && (state.sharpenEnabled || state.autoEnhanceEnabled)) {
            applyEnhancements(canvas);
        }

        dataUrl = canvas.toDataURL('image/png');
        actualSize = getDataUrlSize(dataUrl);

        showProgress('Compressing...', 10 + (attempts / maxAttempts) * 80);

        if (actualSize <= targetBytes * 1.1) {
            break;
        }

        // Reduce dimensions
        const scale = Math.sqrt(targetBytes / actualSize) * 0.9;
        width = Math.max(50, Math.round(width * scale));
        height = Math.max(50, Math.round(height * scale));

        attempts++;
    }

    return {
        dataUrl: dataUrl,
        size: actualSize,
        width: width,
        height: height
    };
}

function createOutputCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = state.outputWidth;
    canvas.height = state.outputHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(elements.previewCanvas, 0, 0, state.outputWidth, state.outputHeight);

    if (state.cvReady && (state.sharpenEnabled || state.autoEnhanceEnabled)) {
        applyEnhancements(canvas);
    }

    return canvas;
}

function getDataUrlSize(dataUrl) {
    // Calculate actual byte size from base64
    const base64 = dataUrl.split(',')[1];
    const padding = (base64.match(/=/g) || []).length;
    return Math.round((base64.length * 3) / 4 - padding);
}

function applyEnhancements(canvas) {
    let src = cv.imread(canvas);
    let dst = new cv.Mat();

    try {
        if (state.autoEnhanceEnabled) {
            // Auto contrast/brightness using CLAHE
            let lab = new cv.Mat();
            cv.cvtColor(src, lab, cv.COLOR_RGBA2RGB);
            let rgbMat = lab.clone();
            cv.cvtColor(rgbMat, lab, cv.COLOR_RGB2Lab);

            let channels = new cv.MatVector();
            cv.split(lab, channels);

            let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
            clahe.apply(channels.get(0), channels.get(0));

            cv.merge(channels, lab);
            cv.cvtColor(lab, dst, cv.COLOR_Lab2RGB);
            cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);

            lab.delete();
            rgbMat.delete();
            channels.delete();
            src.delete();
            src = dst.clone();
            dst = new cv.Mat();
        }

        if (state.sharpenEnabled) {
            // Unsharp mask
            let blurred = new cv.Mat();
            cv.GaussianBlur(src, blurred, new cv.Size(0, 0), 3);
            cv.addWeighted(src, 1.5, blurred, -0.5, 0, dst);
            blurred.delete();
        } else {
            src.copyTo(dst);
        }

        cv.imshow(canvas, dst);
    } finally {
        src.delete();
        dst.delete();
    }
}

function downloadAsPDF(canvas, baseName) {
    const { jsPDF } = window.jspdf;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Determine orientation
    const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
    const pdf = new jsPDF(orientation, 'px', [imgWidth, imgHeight]);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Estimate PDF size (rough approximation)
    const pdfOutput = pdf.output('blob');
    const sizeKB = Math.round(pdfOutput.size / 1024);
    let sizeSuffix;
    if (sizeKB >= 1024) {
        sizeSuffix = `_${(sizeKB / 1024).toFixed(1)}mb`;
    } else {
        sizeSuffix = `_${sizeKB}kb`;
    }

    // Add SKB suffix (hidden from preview, only in download)
    const filename = `${baseName}${sizeSuffix}SKB.pdf`;
    pdf.save(filename);

    elements.resultInfo.textContent = `Saved: ${filename} (${imgWidth}x${imgHeight})`;
}

// Batch mode
function processNextBatch() {
    state.batchIndex++;
    if (state.batchIndex < state.batchImages.length) {
        loadImage(state.batchImages[state.batchIndex]);
    } else {
        goToLanding();
    }
}
