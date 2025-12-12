import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { colorConfig } from './Config';
import { Win } from './Win';
const { ccclass, property } = _decorator;

// 快递袋控制脚本

@ccclass('Box')
export class Box extends Component {
    
    @property(Prefab)
    boxPrefab: Prefab = null // 快递袋预制体

    @property(Node)
    boxContainer: Node = null // 快递袋容器节点

    @property([SpriteFrame])
    boxSpriteFrames: SpriteFrame[] = [] // 倒入快递袋美术素材列表

    // 定义快递袋列表
    boxList: Node[] = []

    // 定义快递袋颜色列表
    boxColorList: string[] = null

    // 保存新生成快递袋的节点 x 值
    newBoxPosX: number = null

    start() {

    }

    // 获取关卡数据
    getLevelData(boxColorList){
        this.boxColorList = boxColorList
        this.initBox()
    }

    // 初始化快递袋
    initBox(){
        this.instantiateBox(this.boxColorList[0])
        this.instantiateBox(this.boxColorList[1])
        // 从颜色列表里删除已经初始化的颜色
        this.boxColorList.splice(0, 2)
        this.initBoxPosition()
    }

    // 生成快递袋
    instantiateBox(color, posX?: any){
        const boxNode = instantiate(this.boxPrefab) // 实例化快递袋预制体
        if(posX){ boxNode.setPosition(posX, 0) } // 如果传入 x 坐标，将其设置为快递袋位置
        this.setBoxColor(boxNode, color) // 设置快递袋颜色
        boxNode.name = color // 将快递袋节点名称设置为传入的颜色
        this.boxList.push(boxNode) // 添加到快递袋列表
        boxNode.setParent(this.boxContainer) // 设置父节点
        boxNode.getChildByName('On').active = true // 显示快递袋
    }

    // 初始化快递袋的位置
    initBoxPosition(){
        let xPos = 0 // 初始x位置
        for(let node of this.boxList){ // 遍历快递袋列表
            xPos += 150 // 先给 x 坐标加一个150
            node.setPosition(xPos, 0) // 设置快递袋位置
        }
    }

    // 设置快递袋颜色
    setBoxColor(node, color){
        for(let x of this.boxSpriteFrames){
            let name = x.name // 获取素材名称
            if(name == color){ // 如果拿到的素材名称等于传入颜色
                // 将快递袋列表中第一个快递袋，子节点 off 的 Sprite 组件的 spriteFrame 设置为 x
                node.getChildByName('Off').getComponent(Sprite).spriteFrame = x
            }else if(name == color + '1'){ // 如果素材名称等于颜色+1
                // 将快递袋列表第一个快递袋，子节点 On 的 Sprite 组件的 spriteFrame 设置为 x
                node.getChildByName('On').getComponent(Sprite).spriteFrame = x
            }else if(name == color + '2'){ // 如果素材名称等于颜色+1
                // // 将快递袋列表第一个快递袋，子节点 On 的子节点 Handle 的 Sprite 组件的 spriteFrame 设置为 x
                node.getChildByName('On').getChildByName('Handle').getComponent(Sprite).spriteFrame = x
            }
        }
    }

    // 匹配成功后，隐藏开口快递袋，显示闭口快递袋
    hideAndMoveBox(node: Node){
        node.getChildByName('On').active = false
        node.getChildByName('Off').active = true
        tween(node).by(0.5, {y: 200}).call(() => {
            console.log('快递袋移动完成')
            // 将快递袋从列表中移除
            this.destroyBox(node)
            // 生成新的快递袋
            this.generateNewBox()
        }).start()
    }

    // 销毁快递袋
    destroyBox(node: Node) {
        // 将即将销毁的快递袋 x 坐标保存给新快递袋 x 值
        this.newBoxPosX = node.position.x
        // 从快递袋列表中移除快递袋
        for(let i = 0; i < this.boxList.length; i++){
            if(this.boxList[i] == node){
                this.boxList.splice(i, 1)
            }
        }
        node.destroy()
    }

    // 生成新的快递袋
    generateNewBox(){
        // 从快递袋颜色列表中取出颜色
        const color = this.boxColorList.pop()
        // 生成新的快递袋
        if(color){ // 如果颜色列表里有颜色
            this.instantiateBox(color, this.newBoxPosX) // 生成新的快递袋
            // 获取新生成的快递袋节点
            const newBox: Node = this.boxList[this.boxList.length - 1]
            // 使用新快递袋的颜色匹配排队中的瓶子
            this.node.getParent().getChildByName('Bottles').getComponent(Win).boxMatchWaitingBottle(newBox)
            console.log(this.boxList)
            console.log(this.boxColorList)
        }else{
            console.log(this.boxList)
            console.log(this.boxColorList)
            if(this.boxList.length != 0){ return }
            console.log('快递袋列表为空，游戏通关')
        }
    }

    // 开启广告快递袋
enableAdBox(event){
    console.log(event)
    // 获取事件节点
    const eventNode = event.currentTarget
    // 将事件节点 x 坐标设置为新快递袋 x 值
    this.newBoxPosX = eventNode.position.x
    // 销毁事件节点
    eventNode.destroy()
    // 生成新快递袋
    this.generateNewBox()
}

    update(deltaTime: number) {
        
    }
}

