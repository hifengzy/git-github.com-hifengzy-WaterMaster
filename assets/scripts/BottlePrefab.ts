import { PourWater } from './PourWater';
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
            // 节点层级置顶
            this.node.setSiblingIndex(this.node.parent.children.length - 1)
            this.bottleIsMoving = true
        }else{
            this.node.setPosition(this.bottlePos)
            this.shadowNode.setWorldPosition(this.shadowPos)
            this.bottleIsMoving = false
        }
    }

    // 获取当前瓶子的抬起状态
    getBottleIsMoving(){
        return this.bottleIsMoving
    }

    // 获取当前瓶子里面水的数量
    getWaterCount(){
        // 遍历子节点可见节点数，即为当前瓶子里水的数量
        let waterCount = 0
        for(let waterNode of this.waterNode.children){
            if(waterNode.active){
                waterCount++
            }
        }
        return waterCount
    }

    // 获取当前瓶子最上层水体的颜色
    getTopWaterColor(){
        // 倒序遍历子节点，找到最后一个可见状态的子节点，并获得它的颜色属性
        const waterNodeReverse = [...this.waterNode.children].reverse()
        for(let node of waterNodeReverse){
            if(node.active){
                return node.getComponent(Sprite).color
            }
        }
        return null // 如果没有可见的子节点，返回 null
    }

    // 获取当前瓶子顶层相同颜色水体的数量
    getTopWaterCount(pourWaterColor: Color){ // 传入已抬起瓶子的顶层水的颜色
        const waterNodeReverse = [...this.waterNode.children].reverse() 
        let topWaterCount = 0 // 对瓶子中的水进行计数
        for(let node of waterNodeReverse){ // 倒序遍历瓶子中的水
            if(node.active){ // 如果有水
                const color = node.getComponent(Sprite).color // 获取水的颜色
                if(pourWaterColor.equals(color)){ // 如果倒入的水的颜色与被遍历的水的颜色相同
                    topWaterCount++ // 计数+1
                }else{
                    return topWaterCount // 如果发现了不一样颜色的水，就返回计数
                }
            }
        }
        return topWaterCount // 如果所有水的颜色都一致，返回计数
    }

    // 隐藏影子
    hideShadow(){
        this.shadowNode.active = false
    }


    update(deltaTime: number) {
        
    }
}

