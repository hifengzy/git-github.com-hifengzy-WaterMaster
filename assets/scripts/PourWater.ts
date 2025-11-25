import { _decorator, Color, Component, director, Node, tween, Vec3 } from 'cc';
import { BottlePrefab } from './BottlePrefab';
import { Anim } from './Anim';
const { ccclass, property } = _decorator;

// 倒水行为控制脚本

@ccclass('PourWater')
export class PourWater extends Component {

    color: Color = new Color() // 已抬起的瓶子的顶层颜色
    pourBottleNode: Node = null // 倒水瓶子节点
    recBottleNode: Node = null // 接水瓶子节点
    pourPrefab = null // 倒水预制体脚本（抬起的）
    recPrefab = null // 接水预制体脚本
    anim = null // 动画脚本
    waterCount: number = 0 // 实际倒入数量
    startWaterCount: number = 0 // 已抬起瓶子，开始倒水时瓶子中的水的数量（瓶子当前的水体数量）
    stopWaterCount: number = 0 // 已抬起瓶子，停止倒水时瓶子中的水的数量（倒完水之后的剩余水体数量）

    start() {

    }
    
    // 获取倒水动作产生的数据（倒水节点、接水节点、倒水瓶子的水的颜色），保存给成员变量，可以在当前脚本的其他方法中使用
    getPourData(pourBottleNode, recBottleNode, color){
        this.pourBottleNode = pourBottleNode
        this.recBottleNode = recBottleNode
        this.color = color
        this.pourPrefab = this.pourBottleNode.getComponent(BottlePrefab)
        this.recPrefab = this.recBottleNode.getComponent(BottlePrefab)
        this.anim = this.pourBottleNode.getChildByName('Body').getComponent(Anim)
    }

    /**
     * 1. 获取接水瓶子允许接收的水体数量（剩余空位）
     * 2. 获取倒水瓶子可以倒入的水体数量（同色水体）
     * 3. 计算最终可以倒入的水体数量
     * **/
    // 倒水动作逻辑
    setPourWater(){
        const recWaterCount = 4 - this.recPrefab.getWaterCount()
        console.log('目标瓶子可接收数量：', recWaterCount)
        const pourWaterCount = this.pourPrefab.getTopWaterCount(this.color)
        console.log('抬起的瓶子可倒入数量：', pourWaterCount)
        // 如果可接收的位置大于或等于倒入水体数量，则可倒入的数量就是pourWaterCount，否则可倒入的数量就是recWaterCount
        if(recWaterCount - pourWaterCount >= 0){
            this.waterCount = pourWaterCount
            console.log('可接收大于待倒入，实际可倒入数量：', this.waterCount)
        }else{
            this.waterCount = recWaterCount
            console.log('可接收位置不足，实际可倒入数量：', this.waterCount)
        }
        // 隐藏影子
        this.pourPrefab.hideShadow()
        this.pourPrep()
    }

    // 倒水动作开始，已抬起瓶子移动到目标
    pourPrep(){
        // 开始倒水时瓶子中水的数量
        this.startWaterCount = this.pourPrefab.getWaterCount()
        // 倒水停止时瓶子中剩余水的数量，原数量 - 倒掉的数量
        this.stopWaterCount = this.pourPrefab.getWaterCount() - this.waterCount
        // 播放倒水动画
        this.anim.playAnim()
        // 瓶子移动到目标位置
        tween(this.pourBottleNode).to(0.5, {position: new Vec3(this.recBottleNode.position.x + 20, this.recBottleNode.position.y + 200, this.recBottleNode.position.z)}).call(() => {
            console.log('开始倒水')
            // 开始倒水
            this.pourStart()
        }).start()
    }

    /**
     * 1. 开启停止倒水的监听
     * 2. 继续播放倒水动画
     * - 开启自定义监听事件：director.on('事件名', 触发函数, this)
     * - 触发自定义监听事件：director.emit('事件名' ?参数)
     * **/
    // 开始倒水
    pourStart(){
        // 开启停止倒水的监听
        director.on('停止', this.stopPour, this)
        this.anim.resumeAnim()
        if(this.startWaterCount == 4){
            console.log('开始装水') // 如果是满瓶状态，直接显示水柱
        }
    }

    // 停止倒水
    stopPour(num){
        console.log('剩余水量', num)
        if(num == this.startWaterCount){
            console.log('开始倒水') // 显示水柱
        }
        if(num == this.stopWaterCount){
            this.anim.pauseAnim()
            console.log('倒水完成') // 隐藏水柱
        }
    }

    update(deltaTime: number) {
        
    }
}

