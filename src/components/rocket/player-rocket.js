import React, { PureComponent } from 'react'
import { StyleSheet, Animated, Easing } from 'react-native'
import options from '../../config'

const offset = {
    bottom: options.alienSize - (options.alienSize * 0.8),
    top: options.alienSize * 0.8
}

export default class PlayerRocket extends PureComponent {
    /*
        * The player shoots upwards, the position of the rocket is obtained starting from the value of translateY
        * Starting position: value from bottom (compensated with cannon height)
        * Movement: translate negative upwards, as if it were bottom: +x
        * Alien position: value from bottom
        * CollisionY: when rocketY > alienY1 and rocketY < alienY2
    */

    state = {
        translateY: new Animated.Value(0),
        // x static, here to avoid assigning it to a constant in the various iterations of the checkCollision for
        xPosition: this.props.rocketData.x + (options.cannonSize / 2) - 2.5
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
                toValue: -limit,
                easing: Easing.linear,
                duration: options.rocketSpeed,
                useNativeDriver: true
            }
        ).start(() => removeRocket(rocketData.id)) // At the end of the animation, remove the rocket
    }

    checkCollisions(position) {
        const { translateY, xPosition: rocketXPosition } = this.state
        const { aliens, rocketData, updateScore, removeAlien } = this.props

        // At the end of the game, with aliens at 0, if there is still a missile on the screen, deactivate the control
        if (!aliens.length) {
            translateY.removeListener(this.rocketListener)
            return
        }

        // position is relative, it starts from 0 with respect to the missile's spawn position; you have to compensate
        const rocketYPosition = position + rocketData.y + 15 // missile height
        const firstAlien = aliens[0]
        const lastAlien = aliens[aliens.length - 1]

        // If the missile has not yet reached the aliens, skip the checks
        if (rocketYPosition < firstAlien.y - 10) return

        // If the missile passes the last alien without hitting, there is no longer any need to check for collisions
        if (rocketYPosition > lastAlien.y + (options.alienSize - 10)) {
            translateY.removeListener(this.rocketListener)
            return
        }

        for (let i = 0; i < aliens.length; i++) {
            /*
                *    1___y2___
                *    |        |
                *  x1|        |x2
                *    |________|
                *    0   y1   1
            */
            const y1Threshold = aliens[i].y + offset.bottom // under
            const y2Threshold = y1Threshold + offset.top // above
            const x1Threshold = aliens[i].x // left
            const x2Threshold = x1Threshold + options.alienSize // right

            // HIT!
            // Check if the missile is inside the alien's hit box (Y1 < missile < Y2 and X1 < missile < X2)
            if (rocketYPosition > y1Threshold && rocketYPosition < y2Threshold && rocketXPosition > x1Threshold && rocketXPosition < x2Threshold) {
                translateY.removeListener(this.rocketListener)
                translateY.stopAnimation()
                removeAlien(aliens[i].id)
                updateScore()
                break
            }
        }
    }

    render() {
        const { translateY, xPosition } = this.state
        const { rocketData } = this.props
        const animatedStyle = { transform: [{ translateY }], bottom: rocketData.y - 10, left: xPosition }

        return <Animated.View style={[styles.base, animatedStyle]} />
    }
}

const styles = StyleSheet.create({
    base: {
        width: 5,
        height: 15,
        backgroundColor: options.mainColor,
        position: 'absolute'
    }
})