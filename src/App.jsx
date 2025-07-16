import React, { useState, useRef, useEffect } from 'react';

const styles = `
  body {
    margin: 0;
    padding: 0;
    background: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
}

  .cropper-container {
    width: 100%;
    max-width: 1200px;
    margin: 2rem auto;
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cropper-content-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 30px;
    margin-top: 20px;
    flex-wrap: wrap;
}

  .cropper-image-section, .cropper-controls-section {
      flex: 1;
      min-width: 300px;
  }
  .cropper-image-container {
      position: relative;
      display: inline-block;
      cursor: crosshair;
      max-width: 100%;
      border: 1px solid #ddd;
  }
  .cropper-image-display {
      max-width: 100%;
      display: block;
      user-select: none;
  }
  .cropper-crop-box {
      position: absolute;
      border: 2px dashed #e74c3c;
      box-sizing: border-box;
      pointer-events: none;
  }
  .cropper-coord-inputs label {
      display: inline-block;
      margin: 5px 10px 5px 0;
      font-weight: 500;
  }
  .cropper-coord-inputs input {
      width: 70px;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
  }
  .cropper-apply-btn {
      padding: 10px 18px;
      cursor: pointer;
      margin-top: 15px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      transition: background-color 0.3s;
  }
  .cropper-apply-btn:hover {
      background-color: #2980b9;
  }
  .cropper-preview-canvas {
      border: 1px solid #ddd;
      background-color: #f0f0f0;
  }
  .cropper-output-log {
      background-color: #2c3e50;
      color: #ecf0f1;
      border: 1px solid #ccc;
      padding: 15px;
      margin-top: 20px;
      min-height: 100px;
      white-space: pre-wrap;
      word-wrap: break-word;
      border-radius: 4px;
      font-family: "Courier New", Courier, monospace;
  }
`;

const App = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [output, setOutput] = useState(null);
  const [imageDetails, setImageDetails] = useState(null);

  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef({ x: 0, y: 0 });
  const fileInfoRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      fileInfoRef.current = { name: file.name, type: file.type };
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setOutput(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageDetails({ naturalWidth, naturalHeight });
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
  };

  const handleMouseDown = (e) => {
    if (!imageRef.current) return;
    isDrawingRef.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    startPointRef.current = { x: offsetX, y: offsetY };
    setCrop({ x: offsetX, y: offsetY, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current || !imageRef.current) return;
    const { clientWidth, clientHeight } = imageRef.current;
    const { offsetX, offsetY } = e.nativeEvent;

    const currentX = Math.max(0, Math.min(clientWidth, offsetX));
    const currentY = Math.max(0, Math.min(clientHeight, offsetY));

    const startX = startPointRef.current.x;
    const startY = startPointRef.current.y;

    setCrop({
      x: Math.min(startX, currentX),
      y: Math.min(startY, currentY),
      width: Math.abs(currentX - startX),
      height: Math.abs(currentY - startY),
    });
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCrop((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleApplyCrop = () => {
    if (crop.width > 0 && crop.height > 0 && imageDetails) {
      const result = {
        originalImage: {
          ...fileInfoRef.current,
          width: imageDetails.naturalWidth,
          height: imageDetails.naturalHeight,
        },
        cropCoordinatesOnDisplayedImage: {
          x: Math.round(crop.x),
          y: Math.round(crop.y),
          width: Math.round(crop.width),
          height: Math.round(crop.height),
        },
      };
      setOutput(JSON.stringify(result, null, 2));
      console.log(result);
    }
  };

  useEffect(() => {
    if (imageRef.current && canvasRef.current && imageDetails && crop.width > 0) {
      const image = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const scaleX = imageDetails.naturalWidth / image.clientWidth;
      const scaleY = imageDetails.naturalHeight / image.clientHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0, 0,
        canvas.width,
        canvas.height
      );
    }
  }, [crop, imageSrc, imageDetails]);

  return (
    <>
      <style>{styles}</style>
      <div className="cropper-container">
        <h1>Interactive Image Cropping UI (React) ⚛️</h1>
        <p>Upload an image, then click and drag on it to define a crop area.</p>
        <input type="file" onChange={handleFileChange} accept="image/*" />

        {imageSrc && (
          <div className="cropper-content-wrapper">
            <div className="cropper-image-section">
              <h3>Original Image</h3>
              <div
                className="cropper-image-container"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Upload"
                  onLoad={onImageLoad}
                  className="cropper-image-display"
                />
                <div
                  className="cropper-crop-box"
                  style={{
                    left: `${crop.x}px`,
                    top: `${crop.y}px`,
                    width: `${crop.width}px`,
                    height: `${crop.height}px`,
                  }}
                />
              </div>
            </div>
            <div className="cropper-controls-section">
              <h3>Coordinates & Preview</h3>
              <div className="cropper-coord-inputs">
                <label>X: <input type="number" name="x" value={Math.round(crop.x)} onChange={handleInputChange} /></label>
                <label>Y: <input type="number" name="y" value={Math.round(crop.y)} onChange={handleInputChange} /></label>
                <br />
                <label>W: <input type="number" name="width" value={Math.round(crop.width)} onChange={handleInputChange} /></label>
                <label>H: <input type="number" name="height" value={Math.round(crop.height)} onChange={handleInputChange} /></label>
              </div>
              <h3 style={{ marginTop: '20px' }}>Preview</h3>
              <canvas ref={canvasRef} width="200" height="200" className="cropper-preview-canvas" />
              <br />
              <button onClick={handleApplyCrop} className="cropper-apply-btn">Apply Crop</button>
            </div>
          </div>
        )}

        {output && (
          <div>
            <h3>Console Output</h3>
            <pre className="cropper-output-log">{output}</pre>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
