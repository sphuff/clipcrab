import { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { getXPos } from './utils';

export default function CoverImage({icon, pixiApp, ...props}) {
    useEffect(() => {
        console.log('COVER', pixiApp);
        if (!pixiApp) {
            return;
        }
        const { x, y, width, alignX } = props;

        if (!icon) return;

        const iconSprite = PIXI.Sprite.from(icon);
        const xPos = getXPos(x, alignX, pixiApp);
        iconSprite.x = xPos;
        iconSprite.y = y;

        const img = new Image();
        img.src = icon;
        img.onload = function() {
            const MAX_WIDTH = width;
            iconSprite.height = this.height;
            iconSprite.width = this.width;
            const aspectRatio = this.height / this.width;
            if (this.width > MAX_WIDTH) {
                iconSprite.width = MAX_WIDTH;
                iconSprite.height = MAX_WIDTH * aspectRatio;
            }
        }
        iconSprite.anchor.set(0.5, 0);
        iconSprite.zIndex = 2;
        pixiApp.stage.addChild(iconSprite);
    }, [icon, pixiApp, props]);
    return null;
}