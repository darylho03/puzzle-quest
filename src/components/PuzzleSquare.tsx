'use client';

import React, { ReactNode } from 'react';

type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none';

interface BorderSide {
  width?: number;
  color?: string;
  style?: BorderStyle;
}

export interface BorderConfig {
  top?: BorderSide;
  right?: BorderSide;
  bottom?: BorderSide;
  left?: BorderSide;
}

export interface CornerPatch {
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: number;
  color: string;
}

export interface CssLayer {
  background?: string;
  borders?: BorderConfig;
  borderRadius?: number;
  opacity?: number;
  boxShadow?: string;
  cornerPatches?: CornerPatch[];
}

interface PuzzleSquareProps {
  baseTile?: string;
  overlays?: string[];
  cssBase?: CssLayer;
  cssOverlays?: CssLayer[];
  size?: number;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  tabIndex?: number;
}

function borderSideToShadow(side: BorderSide, inset: string): string {
  const w = side.width ?? 1;
  const color = side.color ?? 'black';
  return `inset ${inset.replace('W', String(w))} ${color}`;
}

function bordersToBoxShadow(borders: BorderConfig | undefined): string | undefined {
  if (!borders) return undefined;
  const dark: string[] = [];
  const light: string[] = [];
  const sides: [BorderSide | undefined, string][] = [
    [borders.top, '0 Wpx 0 0'],
    [borders.bottom, '0 -Wpx 0 0'],
    [borders.left, 'Wpx 0 0 0'],
    [borders.right, '-Wpx 0 0 0'],
  ];
  for (const [side, inset] of sides) {
    if (!side) continue;
    const shadow = borderSideToShadow(side, inset);
    const color = side.color ?? 'black';
    if (color === 'black' || color === '#000' || color === '#000000') {
      dark.push(shadow);
    } else {
      light.push(shadow);
    }
  }
  const all = [...dark, ...light];
  return all.length > 0 ? all.join(', ') : undefined;
}

function cssLayerToFill(layer: CssLayer, size: number, zIndex: number): React.CSSProperties {
  const borderShadow = bordersToBoxShadow(layer.borders);
  const combinedShadow = [borderShadow, layer.boxShadow].filter(Boolean).join(', ') || undefined;
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: size,
    height: size,
    boxSizing: 'border-box',
    pointerEvents: 'none',
    zIndex,
    background: layer.background,
    borderRadius: layer.borderRadius,
    opacity: layer.opacity,
    boxShadow: combinedShadow,
  };
}

export default function PuzzleSquare({
  baseTile,
  overlays = [],
  cssBase,
  cssOverlays = [],
  size = 64,
  children,
  className,
  style,
  onClick,
  onMouseDown,
  onMouseEnter,
  onKeyDown,
  onContextMenu,
  draggable,
  onDragStart,
  onDrop,
  onDragOver,
  tabIndex,
}: PuzzleSquareProps) {
  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: size,
    height: size,
    pointerEvents: 'none',
    imageRendering: 'pixelated',
  };

  let layerIndex = 0;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        ...style,
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onKeyDown={onKeyDown}
      onContextMenu={onContextMenu}
      draggable={draggable}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
      tabIndex={tabIndex}
      role={onClick ? 'button' : undefined}
    >
      {/* Base layer: image or CSS */}
      {baseTile && (
        <img src={baseTile} alt="" style={{ ...imgStyle, zIndex: layerIndex++ }} />
      )}
      {!baseTile && cssBase && (
        <div style={cssLayerToFill(cssBase, size, layerIndex++)} />
      )}

      {/* Inner-corner patches */}
      {cssBase?.cornerPatches?.map((patch, i) => {
        const pos: React.CSSProperties = {
          position: 'absolute',
          width: patch.size,
          height: patch.size,
          background: patch.color,
          zIndex: layerIndex,
          pointerEvents: 'none',
        };
        if (patch.corner.includes('top')) pos.top = 0;
        else pos.bottom = 0;
        if (patch.corner.includes('left')) pos.left = 0;
        else pos.right = 0;
        return <div key={`corner-${i}`} style={pos} />;
      })}

      {/* Image overlays */}
      {overlays.map((src) => (
        <img key={src} src={src} alt="" style={{ ...imgStyle, zIndex: layerIndex++ }} />
      ))}

      {/* CSS overlays */}
      {cssOverlays.map((layer, i) => (
        <div key={i} style={cssLayerToFill(layer, size, layerIndex++)} />
      ))}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: layerIndex,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}
