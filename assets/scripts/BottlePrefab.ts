import { _decorator, Color, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BottlePrefab')
export class BottlePrefab extends Component {

    @property(Node)
    waterNode: Node = null // 导入水的父节点

    start() {

    }

    // 给瓶子的水设置颜色
    setWaterColorInit(bottleColor: Color[]){
        // 先获取所有全部水的节点
        const waterList: Node[] = this.waterNode.children
        // 遍历全部获取到的水的节点
        for (let i = 0; i < bottleColor.length; i++){
            // 为每个节点设置颜色
            waterList[i].getComponent(Sprite).color = bottleColor[i]
            // 同时设置水面的颜色
            waterList[i].getChildByName('Surface').getComponent(Sprite).color = bottleColor[i]
            // 被设置颜色的节点，设置为可见
            waterList[i].active = true
            // 如果是最后一份水的颜色，则设置水面可见
            if(i === bottleColor.length - 1){
                waterList[i].getChildByName('Surface').active = true
            }
        }
    }

    update(deltaTime: number) {
        
    }
}

