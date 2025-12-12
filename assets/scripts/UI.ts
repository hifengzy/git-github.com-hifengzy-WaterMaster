import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * UI 控制脚本
 */

@ccclass('UI')
export class UI extends Component {

    @property(Label) // 导入剩余颜色数量
    remainColorCountLabel: Label = null
    @property(Label) // 导入关卡
    levelLabel: Label = null

    // 定义剩余颜色数量
    remainColorCount: number = 0

    start() {

    }

    // 获取剩余颜色和关卡数据，从 Init 脚本中调用本函数
    getUIData( remainColorCount: number, level: string){
        this.remainColorCount = remainColorCount
        this.remainColorCountLabel.string = remainColorCount.toString()
        this.levelLabel.string = '第 ' + level + ' 关'
    }

    // 更新剩余颜色数量
    updateRemainColorCount(){
        this.remainColorCount --
        this.remainColorCountLabel.string = this.remainColorCount.toString()
    }

    update(deltaTime: number) {
        
    }
}