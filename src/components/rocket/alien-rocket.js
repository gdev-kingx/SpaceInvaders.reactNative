import React, { PureComponent } from 'react'
import { StyleSheet, Animated, Easing } from 'react-native'
import options from '../../config'

export default class AlienRocket extends PureComponent {
    /*
        * The aliens shoot downwards, the position of the rocket is obtained starting from the value of translateY
        * Starting position: value from bottom (compensated)
        * Movement: translate positive down, converted as if it were bottom: +x
        * Player position: value from bottom
        * CollisionY: when rocketY < playerY
    */

    state = {
        translateY: new Animated.Value(0),
        // x static, here to avoid assigning it to a constant in the various iterations of the checkCollision for
        xPosition: this.props.rocketData.x + (options.alienSize / 2) - 2.5 // half missile width
    }

    componentDidMount() {
        const { translateY } = this.state
        const { limit, removeRocket, rocketData } = this.props

        this.rocketListener = translateY.addListener(({ value }) => {
            this.checkCollisions(Math.abs(value))
        })

        Animated.timing(
            this.state.translateY,
            {
                // How much translate to use to get down depends on the initial position of the rocket
                toValue: limit - (limit - rocketData.y),
                easing: Easing.linear,
                // Shorter duration as the aliens descend, because the missile has less space to travel
                duration: options.rocketSpeed * Math.sqrt(rocketData.y / limit),
                useNativeDriver: true
            }
        ).start(() => removeRocket(rocketData.id)) // At the end of the animation, remove the rocket
    }

    checkCollisions(position) {
        const { translateY, xPosition: rocketXPosition } = this.state
        const { playerXPosition, rocketData, limit, updateLives } = this.props

        // position is relative, it starts from 0 with respect to the missile's spawn position; you have to compensate
        // In the case of aliens, converts the position from top: +x to bottom: +x
        const rocketYPosition = limit - (position + (limit - rocketData.y))

        // Before arriving at the cannon, there is no need to check
        if (rocketYPosition > options.cannonSize + 20) return
        
        const y2Threshold = options.cannonSize // above: height of the cannon from below, which remains fixed
        const x1Threshold = playerXPosition // left
        const x2Threshold = x1Threshold + options.cannonSize // right
        
        // HIT!
        if (rocketYPosition < y2Threshold && rocketXPosition > x1Threshold && rocketXPosition < x2Threshold) {
            translateY.removeListener(this.rocketListener)
            translateY.stopAnimation()
            updateLives()
        }
    }

    render() {
        const { translateY, xPosition } = this.state
        const { rocketData } = this.props
        
        const animatedStyle = {
            transform: [{ translateY }],
            bottom: rocketData.y - 15, // missile height
            left: xPosition
        }

        return <Animated.View style={[styles.base, animatedStyle]} />
    }
}

const styles = StyleSheet.create({
    base: {
        width: 5,
        height: 15,
        backgroundColor: 'red',
        position: 'absolute'
    }
})