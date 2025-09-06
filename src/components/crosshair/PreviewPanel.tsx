'use client';

import { useState } from 'react';
import { CrosshairProfile, ViewMode } from "@/lib/crosshair-types";
import CrosshairPreview from "./CrosshairPreview";
import { ToggleGroup, ToggleGroupItem } from '@/components/retroui/ToggleGroup';
import { useIsMobile } from '@/hooks/use-mobile';

const backgroundImages = [
    'grass', 'sky', 'metall', 'blaugelb', 'yellow', 'orange', 'blue', 'green'
];

interface PreviewPanelProps {
    profile: CrosshairProfile;
    viewMode?: 'compact' | 'fullscreen';
}

export default function PreviewPanel({ profile, viewMode = 'compact' }: PreviewPanelProps) {
    const [view, setView] = useState<ViewMode>('primary');
    const [isFiring, setIsFiring] = useState(false);
    const isMobile = useIsMobile()

    const handleViewChange = (newView: string) => {
        if (!newView) return;
        if (newView === 'firing-error') {
            setView('primary');
            setIsFiring(true);
        } else {
            setView(newView as ViewMode);
            setIsFiring(false);
        }
    };

    if (viewMode === 'fullscreen') {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                
                <div className="relative z-10">
                    <CrosshairPreview profile={profile} view="primary" isFiring={false} size={500} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <ToggleGroup type="single" defaultValue="primary" onValueChange={handleViewChange} className="mb-4 justify-between shadow border">
                <ToggleGroupItem className={`${isMobile ? "px-1" : "px-3"} w-full text-nowrap`} value="primary">Primary</ToggleGroupItem>
                <ToggleGroupItem className={`${isMobile ? "px-1" : "px-3"} w-full text-nowrap`} value="firing-error">Firing Error</ToggleGroupItem>
                {!profile.general.adsUsePrimary && <ToggleGroupItem className={`${isMobile ? "px-1" : "px-3"} w-full text-nowrap`} value="ads">ADS</ToggleGroupItem>}
                <ToggleGroupItem className={`${isMobile ? "px-1" : "px-3"} w-full text-nowrap`} value="sniper">Sniper</ToggleGroupItem>
            </ToggleGroup>

            <div className={`${isMobile ? "h-[400px]" : "h-[600px]"} overflow-y-auto p-2 border-2 border-foreground rounded-none bg-background/50`}>
                <div className="grid grid-cols-2 gap-4">
                    {backgroundImages.map((bg) => (
                        <div key={bg} className="relative rounded-lg border bg-card text-card-foreground shadow-sm h-[150px] flex flex-col overflow-hidden">
                            <img src={`/assets/vcrdb-backgrounds/${bg}.webp`} alt={bg} className="absolute inset-0 w-full h-full object-cover" />
                            <div className="relative flex-grow flex items-center justify-center p-1">
                                <CrosshairPreview profile={profile} view={view} isFiring={isFiring} size={100} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
