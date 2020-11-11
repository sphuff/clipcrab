import { AxiosRequestConfig } from "axios";

export const getXPos = (x: number, align: string, pixiApp: any, width: number) => {
    const calculatedScreenWidth = width ? (pixiApp.screen.width / 2) - (width / 2) : pixiApp.screen.width / 2;
    const xPos = align && align === 'center' ? (calculatedScreenWidth) : x;
    return xPos;
}

export const getYPos = (y: number, align: string, pixiApp: any, height: number) => {
    const calculatedScreenHeight = height ? (pixiApp.screen.height / 2) - (height / 2) : pixiApp.screen.height / 2;
    const yPos = align && align === 'center' ? (calculatedScreenHeight) : y;
    return yPos;
}

// BUG: sometimes NaN
export const hexToRGB = (hex: string, alpha: string)  => {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

export const getRandomColorHex = () => {
    return Math.floor(Math.random()*16777215).toString(16);
}

export const makeServerURL = (path: string) => {
    return process.env.REACT_APP_BASE_URL ? `${process.env.REACT_APP_BASE_URL}${path}` : `http://localhost:3002${path}`;
}

export const getAxiosConfig = () : AxiosRequestConfig => {
    return {
        withCredentials: true,
    };
}