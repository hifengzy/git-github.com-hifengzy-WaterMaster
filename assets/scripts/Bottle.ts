import { _decorator, Color, Component, EventTouch, Input, instantiate, Node, Prefab, v3, Vec3 } from 'cc';
import { BottlePrefab } from './BottlePrefab';
import { PourWater } from './PourWater';
const { ccclass, property } = _decorator;

// 水瓶控制脚本

@ccclass('Bottle')
export class Bottle extends Component {

    @property(Prefab)
    bottlePrefab: Prefab = null // 导入水瓶预制体
    @property(Node)
    bottleContainer: Node = null // 导入水瓶容器节点

    // 定义数组，用于存储场景内的水瓶节点
    bottleList: Node[] = []
    // 定义变量，用于记录当前已创建的水瓶数量
    currentBottleCount: number = 5
    // 定义数组，用于存储已创建水瓶的位置，V3类型
    bottlePosition: Vec3[] = [v3(-100, 200), v3(100, 200), v3(-200, -70), v3(0, -70), v3(200, -70)]

    // 定义3中水的颜色：红，黄，蓝
    waterColor: Color[] = [new Color(221, 207, 26), new Color(238, 46, 46), new Color(33, 77, 244)]
    // 每个水瓶有4份水，随机使用红黄蓝三种颜色，定义一个数组，用于接收场景内全部水瓶中水的颜色
    waterColorList: Color[] = []
    // 定义数组，用于储存每个瓶子中水的份数
    waterCountList: number[] = []

    start() {
        // 初始化水瓶
        this.initBottle()
        this.getWaterColorList()
        this.shuffleWaterColorList()
        this.getWaterCountList()
        console.log(this.waterCountList)
        this.assignWaterColorToBottle()
        // 开启瓶子触摸监听
        this.onBottleTouch()
    }

    // 初始化水瓶
    initBottle() {
        for (let i = 0; i < this.currentBottleCount; i++) {
            // 实例化水瓶
            let bottleNode = instantiate(this.bottlePrefab)
            // 设置父节点
            bottleNode.parent = this.bottleContainer
            // 设置实例位置
            bottleNode.position = this.bottlePosition[i]
            // 将实例添加到数组
            this.bottleList.push(bottleNode)
            console.log(bottleNode.position)
        }
    }

    // 利用给定颜色，为每个颜色生成4份，最终得到关卡内全部水瓶中水的颜色列表
    getWaterColorList() {
        for (let x of this.waterColor) {
            for (let i = 0; i < 4; i++) {
                this.waterColorList.push(x)
            }
        }
        console.log(this.waterColorList)
    }

    // 利用洗牌算法，随机打乱关卡内全部水瓶中水的颜色列表
    shuffleWaterColorList(){
        const list = this.waterColorList
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = this.waterColorList[i]
            list[i] = list[j]
            list[j] = temp
        }
        this.waterColorList = list
    }

    // 为列表：waterCountList，赋值：每个瓶子中的水的份数列表，有以下限定条件：
    // 1. 每个瓶子中的水的份数，只能是：0、1、2、3、4五种情况
    // 2. 最小值是0，表示该瓶子中没有水
    // 3. 最大值是4，表示该瓶子中满水
    // 4. 列表成员的总和，必须等于 waterColorList.length（即当前可用的水总量）
    // 5. 列表成员的数量，必须等于 currentBottleCount（即瓶子总数）
    // 6. 列表成员的顺序是随机的
    getWaterCountList(){
        const list: number[] = Array.from({length: this.currentBottleCount}, () => 0) // 初始化列表成员，成员数等于瓶子数
        const sum = this.waterColorList.length // 列表 list 成员的相加之和（当前关卡的可用水总份数）
        let currentSum = 0 // 当前已分配的水的份数，初始值为0
        while(currentSum < sum){ // 只要已分配的份数小于总份数，就可以继续执行
            // 先随机选个瓶子（定义一个随机索引）
            const randomIndex = Math.floor(Math.random() * this.currentBottleCount)
            if(list[randomIndex] < 4){ // 如果瓶子中的水小于4，没有满
                list[randomIndex]++ // 就给它加1份水
                currentSum++ // 已分配的份数也加1
            }
        }
        this.waterCountList = list // 重新赋值给 waterCountList
    }

    // 给每个瓶子里的水上色
    // 1. 遍历瓶子，获取每个瓶子需要几份水
    // 2. 从 waterColorList 中安顺序取出颜色分配给瓶子中的水
    assignWaterColorToBottle(){
        // 定义一个变量，用于记录当前已经分配的颜色索引
        let currentColorIndex = 0
        // 遍历全部瓶子
        for(let i = 0; i < this.currentBottleCount; i++){ // 有几个瓶子就执行几次
            // 取得每个瓶子里面有几份水
            const waterCount = this.waterCountList[i]
            // 定义一个数组，储存每个瓶子里面的颜色
            const bottleColor: Color[] = []
            // 从 waterColorList 中按照每个瓶子所需的水的份数，取出颜色，添加到 bottleColor 中
            for(let j = 0; j < waterCount; j++){ // 需要几份水，就取出几个颜色
                bottleColor.push(this.waterColorList[currentColorIndex])
                currentColorIndex++ // 取出颜色后，索引后移一位
            }
            // 把取出来的颜色，赋值给瓶子的水
            this.bottleList[i].getComponent(BottlePrefab).initWaterColor(bottleColor)
            console.log(bottleColor)
        }   
    }

    // 瓶子触摸监听
    onBottleTouch(){
        // 遍历场景中的全部瓶子
        for(let bottleNode of this.bottleList){
            // 为每个瓶子添加触摸监听
            bottleNode.on(Input.EventType.TOUCH_START, this.onBottleTouchStart, this)
        }
    }

    // 关闭瓶子触摸监听
    offBottleTouch(){
        // 遍历场景中的全部瓶子
        for(let bottleNode of this.bottleList){
            // 移除每个瓶子的触摸监听
            bottleNode.off(Input.EventType.TOUCH_START, this.onBottleTouchStart, this)
        }
    }

    // 瓶子触摸回调
    onBottleTouchStart(event: EventTouch){
        const node = event.currentTarget // 获取当前触摸到的瓶子节点
        console.log('触摸到了瓶子：' + node)

        // 点击瓶子后，先获取当前已经抬起的瓶子，如果没有返回空值
        const movingBottleNode = this.getMovingBottle() 
        this.setBottleUpDown(movingBottleNode, node)
        
    }

    // 设置瓶子的抬起和落下方法
    setBottleUpDown(movingBottleNode: Node, targetBottleNode: Node){
        const targetBottlePrefab = targetBottleNode.getComponent(BottlePrefab)
        const waterCount = targetBottlePrefab.getWaterCount() // 获取当前瓶子里面水的数量
        // 如果当前没有已抬起的瓶子，则抬起当前触摸的瓶子
        if(!movingBottleNode){
            if(waterCount != 0){ // 如果当前瓶子里面没有水
                targetBottlePrefab.bottleUp() // 抬起当前瓶子
            }
            return
        }
        const movingBottlePrefab = movingBottleNode.getComponent(BottlePrefab) // 这一行必须在上面 if 判断以后，因为 if 判断以后，movingBottleNode 就不可能是空值，否则走不到这里。
        if(targetBottleNode == movingBottleNode){
            movingBottlePrefab.bottleUp() // 放下已经抬起的瓶子
            return
        }
        if(waterCount === 4){ // 如果当前瓶子里面水的数量是4，满水
            targetBottlePrefab.bottleUp() // 抬起当前瓶子
            movingBottlePrefab.bottleUp() // 放下已经抬起的瓶子
            return
        }
        // 对比目标瓶子和已抬起瓶子的水面颜色
        const movingBottleColor = movingBottlePrefab.getTopWaterColor() // 获取已抬起瓶子最上层水体颜色
        const targetBottleColor = targetBottlePrefab.getTopWaterColor() // 获取目标瓶子最上层水体颜色
        if(movingBottleColor.equals(targetBottleColor) || !targetBottleColor){ // 如果目标瓶子和已抬起瓶子的水面颜色相同，或目标瓶子是空瓶
            console.log('倒水') // 倒水
            this.offBottleTouch() // 关闭瓶子触摸监听
            // 传入倒水数据，已抬起瓶子节点，目标瓶子节点，已抬起瓶子的顶层水体颜色
            this.node.getComponent(PourWater).getPourData(movingBottleNode, targetBottleNode, movingBottleColor)
            // 执行倒水逻辑
            this.node.getComponent(PourWater).setPourWater()
        }else{
            movingBottlePrefab.bottleUp() // 放下已经抬起的瓶子
            targetBottlePrefab.bottleUp() // 抬起当前瓶子
        }
    }

    // 获取当前已经抬起的瓶子
    getMovingBottle(){
        for(let node of this.bottleList){
            const bottleIsMoving = node.getComponent(BottlePrefab).getBottleIsMoving() // 获取瓶子抬起状态
            if(bottleIsMoving){
                return node // 返回当前已经抬起的瓶子节点
            } // 如果没有发现已经抬起的瓶子，返回 null
        }
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        // 关闭瓶子触摸监听
        this.offBottleTouch()
    }
}


/**
 * 1. 先定义一个倒水的方法
 * 
 * 
 * **/
