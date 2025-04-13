import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface DrawingCanvasProps {
  onCanvasDataUrl?: (dataUrl: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onCanvasDataUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  useEffect(() => {
    if (onCanvasDataUrl && canvasRef.current) {
      const timeoutId = setTimeout(() => {
        const dataUrl = canvasRef.current?.toDataURL('image/png');
        if (dataUrl) {
          onCanvasDataUrl(dataUrl);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isDrawing, onCanvasDataUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      context.beginPath();
      context.moveTo(
        e.nativeEvent.offsetX, 
        e.nativeEvent.offsetY
      );
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      context.lineTo(
        e.nativeEvent.offsetX, 
        e.nativeEvent.offsetY
      );
      context.stroke();
    }
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      context.closePath();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context && canvas) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      if (onCanvasDataUrl) {
        const dataUrl = canvas.toDataURL('image/png');
        onCanvasDataUrl(dataUrl);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-4 mb-4">
        <input 
          type="color" 
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-10 p-0 border-none"
        />
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-32"
        />
        <Button variant="outline" onClick={clearCanvas}>
          Clear Canvas
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-2 border-gray-300 rounded-lg bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
    </div>
  );
};

export default DrawingCanvas;
