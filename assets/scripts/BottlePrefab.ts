import { _decorator, Color, Component, Node, Sprite, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BottlePrefab')
export class BottlePrefab extends Component {

    @property(Node)
    waterNode: Node = null // 导入水的父节点，用于获取子节点

    @property(Node)
    shadowNode: Node = null // 导入阴影节点

    // 定义瓶子的初始位置
    bottlePos: Vec3 = new Vec3()
    // 定义阴影的初始位置
    shadowPos: Vec3 = new Vec3()
    // 定义瓶子是否移动的状态
    bottleIsMoving: boolean = false

    start() {
        this.initBottlePos()
        this.initShadowPos()
    }

    // 给瓶子的水设置颜色
    initWaterColor(bottleColor: Color[]){
        // 先获取所有全部水的节点
        const waterList: Node[] = this.waterNode.children
        // 遍历全部获取到的水的节点
        for (let i = 0; i < bottleColor.length; i++){
            waterList[i].getComponent(Sprite).color = bottleColor[i] // 为每个节点设置颜色
            // 同时设置水面的颜色
            waterList[i].getChildByName('Surface').getComponent(Sprite).color = this.waterSurfaceColor(bottleColor[i])
            waterList[i].active = true // 被设置颜色的节点，设置为可见
            if(i === bottleColor.length - 1){ // 如果是最后一份水的颜色，则设置水面可见
                waterList[i].getChildByName('Surface').active = true
            }
        }
    }

    // 水面颜色调制
    waterSurfaceColor(color: Color){ // 传入水的原始颜色
        const mixColor: Color = new Color(255, 255, 255, 255) // 定义混合颜色
        return Color.lerp(new Color(), color, mixColor, 0.2) // 返回混合之后的颜色
    }

    // 初始化瓶子位置
    initBottlePos(){
        this.bottlePos = this.node.getPosition() // 本地坐标
        console.log('初始化瓶子位置：' + this.bottlePos)
    }

    // 初始化阴影位置
    initShadowPos(){
        this.shadowPos = this.shadowNode.getWorldPosition() // 世界坐标
        console.log('初始化阴影位置：' + this.shadowPos)
    }

    // 瓶子抬起动作
    bottleUp(){
        if(!this.bottleIsMoving){
            this.node.setPosition(this.node.x, this.node.y + 50, 0) // 瓶子 y 轴增加 50
            this.shadowNode.setWorldPosition(this.shadowPos.x + 15, this.shadowPos.y + 30, 0) // 阴影 y 轴增加 50
            this.bottleIsMoving = true
        }else{
            this.node.setPosition(this.bottlePos)
            this.shadowNode.setWorldPosition(this.shadowPos)
            this.bottleIsMoving = false
        }
    }


    update(deltaTime: number) {
        
    }
}

