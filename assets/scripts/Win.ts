import { _decorator, color, Color, Component, Node, Sprite, tween, Vec3 } from 'cc';
import { Box } from './Box';
import { colorConfig } from './Config';
import { UI } from './UI';
const { ccclass, property } = _decorator;

// 瓶子满水空值脚本

@ccclass('Win')
export class Win extends Component {

    // 定义已经同色满瓶，但尚未匹配到快递袋的瓶子数组，保存瓶子节点和水的颜色
    waitingBottleList = []

    start() {

    }

    fullWaterComplete(node: Node, color: Color){ // 瓶子同色满水后执行动作，传入满水瓶子节点，水的颜色
        node.getChildByName('Body').getChildByName('Bottle_Cap').active = true // 显示瓶盖
        node.getChildByName('Complete').active = true // 显示对勾
        node.getChildByName('Bomb').active = true // 显示粒子特效
        // 同色满水后匹配快递袋
        //this.matchBox(node, color)
        if(this.bottleMatchBox(node, color)){ return } // 如果匹配到了快递袋，直接返回
        console.log('这里写瓶子满了，但快递袋没有匹配到的逻辑')
        // 如果没有匹配到快递袋，将满瓶的瓶子节点和水的颜色添加到排队数组中
        this.waitingBottleList.push([node, color.clone()])
        console.log('排队的满瓶数组：', this.waitingBottleList)
        // 检查是否存在排队中的瓶子，如果有瓶子，尝试匹配快递袋
    }

    // 瓶子同色满水后匹配快递袋
    bottleMatchBox(node: Node, color: Color){
        // 从 Box 节点上获取快递袋名称，快递袋名称就是颜色名称
        const boxList: Node[] = this.node.getParent().getChildByName('Box').getComponent(Box).boxList
        for(let x of boxList){ // 循环遍历快递袋列表
            if(colorConfig[x.name][0].equals(color)){ // 将快递袋节点名称作为键，获取对应的颜色值，并与瓶子中的水的颜色进行对比
                const boxPos = x.getPosition() // 获取快递袋的本地坐标
                const bottlePos = node.getWorldPosition() // 获取满水瓶子的世界坐标
                node.setParent(this.node.getParent().getChildByName('Box')) // 将瓶子的节点设置为快递袋的子节点
                node.setWorldPosition(bottlePos) 
                tween(node).to(0.2, { position: new Vec3(boxPos.x, boxPos.y + 100, 0) }).call(() => {
                    console.log('匹配成功')
                    node.destroy() // 销毁瓶子节点
                    this.node.getParent().getComponent(UI).updateRemainColorCount() // 更新 UI 上的剩余颜色数量
                    this.node.getParent().getChildByName('Box').getComponent(Box).hideAndMoveBox(x) // 隐藏并移走快递袋
                }).start()
                return true
            }
        }
    }

    // 使用快递袋匹配排队中的瓶子，在生成新的快递袋后立即调用本方法
    boxMatchWaitingBottle(node: Node){ // 传入新快递袋的节点
        if(this.waitingBottleList.length == 0){ return }
        const newBoxColor = colorConfig[node.name][0] // 获取新快递袋的颜色
        for(let x of this.waitingBottleList){ // 遍历排队中的瓶子
            const bottleNode = x[0] // 获取排队瓶子的节点
            const bottleColor = x[1] // 获取排队瓶子的水的颜色
            if(bottleColor.equals(newBoxColor)){ // 如果瓶对瓶子水的颜色与快递袋相同
                this.bottleMatchBox(bottleNode, bottleColor) // 调用匹配成功方法
                // 从排队数组中移除匹配成功的瓶子
                this.waitingBottleList.splice(this.waitingBottleList.indexOf(x), 1)
                console.log('排队瓶子列表：', this.waitingBottleList)
            }
        }
    }

    update(deltaTime: number) {
        
    }
}

