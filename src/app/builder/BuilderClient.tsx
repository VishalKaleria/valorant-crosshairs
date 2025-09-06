
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CrosshairProfile } from '../../lib/crosshair-types';
import { generateRandomProfile, deserializeCode, serializeProfile } from '../../lib/crosshair-service';

import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Card } from '@/components/retroui/Card';
import CrosshairControls from '@/components/builder/CrosshairControls';
import PreviewPanel from '@/components/crosshair/PreviewPanel';
import { Download, Copy, Share2, Shuffle, Maximize } from 'lucide-react';

export default function BuilderClient() {
    const searchParams = useSearchParams();
    const [profile, setProfile] = useState<CrosshairProfile | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [showCopied, setShowCopied] = useState(false);
    const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
    const [currentFullScreenBackground, setCurrentFullScreenBackground] = useState('/assets/crosshair-backgrounds/frame-bg4.jpg');

    const backgroundImages = [
        '/assets/crosshair-backgrounds/frame-bg4.jpg',
        '/assets/crosshair-backgrounds/frame-bg-3.jpg',
        '/assets/crosshair-backgrounds/frame-bg2.jpg',
        '/assets/crosshair-backgrounds/frame-bg1.jpg',
    ];
    const backgroundVideo = '/assets/videos/crosshair-preview.mp4';

    useEffect(() => {
        const codeFromHash = window.location.hash.substring(1);
        let initialProfile: CrosshairProfile | null = null;

        if (codeFromHash) {
            initialProfile = deserializeCode(codeFromHash);
            if (initialProfile) {
                setInputValue(codeFromHash);
            } else {
                console.error("Failed to parse code from hash, generating random profile.");
            }
        }

        if (!initialProfile) {
            initialProfile = generateRandomProfile();
        }

        setProfile(initialProfile);
    }, [searchParams]);

    // Update hash when profile changes
    useEffect(() => {
        if (profile) {
            const code = serializeProfile(profile);
            window.location.hash = code;
        }
    }, [profile]);

    const handleRandomize = () => {
        const newProfile = generateRandomProfile();
        setProfile(newProfile);
        setInputValue('');
    };

    const handleLoadCode = () => {
        let codeToLoad = inputValue;
        // Check if the input is a URL with a hash
        try {
            const url = new URL(inputValue);
            if (url.hash) {
                codeToLoad = url.hash.substring(1);
            }
        } catch {
            // Not a valid URL, treat as plain code
        }

        const newProfile = deserializeCode(codeToLoad);
        if (newProfile) {
            setProfile(newProfile);
        } else {
            alert("Invalid crosshair code!");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        });
    };

    const handleCopyCode = () => {
        if (!profile) return;
        const code = serializeProfile(profile);
        copyToClipboard(code);
    };

    const handleShareLink = () => {
        if (!profile) return;
        const code = serializeProfile(profile);
        const url = `${window.location.origin}${window.location.pathname}#${code}`;
        copyToClipboard(url);
    };

    if (!profile) {
        return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground space-y-4">
            <h2 className="text-3xl font-bold text-center mb-8">Crosshair Builder</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Preview and Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <Card.Header>
                            <Card.Title>Crosshair Preview</Card.Title>
                        </Card.Header>
                        <Card.Content className="p-2 md:p-4">
                            <PreviewPanel profile={profile} viewMode="compact" />
                        </Card.Content>
                    </Card>


                </div>

                {/* Right Column: Crosshair Controls */}
                <div className="lg:col-span-2">
                    <Card className='pb-4'>
                        <Card.Header>
                            <Card.Title>Actions</Card.Title>
                        </Card.Header>
                        <Card.Content className="space-y-4 p-2 md:p-4">
                            <div className="flex w-full items-center space-x-2">
                                <Input
                                    type="text"
                                    placeholder="Paste Crosshair Code..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <Button type="submit" onClick={handleLoadCode}><Download className="mr-2 h-4 w-4" />Load</Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button onClick={handleCopyCode}><Copy className="mr-2 h-4 w-4" />Copy Code</Button>
                                <Button onClick={handleShareLink}><Share2 className="mr-2 h-4 w-4" />Share Link</Button>
                                <Button onClick={handleRandomize} variant="secondary"><Shuffle className="mr-2 h-4 w-4" />Randomize</Button>
                                <Button onClick={() => setShowFullScreenPreview(true)}><Maximize className="mr-2 h-4 w-4" />Full Screen</Button>
                            </div>
                        </Card.Content>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Card.Title>Crosshair Settings</Card.Title>
                        </Card.Header>
                        <Card.Content className="p-2 md:p-4">
                            <CrosshairControls profile={profile} setProfile={setProfile} />
                        </Card.Content>
                    </Card>
                </div>
            </div>

            {showCopied && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
                    Copied to clipboard!
                </div>
            )}

            {showFullScreenPreview && (
                <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
                    <button
                        className="absolute top-4 right-4 text-white text-2xl z-50"
                        onClick={() => setShowFullScreenPreview(false)}
                    >
                        &times;
                    </button>
                    <div className="relative w-full h-full flex items-center justify-center">
                        {currentFullScreenBackground && currentFullScreenBackground.endsWith('.mp4') ? (
                            <video
                                src={currentFullScreenBackground}
                                loop
                                autoPlay
                                muted
                                className="absolute inset-0 w-full h-full object-cover -z-10"
                            />
                        ) : currentFullScreenBackground ? (
                            <img
                                src={currentFullScreenBackground}
                                alt="Background"
                                className="absolute inset-0 w-full h-full object-cover -z-10"
                            />
                        ) : null}
                     
                        <PreviewPanel
                            profile={profile}
                            viewMode="fullscreen"
                        />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-50">
                        {backgroundImages.map((img, index) => (
                            <Button
                                key={index}
                                onClick={() => { setCurrentFullScreenBackground(img); }}
                                variant={currentFullScreenBackground === img ? "default" : "secondary"}
                            >
                                BG {index + 1}
                            </Button>
                        ))}
                        <Button
                            onClick={() => { setCurrentFullScreenBackground(backgroundVideo); }}
                            variant={currentFullScreenBackground === backgroundVideo ? "default" : "secondary"}
                        >
                            Video
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
