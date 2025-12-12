import { PourWater } from './PourWater';
import { _decorator, Color, Component, Node, Sprite, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

// 瓶子预制体控制脚本

@ccclass('BottlePrefab')
export class BottlePrefab extends Component {

    @property(Node)
    waterNode: Node = null // 导入水的父节点，用于获取子节点

    @property(Node)
    shadowNode: Node = null // 导入阴影节点

    @property(Node)
    lightNode: Node = null // 导入光源节点

    @property(Node)
    waterColumnNode: Node = null // 导入水柱的节点

    // 保存水柱的原始默认高度
    waterColumnOriginalHeight: number = 400
    // 定义瓶子的初始位置
    bottlePos: Vec3 = new Vec3()
    // 定义阴影的初始位置
    shadowPos: Vec3 = new Vec3()
    // 定义光源的初始位置
    lightPos: Vec3 = new Vec3()
    // 定义瓶子是否移动的状态
    bottleIsMoving: boolean = false

    start() {
        this.initBottlePos()
        this.initShadowPos()
        this.initLightPos()
        // 初始化水柱的原始默认高度
        if(this.waterColumnNode) {
            this.waterColumnOriginalHeight = this.waterColumnNode.getComponent(UITransform).height
        }
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

    // 初始化光源位置
    initLightPos(){
        this.lightPos = this.lightNode.getWorldPosition()
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

    // 显示影子
    showShadow(){
        this.shadowNode.setWorldPosition(this.shadowPos) // 重置世界坐标位置
        this.shadowNode.active = true
    }

    // 隐藏掉已倒掉的水和水面
    hidePourWater(num: number){
        this.waterNode.getChildByName(String(num)).active = false
        console.log('隐藏水', num)
        this.waterNode.getChildByName(String(num)).getChildByName('Surface').active = false
        console.log('隐藏水面', num)
    }

    // 显示倒水结束后，剩余水体的水面
    showWaterSurface(num: number){
        this.waterNode.getChildByName(String(num - 1)).getChildByName('Surface').active = true
        console.log('显示水面', num - 1)
    }

    // 开启瓶子镜像方法
    onBottleMirror(){
        const pos = this.lightNode.getWorldPosition()
        this.node.setScale(-1, 1)
        this.lightNode.setScale(-1, 1)
        this.lightNode.setWorldPosition(pos)
    }

    // 关闭镜像
    offBottleMirror(){
        this.node.setScale(1, 1)
        this.lightNode.setScale(1, 1)
        this.lightNode.setWorldPosition(this.lightPos)
    }

    // 获取水柱的 UI 组件
    getWaterColumnUI(color){
        this.waterColumnNode.getComponent(Sprite).color = color
        const waterColumnUI = this.waterColumnNode.getComponent(UITransform)
        // 获取当前瓶子的剩余水位数量，用于计算水柱高度
        const waterCount = this.getWaterCount()
        // 使用保存的原始默认高度进行计算
        const waterColumnDefaultHeight = this.waterColumnOriginalHeight
        // 计算当前水柱高度
        waterColumnUI.height = waterColumnDefaultHeight - waterCount * 40
        // 显示水柱
        console.log('水柱高度', waterColumnUI.height, '原始高度', waterColumnDefaultHeight, '水量', waterCount)
        this.waterColumnNode.active = true
        return waterColumnUI
    }

    // 获取瓶子顶层水体的 UI 组件
    getTopWaterUI(){
        const waterNodeReverse = [...this.waterNode.children].reverse()
        for(let node of waterNodeReverse){
            if(node.active){
                return node.getComponent(UITransform)
            }
        }
    }

    // 获取底部水体 UI 组件，用于空瓶装水动画实现
    getBottomWaterUI(color){
        // 获取底部水体 UI 组件
        const bottomWaterUI = this.waterNode.children[0].getComponent(UITransform)
        // 获取底部水面节点
        const bottomWaterSurfaceNode = this.waterNode.children[0].getChildByName('Surface')
        // 设置水体颜色
        this.waterNode.children[0].getComponent(Sprite).color = color
        // 设置水面颜色
        bottomWaterSurfaceNode.getComponent(Sprite).color = this.waterSurfaceColor(color)
        // 设置水体高度 Height
        bottomWaterUI.height = 46
        // 设置水面 y 轴高度
        bottomWaterSurfaceNode.y = 4
        // 显示底部水体和水面
        this.waterNode.children[0].active = true
        bottomWaterSurfaceNode.active = true
        // 返回水体 UI 组件
        return bottomWaterUI
    }

    // 结束装水后，显示隐藏的水体节点
    showWaterNode(waterCount, color){
        // 遍历隐藏的水体节点，将隐藏的节点显示出来，如果是最后一个需要显示的水体节点，就显示水面节点
        let hiddenWaterNodes = 0 // 对隐藏的水体节点进行计数
        for(let node of this.waterNode.children){
            const surfaceNode = node.getChildByName('Surface') // 获取水面节点
            if(!node.active){ // 如果节点是隐藏的
                hiddenWaterNodes ++
                node.getComponent(Sprite).color = color // 设置水体颜色
                surfaceNode.getComponent(Sprite).color = this.waterSurfaceColor(color) // 设置水面颜色
                if(hiddenWaterNodes < waterCount){ // 如果隐藏的水体小于倒入的水体数量  
                    node.active = true // 显示水体节点
                    surfaceNode.active = false // 隐藏水面节点
                }else if(hiddenWaterNodes == waterCount){ // 如果隐藏的水体等于倒入的水体数量
                    node.active = true // 显示水体节点
                    surfaceNode.active = true // 显示水面节点 
                    return // 结束遍历
                }
            }
        }
    }

    // 获取当前场景中每个瓶子中全部水体的颜色，返回一个颜色列表
    getWaterColor(){
        // 获取全部水体节点
        const waterNode = this.waterNode.children
        // 定义数组，用于储存所有水体的颜色
        let waterColorList: Color[] = []
        // 遍历水体节点，获取每个水体的颜色，追加到颜色列表中
        for(let node of waterNode){
            // 如果检测到水体节点是隐藏的，说明没有水了，就返回数组
            // 如果检测到第一个节点就是隐藏节点，说明这是一个空瓶，直接返回空数组
            // 如果检测到第二或第三个节点是隐藏节点，说明这是一个半瓶水的瓶子，我们就循环至发现第一个隐藏节点为止，然后将循环到的节点颜色追加到列表并返回列表
            if(!node.active){ return waterColorList}
            // 如果不是隐藏的，获取节点上的颜色，复制过来
            const waterColor = node.getComponent(Sprite).color.clone()
            // 追加颜色到列表中
            waterColorList.push(waterColor)
            // 隐藏水体节点
            node.active = false
            // 隐藏水面节点
            const surfaceNode = node.getChildByName('Surface')
            surfaceNode.active = false
        }
        // 如果4个水体都不是隐藏的，那么 for 循环中的返回列表就不会执行，所以需要在循环结束后，再写一个返回列表
        // 如果不写 for 循环内部的返回列表，就会把水体节点中的隐藏节点颜色也追加到颜色列表中。这不是我们想要的。
        return waterColorList 
    }

    update(deltaTime: number) {
        
    }
}

