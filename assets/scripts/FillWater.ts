import { _decorator, Color, Component, Node, UITransform, tween, Vec3 } from 'cc';
import { BottlePrefab } from './BottlePrefab';
import { Bottle } from './Bottle';
import { PourWater } from './PourWater';
import { Win } from './Win';
const { ccclass, property } = _decorator;

// 装入水的控制脚本

@ccclass('FillWater')
export class FillWater extends Component {

    /**
     * 必要数据定义
     */

    // 装水瓶子的节点
    recBottleNode: Node = null
    // 装入水的数量
    waterCount: number = null
    // 装入水的颜色
    waterColor: Color = null
    // 瓶子预制体脚本
    bottlePrefab = null
    // 是否使用空瓶子装水
    useEmptyBottle: boolean = false

    // 水柱节点
    waterColumnNode: Node = null
    // 水柱标记节点
    waterColumnMarkNode: Node = null


    start() {

    }

    // 将必要数据获取到当前模块
    getFillWaterData(recBottleNode, waterCount, waterColor){
        this.recBottleNode = recBottleNode
        this.waterCount = waterCount
        this.waterColor = waterColor
        this.bottlePrefab = this.recBottleNode.getComponent(BottlePrefab) // recBottleNode 就是一个预制体
        console.log('装水数据接收完毕')
    }

    // 开始装水
    startFillWater(){
        // 设置接水瓶子的层级为最高
        this.recBottleNode.setSiblingIndex(this.recBottleNode.parent.children.length - 1)
        // 获取水柱标记节点（倒水水瓶的预制体下的 Mark 节点）
        this.waterColumnMarkNode = this.node.getComponent(PourWater).pourBottleNode.getChildByName('Body').getChildByName('Mark')
        // 获取水柱的 UI 组件
        const waterColumnUI: UITransform = this.bottlePrefab.getWaterColumnUI(this.waterColor)  // 传入一个颜色，直接获取带颜色水柱
        // 获取水柱节点
        this.waterColumnNode = waterColumnUI.node
        const topWaterUI = this.getTopWaterUI() // 获取接水瓶子的顶层水体 UI 组件
        // 根据倒入水体数量计算动画执行时长（每个水体的倒水动画是20帧，1秒60帧，所以每个水体的倒水动画时长是0.3秒）
        const time = this.waterCount * 0.33
        // 根据倒入水体数量计算水体上升高度，需要用到水体 UI
        const upHeight = this.waterCount * 40
        // （动画）计算水柱上升高度，需要用到水柱 UI
        tween(waterColumnUI).by(time, {height: -upHeight}).start()
        // （动画）计算水面上升高度，需要获取水面节点（改变 y 轴）
        const waterSurfaceNode = topWaterUI.node.getChildByName('Surface')
        tween(waterSurfaceNode).by(time, {y: upHeight}).start()
        // （动画）水体上升
        tween(topWaterUI).by(time, {height: upHeight}).call(() => {
            // 动画播放完毕后，重置水柱标记节点
            this.waterColumnMarkNode = null
            // 隐藏水柱节点
            waterColumnUI.node.active = false
            // 恢复水柱高度到原始默认值
            waterColumnUI.height = this.bottlePrefab.waterColumnOriginalHeight
            console.log('动画完成，恢复水柱高度到原始值:', waterColumnUI.height)
            // 装水结束
            this.endFillWater()
            // 恢复顶层水体节点的动画效果：
            waterSurfaceNode.active = false // 1、隐藏水面节点
            waterSurfaceNode.y = 46 // 恢复水面节点的正常高度
            topWaterUI.height = 86 // 恢复水体节点的 UI 高度
            this.useEmptyBottle = false // 恢复使用空瓶子装水状态
        }).start()
    }

    // 获取接水瓶子的顶层水体 UI 组件
    getTopWaterUI(){
        const topWaterUI = this.bottlePrefab.getTopWaterUI() // 获取顶层水体 UI
        // 如果是空瓶子，返回底部水体 UI
        if(!topWaterUI){
            this.useEmptyBottle = true
            return this.bottlePrefab.getBottomWaterUI(this.waterColor)
        }
        this.useEmptyBottle = false
        return topWaterUI
    }

    // 结束装水
    endFillWater(){
        // 装水结束后，重置水柱的标记节点
        // this.waterColumnMarkNode = null
        let waterCount = this.waterCount // 接收装水数量
        // 如果接水的是空瓶，底层水体会默认显示，那么实际隐藏的水体应该比倒入的水体数量少一个
        if(this.useEmptyBottle && waterCount == 1){
            this.useEmptyBottle = false
            return // 结束装水
        }else if(this.useEmptyBottle){
            waterCount -- 
        }
        // 显示隐藏的水体节点
        this.bottlePrefab.showWaterNode(waterCount, this.waterColor)
        const topWaterCount = this.bottlePrefab.getTopWaterCount(this.waterColor) // 获取顶层同色水体数量
        if(topWaterCount != 4){ return } // 如果顶层同色水体数量不是4，没有满瓶，直接中断，如果满瓶则继续执行下面代码
        this.node.getComponent(Bottle).removeFullBottle(this.recBottleNode) // 删除已满水的瓶子
        this.node.getComponent(Win).fullWaterComplete(this.recBottleNode, this.waterColor) // 执行该瓶子满水后的动作
        console.log('瓶子已装满')
    }

    update(deltaTime: number) {
        if(!this.waterColumnMarkNode){ return } // 如果没有标记节点，直接返回
        // 获取 Mark 节点的位置
        const markPos: Vec3 = this.waterColumnMarkNode.getWorldPosition()
        // 将标记的位置设置给水柱节点
        this.waterColumnNode.setWorldPosition(markPos)
    }
}

