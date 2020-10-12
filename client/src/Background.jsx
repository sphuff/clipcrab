import React, { useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';

export default function Background ({pixiApp, hexColor, backgroundImage}) {
    const [backgroundImageSprite, setBackgroundImageSprite] = useState(null);
    
    useEffect(() => {
        if (!pixiApp || !hexColor) return;
        const { stage, renderer: { screen: { width, height } } } = pixiApp;
        const graphics = new PIXI.Graphics();
        stage.addChild(graphics);
        graphics.beginFill(hexColor);
        graphics.drawRect(0, 0, width, height);
        graphics.endFill();
        graphics.zIndex = 2;
    }, [pixiApp, hexColor]);

    useEffect(() => {
        if (!pixiApp || !backgroundImage) return;
        const { stage, renderer: { screen: { width, height } } } = pixiApp;
        if (backgroundImageSprite) {
            stage.removeChild(backgroundImageSprite);
        }
        let imageSprite = PIXI.Sprite.from(backgroundImage);
        stage.addChild(imageSprite);
        imageSprite.x = 0;
        imageSprite.y = 0;

        const img = new Image();
        img.src = backgroundImage;
        img.onload = function() {
            const aspectRatio = this.height / this.width;
            imageSprite.width = width;
            imageSprite.height = width * aspectRatio;
        }
        imageSprite.zIndex = 2;
        setBackgroundImageSprite(imageSprite);
    }, [pixiApp, backgroundImage]);

    return null;
}