import { _decorator, Color, Component, instantiate, Node, Prefab, v3, Vec3 } from 'cc';
import { BottlePrefab } from './BottlePrefab';
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
        for(let i = 0; i < this.currentBottleCount; i++){
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
            this.bottleList[i].getComponent(BottlePrefab).setWaterColorInit(bottleColor)
            console.log(bottleColor)
        }
        
    }



    update(deltaTime: number) {
        
    }
}

