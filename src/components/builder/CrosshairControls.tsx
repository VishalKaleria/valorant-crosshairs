'use client';

import { CrosshairProfile } from "@/lib/crosshair-types";
import { Accordion } from '@/components/retroui/Accordion';
import { Switch } from '@/components/retroui/Switch';
import { Label } from '@/components/retroui/Label';
import { Slider } from '@/components/retroui/Slider';
import { Input } from '@/components/retroui/Input';

interface CrosshairControlsProps {
    profile: CrosshairProfile;
    setProfile: (profile: CrosshairProfile) => void;
}

const SwitchControl = ({ label, checked, onCheckedChange }: { label: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
    <div className="flex items-center justify-between">
        <Label htmlFor={label.toLowerCase().replace(/\s/g, '-')}>{label}</Label>
        <Switch
            id={label.toLowerCase().replace(/\s/g, '-')}
            checked={checked}
            onCheckedChange={onCheckedChange}
        />
    </div>
);

const SliderControl = ({ label, value, onValueChange, min, max, step }: { label: string, value: number, onValueChange: (value: number[]) => void, min: number, max: number, step: number }) => (
    <div className="py-2 space-y-2">
        <div className="flex justify-between">
            <Label>{label}</Label>
            <span className="text-sm text-muted-foreground">{value}</span>
        </div>
        <Slider
            value={[value]}
            onValueChange={onValueChange}
            min={min}
            max={max}
            step={step}
        />
    </div>
);

const ColorControl = ({ label, onHexChange, hexValue }: { label: string, onHexChange: (e: React.ChangeEvent<HTMLInputElement>) => void, hexValue: string }) => (
    <div className="py-2 space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center space-x-2">
            <Input
                type="color"
                value={`#${hexValue.substring(0, 6)}`}
                onChange={onHexChange}
                className="w-16 h-10 p-1"
            />
            <Input
                value={`#${hexValue.substring(0, 6)}`}
                onChange={onHexChange}
                className="w-full sm:w-28 font-mono"
            />
        </div>
    </div>
);


export default function CrosshairControls({ profile, setProfile }: CrosshairControlsProps) {

    const handleProfileChange = (path: string, value: any) => {
        const newProfile = JSON.parse(JSON.stringify(profile));
        const pathParts = path.split('.');
        let current: any = newProfile;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = value;
        setProfile(newProfile);
    };

    const handleColorChange = (path: string, hexColor: string) => {
        const newProfile = JSON.parse(JSON.stringify(profile));
        const pathParts = path.split('.');
        let current: any = newProfile;
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }
        current[pathParts[pathParts.length - 1]] = hexColor.replace('#', '') + 'FF';
        // Also set color to custom (8)
        const colorPath = path.replace('hexColor.value', 'color');
        const colorPathParts = colorPath.split('.');
        let colorCurrent: any = newProfile;
        for (let i = 0; i < colorPathParts.length - 1; i++) {
            colorCurrent = colorCurrent[colorPathParts[i]];
        }
        colorCurrent[colorPathParts[colorPathParts.length - 1]] = 8;

        setProfile(newProfile);
    }

    const renderCrosshairSection = (sectionName: 'primary' | 'ads' | 'sniper') => {
        const sectionData = sectionName === 'primary' ? profile.primary : sectionName === 'ads' ? profile.ads : profile.sniper;
        const pathPrefix = sectionName;

        const renderLineControls = (lineType: 'inner' | 'outer') => {
            const lineData = (sectionData as any)[lineType];
            const linePath = `${pathPrefix}.${lineType}`;
            return (
                <Accordion.Item value={lineType}>
                    <Accordion.Header>{`${lineType.charAt(0).toUpperCase() + lineType.slice(1)} Lines`}</Accordion.Header>
                    <Accordion.Content>
                        <div className="space-y-4">
                            <SwitchControl label="Show Lines" checked={lineData.enabled} onCheckedChange={(val) => handleProfileChange(`${linePath}.enabled`, val)} />
                            <SliderControl label="Opacity" value={lineData.alpha} onValueChange={([val]) => handleProfileChange(`${linePath}.alpha`, val)} min={0} max={1} step={0.05} />
                            <SliderControl label="Thickness" value={lineData.width} onValueChange={([val]) => handleProfileChange(`${linePath}.width`, val)} min={0} max={10} step={1} />
                            <SliderControl label="Length" value={lineData.length} onValueChange={([val]) => handleProfileChange(`${linePath}.length`, val)} min={0} max={20} step={1} />
                            <SliderControl label="Offset" value={lineData.offset} onValueChange={([val]) => handleProfileChange(`${linePath}.offset`, val)} min={0} max={40} step={1} />
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            )
        }

        return (
            <Accordion type="multiple" defaultValue={['color']} className="w-full space-y-4">
                <Accordion.Item value="color">
                    <Accordion.Header>Color</Accordion.Header>
                    <Accordion.Content>
                        <ColorControl
                            label="Crosshair Color"
                            hexValue={sectionData.hexColor.value}
                            onHexChange={(e) => handleColorChange(`${pathPrefix}.hexColor.value`, e.target.value)}
                        />
                    </Accordion.Content>
                </Accordion.Item>
                {'outlines' in sectionData && (
                    <Accordion.Item value="outlines">
                        <Accordion.Header>Outlines</Accordion.Header>
                        <Accordion.Content>
                            <div className="space-y-4">
                                <SwitchControl label="Outlines" checked={(sectionData as any).outlines.enabled} onCheckedChange={(val) => handleProfileChange(`${pathPrefix}.outlines.enabled`, val)} />
                                <SliderControl label="Opacity" value={(sectionData as any).outlines.alpha} onValueChange={([val]) => handleProfileChange(`${pathPrefix}.outlines.alpha`, val)} min={0} max={1} step={0.05} />
                                <SliderControl label="Thickness" value={(sectionData as any).outlines.width} onValueChange={([val]) => handleProfileChange(`${pathPrefix}.outlines.width`, val)} min={1} max={6} step={1} />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                )}
                {'dot' in sectionData && (
                    <Accordion.Item value="center-dot">
                        <Accordion.Header>Center Dot</Accordion.Header>
                        <Accordion.Content>
                            <div className="space-y-4">
                                <SwitchControl label="Center Dot" checked={(sectionData as any).dot.enabled} onCheckedChange={(val) => handleProfileChange(`${pathPrefix}.dot.enabled`, val)} />
                                <SliderControl label="Opacity" value={(sectionData as any).dot.alpha} onValueChange={([val]) => handleProfileChange(`${pathPrefix}.dot.alpha`, val)} min={0} max={1} step={0.05} />
                                <SliderControl label="Thickness" value={(sectionData as any).dot.width} onValueChange={([val]) => handleProfileChange(`${pathPrefix}.dot.width`, val)} min={1} max={6} step={1} />
                            </div>
                        </Accordion.Content>
                    </Accordion.Item>
                )}
                {sectionName !== 'sniper' && renderLineControls('inner')}
                {sectionName !== 'sniper' && renderLineControls('outer')}
            </Accordion>
        )
    }

    return (
        <div className="w-full">
            <Accordion type="multiple" defaultValue={['general', 'primary']} className="w-full space-y-4">
                <Accordion.Item value="general">
                    <Accordion.Header>General Settings</Accordion.Header>
                    <Accordion.Content>
                        <div className="space-y-4">
                            <SwitchControl label="Use Primary for ADS" checked={profile.general.adsUsePrimary} onCheckedChange={(val) => handleProfileChange('general.adsUsePrimary', val)} />
                            <SwitchControl label="Hide on Firing Error" checked={profile.general.hideOnFire} onCheckedChange={(val) => handleProfileChange('general.hideOnFire', val)} />
                            <SwitchControl label="Follow Spectated Player" checked={profile.general.followSpectating} onCheckedChange={(val) => handleProfileChange('general.followSpectating', val)} />
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="primary">
                    <Accordion.Header>Primary Crosshair</Accordion.Header>
                    <Accordion.Content>
                        {renderCrosshairSection('primary')}
                    </Accordion.Content>
                </Accordion.Item>
                {!profile.general.adsUsePrimary && (
                    <Accordion.Item value="ads">
                        <Accordion.Header>ADS Crosshair</Accordion.Header>
                        <Accordion.Content>
                            {renderCrosshairSection('ads')}
                        </Accordion.Content>
                    </Accordion.Item>
                )}
                <Accordion.Item value="sniper">
                    <Accordion.Header>Sniper Crosshair</Accordion.Header>
                    <Accordion.Content>
                        {renderCrosshairSection('sniper')}
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}