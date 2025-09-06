'use client';

import { useEffect, useRef } from 'react';
import { CrosshairProfile, ViewMode } from '@/lib/crosshair-types';
import { colorPalette } from '@/lib/crosshair-data';

interface CrosshairPreviewProps {
  profile: CrosshairProfile;
  view: ViewMode;
  isFiring: boolean;
  size?: number;
}

function drawLine(
    ctx: CanvasRenderingContext2D, 
    x: number, y: number, 
    width: number, height: number, 
    outlineOptions: { enabled: boolean; alpha: number; xy: number; wh: number },
    lineAlpha: number
) {
    ctx.globalAlpha = lineAlpha;
    ctx.fillRect(x, y, width, height);
    if (outlineOptions.enabled && width !== 0 && height !== 0) {
        const originalAlpha = ctx.globalAlpha;
        ctx.globalAlpha = outlineOptions.alpha;
        ctx.strokeRect(x - outlineOptions.xy, y - outlineOptions.xy, width + outlineOptions.wh, height + outlineOptions.wh);
        ctx.globalAlpha = originalAlpha;
    }
}

function renderCrosshair(canvas: HTMLCanvasElement, profile: CrosshairProfile, view: ViewMode, isFiring: boolean) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = '#000';

    const activeView = (profile.general.adsUsePrimary && view === 'ads') ? 'primary' : view;
    const activeProfile = profile[activeView];

    switch (activeView) {
        case 'primary':
        case 'ads':
            const { outlines, dot, inner, outer, color, hexColor, overwriteFireMul } = activeProfile as any;
            
            const outlineDrawOptions = {
                enabled: outlines.enabled,
                alpha: outlines.alpha,
                xy: 0.5 * outlines.width,
                wh: 1 * outlines.width,
            };

            ctx.fillStyle = color === 8 ? `#${hexColor.value.substring(0, 6)}` : colorPalette[color];
            ctx.lineWidth = outlines.width;

            // Draw order is inner, dot, outer
            if (inner.enabled) {
                const { width, length, alpha, fireMul } = inner;
                let { offset } = inner;
                if (isFiring && fireMul.enabled && !overwriteFireMul) {
                    offset += 4;
                }
                const m = width % 2;
                const vLength = inner.vertical.enabled ? inner.vertical.length : length;
                
                drawLine(ctx, center + offset, Math.floor(center - width / 2), length, width, outlineDrawOptions, alpha);
                drawLine(ctx, center - offset - length - m, Math.floor(center - width / 2), length, width, outlineDrawOptions, alpha);
                drawLine(ctx, Math.floor(center - width / 2), center + offset, width, vLength, outlineDrawOptions, alpha);
                if (!profile.general.hideOnFire || !isFiring) {
                     drawLine(ctx, Math.floor(center - width / 2), center - offset - vLength - m, width, vLength, outlineDrawOptions, alpha);
                }
            }

            if (dot.enabled) {
                ctx.globalAlpha = dot.alpha;
                const dotSize = dot.width;
                const dotOffset = Math.ceil(dotSize / 2);
                const x = center - dotOffset;
                ctx.fillRect(x, x, dotSize, dotSize);
                if(outlines.enabled) {
                    ctx.globalAlpha = outlines.alpha;
                    ctx.strokeRect(x - outlineDrawOptions.xy, x - outlineDrawOptions.xy, dotSize + outlineDrawOptions.wh, dotSize + outlineDrawOptions.wh);
                }
            }

            if (outer.enabled) {
                const { width, length, alpha, fireMul } = outer;
                let { offset } = outer;
                if (isFiring && fireMul.enabled && !overwriteFireMul) {
                    offset += 4;
                }
                const m = width % 2;
                const vLength = outer.vertical.enabled ? outer.vertical.length : length;

                drawLine(ctx, center + offset, Math.floor(center - width / 2), length, width, outlineDrawOptions, alpha);
                drawLine(ctx, center - offset - length - m, Math.floor(center - width / 2), length, width, outlineDrawOptions, alpha);
                drawLine(ctx, Math.floor(center - width / 2), center + offset, width, vLength, outlineDrawOptions, alpha);
                if (!profile.general.hideOnFire || !isFiring) {
                    drawLine(ctx, Math.floor(center - width / 2), center - offset - vLength - m, width, vLength, outlineDrawOptions, alpha);
                }
            }
            break;

        case 'sniper':
            const sniperProfile = activeProfile as any;
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#00000055";
            ctx.fillRect(0, center - 1, size, 2);
            ctx.fillRect(center - 1, 0, 2, size);

            if (sniperProfile.dot.enabled) {
                ctx.globalAlpha = sniperProfile.dot.alpha;
                ctx.fillStyle = sniperProfile.color === 8 ? `#${sniperProfile.hexColor.value.substring(0, 6)}` : colorPalette[sniperProfile.color];
                ctx.beginPath();
                ctx.arc(center, center, 3 * sniperProfile.dot.width, 0, 2 * Math.PI);
                ctx.fill();
            }
            break;
    }
}

export default function CrosshairPreview({ profile, view, isFiring, size = 150 }: CrosshairPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && profile) {
            renderCrosshair(canvas, profile, view, isFiring);
        }
    }, [profile, view, isFiring, size]);

    return (
        <div style={{ width: size, height: size }}>
            <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: 'pixelated' }} />
        </div>
    );
}
