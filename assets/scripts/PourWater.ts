import { _decorator, Color, Component, director, Node, tween, Vec3, Animation } from 'cc';
import { BottlePrefab } from './BottlePrefab';
import { Anim } from './Anim';
import { FillWater } from './FillWater';
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
        let x = this.recBottleNode.position.x + 20
        // 当倒水瓶子的 x 轴坐标大于接水瓶子的 x 轴坐标时，开启瓶子镜像
        if(this.pourBottleNode.position.x > this.recBottleNode.position.x){
            x = this.recBottleNode.position.x - 20
            this.pourPrefab.onBottleMirror() // 开启瓶子镜像
        }
        // 隐藏影子
        this.pourPrefab.hideShadow()
        this.pourPrep(x)
    }

    // 倒水动作开始，已抬起瓶子移动到目标
    pourPrep(x){
        // 开始倒水时瓶子中水的数量
        this.startWaterCount = this.pourPrefab.getWaterCount()
        // 倒水停止时瓶子中剩余水的数量，原数量 - 倒掉的数量
        this.stopWaterCount = this.pourPrefab.getWaterCount() - this.waterCount
        // 播放倒水动画
        this.anim.playAnim()
        // 瓶子移动到目标位置
        tween(this.pourBottleNode).to(0.5, {position: new Vec3(x, this.recBottleNode.position.y + 200, this.recBottleNode.position.z)}).call(() => {
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
        // 调用装水逻辑
        this.node.getComponent(FillWater).getFillWaterData(this.recBottleNode, this.waterCount, this.color)
        // 开启停止倒水的监听
        director.on('停止', this.stopPour, this)
        this.anim.resumeAnim()
        if(this.startWaterCount == 4){
            console.log('开始装水') // 如果是满瓶状态，直接显示水柱
            this.node.getComponent(FillWater).startFillWater()
        }
    }

    // 停止倒水
    stopPour(num){
        console.log('剩余水量', num)
        if(num == this.startWaterCount){
            console.log('开始倒水') // 显示水柱
            this.node.getComponent(FillWater).startFillWater()
        }
        if(this.startWaterCount != 0){ // 如果不是空瓶，可以倒水
            this.pourPrefab.hidePourWater(num) // 隐藏倒出的水体
        }
        if(num == this.stopWaterCount){ // 如果瓶子里的水剩余数量等于停止倒水时的数量，说明倒水动作完成
            // this.anim.pauseAnim() // 暂停倒水动画
            console.log('倒水完成')
            this.bottleReset() // 瓶子回正
            if(num == 0){ // 如果瓶子里的水剩余0，倒光了，就不再显示水面
                return
            }
            this.pourPrefab.showWaterSurface(num)  // 显示瓶子中剩余水体的水面
        }
    }

    // 瓶子回正方法
    bottleReset(){
        // 将当前已抬起瓶子的层级修改为最顶层，防止遮挡
        this.pourBottleNode.setSiblingIndex(this.pourBottleNode.parent.children.length - 1)
        this.anim.isBottleReset = true
        // 倒水动画反向播放
        this.anim.reverseAnim()
        /**
         * 方案一：利用动画监听实现瓶子归位
         * **/
        // 开启动画监听
        this.anim.pourAnim.on(Animation.EventType.FINISHED, this.bottleResetFinish, this)
        // 瓶子平移
        tween(this.pourBottleNode).to(0.5, {position: new Vec3(this.pourPrefab.bottlePos)}).start()
        /**
         * 方案二：利用 tween 回调函数实现瓶子归位
         * **/
        /* // 瓶子恢复到初始位置
        tween(this.pourBottleNode).to(0.5, {position: new Vec3(this.pourPrefab.bottlePos)}).call(() => {
            // 瓶子的回正状态设置为 false
            this.anim.isBottleReset = false
            // 瓶子的抬起状态设置为 false
            this.pourPrefab.bottleIsMoving = false
            // 瓶子阴影设置为显示
            this.pourPrefab.showShadow()
            // 开启瓶子的触摸监听
            director.emit('倒水完成')
        }).start() */
    }

    // 动画监听回调
    bottleResetFinish(){
        // 移除动画监听
        this.anim.pourAnim.off(Animation.EventType.FINISHED, this.bottleResetFinish, this)
        this.anim.isBottleReset = false
        this.pourPrefab.bottleIsMoving = false
        this.pourPrefab.offBottleMirror() // 关闭镜像
        this.pourPrefab.showShadow()
        director.emit('倒水完成')
    }

    update(deltaTime: number) {
        
    }
}

