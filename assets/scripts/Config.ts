/**
 * 游戏配置文件，含颜色、关卡配置
*/

import { Color, v3 } from "cc";

type ColorConfig = {
    Blue: [Color, string];
    L_Blue: [Color, string];
    Red: [Color, string];
    Yellow: [Color, string];
    Green: [Color, string];
    Origin: [Color, string];
    Purple: [Color, string];
}

export const colorConfig: ColorConfig = { // 颜色配置
    Blue: [new Color(33, 77, 244, 255), 'Blue'],
    L_Blue: [new Color(19, 153, 185, 255), 'L_Blue'],
    Red: [new Color(238, 46, 46, 255), 'Red'],
    Yellow: [new Color(221, 207, 26, 255), 'Yellow'],
    Green: [new Color(29, 180, 25, 255), 'Green'],
    Origin: [new Color(243, 111, 54, 255), 'Origin'],
    Purple: [new Color(68, 12, 142, 255), 'Purple']
}

export const levelConfig = { // 关卡配置
    1: {
        currentBottleCount: 5, // 瓶子数量
        bottlePosition: [v3(-100, 200), v3(100, 200), v3(-200, -70), v3(0, -70), v3(200, -70)], // 瓶子位置
        newBottlePosition: [v3(-280, 200), v3(300, 200)],
        waterColor: [colorConfig.L_Blue[0], colorConfig.Red[0], colorConfig.Yellow[0]], // 水颜色
        boxColorList: [colorConfig.L_Blue[1], colorConfig.Red[1], colorConfig.Yellow[1]] // 快递袋颜色
    },
    2: {
        currentBottleCount: 10, // 瓶子数量
        bottlePosition: [v3(80, 300), v3(-100, 300), v3(-280, 300), v3(260, 300), v3(80, 50), v3(-100, 50), v3(-280, 50), v3(260, 50), v3(-100, -200), v3(-280, -200)], // 瓶子位置
        newBottlePosition: [v3(80, -200), v3(270, -200)],
        waterColor: [colorConfig.L_Blue[0], colorConfig.Red[0], colorConfig.Yellow[0], colorConfig.Green[0], colorConfig.Origin[0], colorConfig.Purple[0], colorConfig.Blue[0], colorConfig.Purple[0], colorConfig.Origin[0]], // 水颜色
        boxColorList: [colorConfig.L_Blue[1], colorConfig.Red[1], colorConfig.Yellow[1], colorConfig.Green[1], colorConfig.Origin[1], colorConfig.Purple[1], colorConfig.Blue[1], colorConfig.Purple[1], colorConfig.Origin[1]] // 快递袋颜色
    }
}
