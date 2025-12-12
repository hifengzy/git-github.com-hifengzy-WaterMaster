import { _decorator, Component, Node, Animation, AnimationClip, director } from 'cc';
const { ccclass, property } = _decorator;

// 动画控制脚本
@ccclass('Anim')
export class Anim extends Component {

    @property(Animation)
    pourAnim: Animation = null // 倒入动画组件

    // 瓶子动画是否为回正状态
    isBottleReset: boolean = false

    start() {

    }

    // 播放动画
    playAnim(){
        // 获取动画状态
        const animState = this.pourAnim.getState('pour')
        animState.speed = 1.0 // 设置初始速度
        animState.wrapMode = AnimationClip.WrapMode.Default // 设置循环模式
        this.pourAnim.play('pour')
    }

    // 暂停动画
    pauseAnim(){
        this.pourAnim.pause()
        this.isBottleReset = true // 瓶子动画状态改为回正状态
    }

    // 继续播放
    resumeAnim(){
        this.pourAnim.resume()
        this.isBottleReset = false // 瓶子动画状态改为非回正状态
    }

    // 反向播放动画
    reverseAnim(){
        const animState = this.pourAnim.getState('pour')
        animState.wrapMode = AnimationClip.WrapMode.Reverse
        animState.speed = 3.0 
    }

    // 当前剩余水量
    waterVolume(num: number){ // 帧事件：倒水动画过程中，每帧调用一次，传入当前剩余水量
        // 触发自定义监听事件：director.emit('事件名' ?参数)
        if(this.isBottleReset){ // 如果瓶子动画为回正状态
            return // 直接返回，不执行后续代码
        }
        director.emit('停止', num)
    }

    update(deltaTime: number) {
        
    }
}

