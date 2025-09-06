import { CrosshairProfile, LineSettings, DotSettings } from "./crosshair-types";
import { crosshairSettingMap, defaultProfile, colorPalette } from "./crosshair-data";

function getProfileProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

function setProfileProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((o, i) => (o[i] = o[i] || {}), obj);
    target[lastKey] = value;
}

function getProfileDiff(defaultSubProfile: any, currentSubProfile: any, advancedOptions: boolean, adsUsePrimary: boolean): any {
    if ('enabled' in currentSubProfile && !currentSubProfile.enabled) {
        return defaultSubProfile.enabled ? { enabled: false } : {};
    }

    const diff: any = {};
    for (const key in currentSubProfile) {
        if (!advancedOptions && (key === 'ads' || key === 'sniper')) continue;
        if (adsUsePrimary && key === 'ads') continue;

        const defaultValue = defaultSubProfile[key];
        const currentValue = currentSubProfile[key];

        if (key === 'hexColor' && currentValue) {
            currentValue.enabled = currentSubProfile.color === 8;
        }

        if (typeof currentValue === 'object' && currentValue !== null) {
            const subDiff = getProfileDiff(defaultValue, currentValue, advancedOptions, adsUsePrimary);
            if (Object.keys(subDiff).length > 0) {
                diff[key] = subDiff;
            }
        } else if (JSON.stringify(defaultValue) !== JSON.stringify(currentValue)) {
            diff[key] = currentValue;
        }
    }
    return diff;
}

export function serializeProfile(profile: CrosshairProfile): string {
    const diff = getProfileDiff(defaultProfile, profile, profile.general.advancedOptions, profile.general.adsUsePrimary);

    if (Object.keys(diff).length === 0) return "0";

    let code = "0";
    let currentCategory = "0";

    for (const key in crosshairSettingMap) {
        const [path] = crosshairSettingMap[key];
        const value = getProfileProperty(diff, path);

        if (value !== undefined) {
            const category = key.split(':')[0];
            const subKey = key.split(':')[1];

            if (category !== currentCategory) {
                code += `;${category}`;
                currentCategory = category;
            }
            
            let valueToAppend = value;
            if (typeof valueToAppend === 'boolean') {
                valueToAppend = valueToAppend ? 1 : 0;
            }

            code += `;${subKey};${valueToAppend}`;
        }
    }

    return code;
}

function parseCodeValue(parts: string[], index: number): number | false {
    if (index + 1 >= parts.length) return false;
    const valuePart = parts[index + 1];
    if ((valuePart.length === 6 || valuePart.length === 8) && /^[0-9A-F]{6,8}$/i.test(valuePart)) {
        const hex = valuePart.length === 6 ? "FF" + valuePart : valuePart;
        return parseInt(hex, 16);
    }
    const num = parseFloat(valuePart);
    return isNaN(num) ? false : num;
}

export function deserializeCode(code: string): CrosshairProfile | null {
    if (!code.trim().startsWith('0')) {
        // console.error("Invalid crosshair code format.");
        return null;
    }

    const newProfile: CrosshairProfile = JSON.parse(JSON.stringify(defaultProfile));
    const parts = code.split(';');
    if (parts.length <= 1) return newProfile;

    let currentCategory = '0';
    const seenCategories: string[] = [];

    for (let i = 1; i < parts.length; i += 2) {
        if (['P', 'A', 'S', '0'].includes(parts[i])) {
            currentCategory = parts[i];
            if (seenCategories.includes(currentCategory)) {
                // console.error(`Duplicate category '${currentCategory}' in code. Aborting.`);
                return newProfile;
            }
            seenCategories.push(currentCategory);
            i--;
            continue;
        }

        const value = parseCodeValue(parts, i);
        if (value === false) {
            // console.warn(`Invalid or missing value for key: ${parts[i]}`);
            continue;
        }

        const key = `${currentCategory}:${parts[i]}`;
        const settingDetails = crosshairSettingMap[key];

        if (settingDetails) {
            const [path, min, max, isInteger, transformFn] = settingDetails;

            if (typeof value === 'number') {
                if (value < min || value > max) {
                    // console.warn(`Value ${value} for ${key} is out of bounds [${min}, ${max}]. Skipping.`);
                    continue;
                }
                if (isInteger && !Number.isInteger(value)) {
                    // console.warn(`Value ${value} for ${key} should be an integer. Skipping.`);
                    continue;
                }
            }

            const finalValue = transformFn ? transformFn(value) : value;
            setProfileProperty(newProfile, path, finalValue);
        } else {
            // console.warn(`Unknown crosshair key: ${key}`);
        }
    }

    if (newProfile.primary.color !== 8) {
        newProfile.primary.hexColor.value = colorPalette[newProfile.primary.color].replace('#', '') + 'FF';
    }
    if (newProfile.ads.color !== 8) {
        newProfile.ads.hexColor.value = colorPalette[newProfile.ads.color].replace('#', '') + 'FF';
    }
    if (newProfile.sniper.color !== 8) {
        newProfile.sniper.hexColor.value = colorPalette[newProfile.sniper.color].replace('#', '') + 'FF';
    }

    return newProfile;
}

export function generateRandomProfile(): CrosshairProfile {
    const newProfile: CrosshairProfile = JSON.parse(JSON.stringify(defaultProfile));
    newProfile.general.advancedOptions = false;

    const isPartVisible = (part: LineSettings | DotSettings) => {
        if (!part.enabled || part.alpha <= 0.5) return false;
        if ('length' in part && 'width' in part) {
            return part.length > 0 && part.width > 0;
        }
        if ('width' in part) {
            return part.width > 0;
        }
        return false;
    };

    const excludedRandomizationKeys = ["P:f", "P:s"];

    do {
        for (const key in crosshairSettingMap) {
            if (key.startsWith("P:") && !excludedRandomizationKeys.includes(key)) {
                const setting = crosshairSettingMap[key];
                const [path, min, max, isInteger, transformFn] = setting;

                let randomValue;
                if (isInteger) {
                    randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
                } else {
                    randomValue = parseFloat((Math.random() * (max - min) + min).toFixed(3));
                }

                const finalValue = transformFn ? transformFn(randomValue) : randomValue;
                setProfileProperty(newProfile, path, finalValue);
            }
        }
    } while (
        !isPartVisible(newProfile.primary.inner) &&
        !isPartVisible(newProfile.primary.outer) &&
        !isPartVisible(newProfile.primary.dot)
    );

    if (newProfile.primary.color !== 8) {
        newProfile.primary.hexColor.value = colorPalette[newProfile.primary.color].replace('#', '') + 'FF';
    }

    // Sync sniper color with primary color
    newProfile.sniper.color = newProfile.primary.color;
    newProfile.sniper.hexColor.value = newProfile.primary.hexColor.value;

    // Randomize other sniper settings
    for (const key in crosshairSettingMap) {
        if (key.startsWith("S:")) {
            const setting = crosshairSettingMap[key];
            const [path, min, max, isInteger, transformFn] = setting;

            // Skip color and hexColor as they are already synced
            if (path.includes('color') || path.includes('hexColor')) continue;

            let randomValue;
            if (isInteger) {
                randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
            } else {
                randomValue = parseFloat((Math.random() * (max - min) + min).toFixed(3));
            }

            const finalValue = transformFn ? transformFn(randomValue) : randomValue;
            setProfileProperty(newProfile, path, finalValue);
        }
    }

    return newProfile;
}
