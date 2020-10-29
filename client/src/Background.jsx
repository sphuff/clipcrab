import { useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';

export default function Background ({ stage, width, height, hexColor, backgroundImage }) {
    const [backgroundImageSprite, setBackgroundImageSprite] = useState(null);
    
    useEffect(() => {
        if (!stage || !hexColor) return;
        const graphics = new PIXI.Graphics();
        stage.addChild(graphics);
        graphics.beginFill(hexColor);
        graphics.drawRect(0, 0, width, height);
        graphics.endFill();
        graphics.zIndex = 2;
    }, [stage, width, height, hexColor]);

    useEffect(() => {
        if (!stage || !backgroundImage) return;
        if (backgroundImageSprite) {
            stage.removeChild(backgroundImageSprite);
        }
        let imageSprite = PIXI.Sprite.from(backgroundImage);
        stage.addChild(imageSprite);
        imageSprite.x = 0;
        imageSprite.y = 0;
        imageSprite.anchor.set(0, 0);

        const img = new Image();
        img.src = backgroundImage;
        img.onload = function() {
            const aspectRatio = this.height / this.width;
            imageSprite.width = height / aspectRatio;
            imageSprite.height = height;
        }
        imageSprite.zIndex = 2;
        setBackgroundImageSprite(imageSprite);
    }, [stage, backgroundImage, height]);

    return null;
}