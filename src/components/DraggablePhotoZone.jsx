import { useState, useRef, useEffect, useCallback } from 'react';

const DraggablePhotoZone = ({ zone, index, onUpdate, templateWidth, templateHeight, containerWidth }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, zoneX: 0, zoneY: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Calculate scale factor
  const scale = containerWidth / templateWidth;

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = (e.clientX - dragStartPos.current.x) / scale;
      const deltaY = (e.clientY - dragStartPos.current.y) / scale;
      
      const newX = Math.max(0, Math.min(templateWidth - zone.width, dragStartPos.current.zoneX + deltaX));
      const newY = Math.max(0, Math.min(templateHeight - zone.height, dragStartPos.current.zoneY + deltaY));
      
      onUpdate(index, { ...zone, x: Math.round(newX), y: Math.round(newY) });
    } else if (isResizing) {
      const deltaX = (e.clientX - resizeStartPos.current.x) / scale;
      const deltaY = (e.clientY - resizeStartPos.current.y) / scale;
      
      const newWidth = Math.max(50, Math.min(templateWidth - zone.x, resizeStartPos.current.width + deltaX));
      const newHeight = Math.max(50, Math.min(templateHeight - zone.y, resizeStartPos.current.height + deltaY));
      
      onUpdate(index, { ...zone, width: Math.round(newWidth), height: Math.round(newHeight) });
    }
  }, [isDragging, isResizing, zone, scale, templateWidth, templateHeight, index, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleDragStart = (e) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      zoneX: zone.x,
      zoneY: zone.y,
    };
    e.preventDefault();
    e.stopPropagation();
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: zone.width,
      height: zone.height,
    };
    e.preventDefault();
    e.stopPropagation();
  };

  // Add global mouse event listeners when dragging or resizing
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`absolute border-4 border-red-500 bg-red-500/20 flex items-center justify-center select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        left: `${(zone.x / templateWidth) * 100}%`,
        top: `${(zone.y / templateHeight) * 100}%`,
        width: `${(zone.width / templateWidth) * 100}%`,
        height: `${(zone.height / templateHeight) * 100}%`,
        transform: `rotate(${zone.rotation}deg)`,
      }}
      onMouseDown={handleDragStart}
    >
      <span className="text-white font-bold text-sm bg-red-500 px-2 py-1 rounded pointer-events-none">
        Photo {index + 1}
      </span>
      
      {/* Resize handle - larger and more visible */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-6 h-6 bg-white border-2 border-red-500 cursor-nwse-resize hover:bg-red-100 z-10"
        style={{ borderRadius: '0 0 4px 0' }}
        onMouseDown={handleResizeStart}
      />
      
      {/* Corner indicators */}
      <div className="absolute top-0 left-0 w-3 h-3 bg-white border-2 border-red-500 rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 bg-white border-2 border-red-500 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 bg-white border-2 border-red-500 rounded-full pointer-events-none" />
    </div>
  );
};

export default DraggablePhotoZone;
