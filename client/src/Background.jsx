import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';

export default function Background ({pixiApp, hexColor}) {
    useEffect(() => {
        if (!pixiApp) return;
        const { stage, renderer: { screen: { width, height } } } = pixiApp;
        const graphics = new PIXI.Graphics();
        stage.addChild(graphics);
        graphics.beginFill(hexColor);
        graphics.drawRect(0, 0, width, height);
        graphics.endFill();
    }, [pixiApp, hexColor]);

    return null;
}