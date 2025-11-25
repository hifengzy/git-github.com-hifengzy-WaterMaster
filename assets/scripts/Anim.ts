import { _decorator, Component, Node, Animation, AnimationClip, director } from 'cc';
const { ccclass, property } = _decorator;

// 动画控制脚本
@ccclass('Anim')
export class Anim extends Component {

    @property(Animation)
    pourAnim: Animation = null // 倒入动画组件

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
    }

    // 继续播放
    resumeAnim(){
        this.pourAnim.resume()
    }

    // 当前剩余水量
    waterVolume(num: number){ // 帧事件：倒水动画过程中，每帧调用一次，传入当前剩余水量
        // 触发自定义监听事件：director.emit('事件名' ?参数)
        director.emit('停止', num)
    }

    update(deltaTime: number) {
        
    }
}

