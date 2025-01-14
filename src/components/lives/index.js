import React, { PureComponent } from 'react'
import { View, StyleSheet } from 'react-native'
import Sprite from '../sprite'

export default class Lives extends PureComponent {
    renderLives() {
        const { number } = this.props
        
        // If a rocket arrives with 0 lives, it crashes everything
        const positiveNumber = Math.max(number, 0)

        return Array(positiveNumber).fill(0).map((el, ind) => (
            <Sprite key={ind} image='cannon' width={24} style={{marginHorizontal: 4}}/>
        ))
    }

    render() {
        return (
            <View style={styles.base}>
                {this.renderLives()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row'
    }
})