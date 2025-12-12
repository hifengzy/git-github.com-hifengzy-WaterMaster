import { _decorator, Component, Node } from 'cc';
import { levelConfig } from './Config';
import { Bottle } from './Bottle';
import { Box } from './Box';
import { UI } from './UI';
const { ccclass, property } = _decorator;

/**
 * 初始化脚本
*/

@ccclass('Init')
export class Init extends Component {

    // 定义关卡名
    levelName: string = '2'

    start() {
        const currentBottleCount = levelConfig[this.levelName].currentBottleCount
        const bottlePosition = levelConfig[this.levelName].bottlePosition
        const newBottlePosition = levelConfig[this.levelName].newBottlePosition
        const waterColor = levelConfig[this.levelName].waterColor
        const boxColorList = levelConfig[this.levelName].boxColorList
        // 初始化水瓶
        this.node.getChildByName('Bottles').getComponent(Bottle).getLevelData(currentBottleCount, bottlePosition, newBottlePosition, waterColor)
        // 初始化快递袋
        this.node.getChildByName('Box').getComponent(Box).getLevelData(boxColorList)
        // 初始化 UI 数据
        this.node.getComponent(UI).getUIData(waterColor.length, this.levelName) // 传入水的颜色数量（长度）和关卡名
    }

    update(deltaTime: number) {
        
    }
}

