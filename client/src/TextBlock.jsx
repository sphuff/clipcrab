import React, {Component, useState, useEffect} from 'react';
import * as PIXI from 'pixi.js';
import { ease, Ease } from 'pixi-ease'
import { getXPos, getYPos } from './utils';

export default class TextBlock extends Component {

    animateTextBlocks(textBlocks, seekTo = 0) {
        const { pixiApp, alignX, alignY, fontSize, lineHeight, pauseAt, animation, x: startingX, y: startingY, width, fps } = this.props;
        const { stage, renderer } = pixiApp;

        const containerHeight = renderer.screen.height;
        this.textAnimations = [];

        PIXI.BitmapFont.from("Nunito", {
            fill: "#FFFFFF",
        }, {
            chars: [
                ['a', 'z'],
                ['0', '9'],
                ['A', 'Z'],
                ' .,\'!?'
            ],
        });
        let ticker = new PIXI.Ticker();

        {textBlocks.map((textBlock, idx) => {
            const {
                text,
                startTime,
                endTime,
            } = textBlock;
            
            const textEl = this.drawText(text);
            this.textAnimations.push(textEl);
            let destY = getYPos(startingY, alignY, pixiApp);

            const startTimeWithSeek = startTime - seekTo;
            const endTimeWithSeek = endTime - seekTo;
            if (animation === 'fadeInOut') {
                this.animateTextFadeInOut(ticker, startTimeWithSeek, endTimeWithSeek, destY, textEl, fps, containerHeight, idx);
            } else {
                this.animateText(startTimeWithSeek, endTimeWithSeek, textEl, destY);
            }

        })}

        ticker.start();
    }

    animateTextFadeInOut(ticker, startTime, endTime, destY, textEl, fps, containerHeight, idx) {
        const animationStartTime = (1000 * startTime) + (1000 * idx);
        const animTime = 1000;
        let destAlpha = 1;
        textEl.y = destY - 100;
        const newEase = new Ease({
            maxFrame: fps,
            ticker: ticker,
        });
        const fadeIn = newEase.add(textEl, {
            y: destY,
            alpha: destAlpha,
        }, {
            ease: 'easeInQuad',
            duration: animTime,
            wait: animationStartTime,
        });

        fadeIn.once('complete', () => {
            const fadeOutStart = endTime * 1000 - startTime * 1000 - animTime;

            newEase.add(textEl, {
                y: containerHeight,
                alpha: 0,
            }, {
                ease: 'easeOutQuad',
                duration: animTime,
                wait: fadeOutStart,
            });
        });
    }

    animateText(startTime, endTime, textEl, destY) {
        let currentTime = 0;
        let newTicker = new PIXI.Ticker();
        textEl.y = destY;
        const tick = () => {
            currentTime += newTicker.elapsedMS;
            if (currentTime > (startTime * 1000)) {
                textEl.alpha = 1;
            } 
            if (currentTime > (endTime * 1000)) {
                textEl.alpha = 0;
                newTicker.destroy();
            }
        }
        newTicker.add(() => {
            tick();
        }, this);
        newTicker.start();
    }

    componentDidUpdate(props) {
        const { restartSound, pauseAt, alignY, y: startingY, textBlocks, seekTo, pixiApp, pixiApp: { stage }} = this.props;
        console.log('text block animate');
        if (!stage) return;
        let textBlocksToAnimate = textBlocks;
        if (props.seekTo !== seekTo) {
            // only get text blocks past seekTo
            textBlocksToAnimate = textBlocks.filter(block => block.startTime >= seekTo);
        }
        this.textAnimations && this.textAnimations.map(textEl => {
            stage.removeChild(textEl);
        });
        if (pauseAt !== null) {
            // start < pause < end
            let textBlockToAnimate = textBlocks.filter(block => block.startTime <= pauseAt && pauseAt <= block.endTime).shift();
            console.log(pauseAt, textBlocks, textBlockToAnimate);
            const y = getYPos(startingY, alignY, pixiApp);
            // if textblock undefined - you have stopped between animations
            if (textBlockToAnimate) {
                const textEl = this.drawText(textBlockToAnimate.text, y, true);
                this.textAnimations.push(textEl);
            }
            return;
        }
        this.animateTextBlocks(textBlocksToAnimate, seekTo);
    }

    drawText(text, y = null, isVisible = false) {
        const { pixiApp, alignX, alignY, fontSize, lineHeight, pauseAt, x: startingX, y: startingY, width } = this.props;
        const { stage } = pixiApp;
        const basicText = new PIXI.Text(text, {
            fontFamily: 'Nunito',
            fontSize: fontSize || 36,
            wordWrap: true,
            wordWrapWidth: width,
            fill: '#FFFFFF',
            align: 'center',
            lineHeight: lineHeight || 50,
        });

        basicText.x = getXPos(startingX, alignX, pixiApp);
        basicText.zIndex = 1;

        if (y) {
            basicText.y = y;
        }
        
        basicText.alpha = isVisible ? 1 : 0;
        basicText.anchor.set(0.5, 0);

        stage.addChild(basicText);
        return basicText;
    }
    
    render() {
        return null;
    }
}