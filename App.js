import React, { PureComponent } from 'react'
import { Dimensions, Alert } from 'react-native'
import GameView from './src/components/game-view'
import options from './src/config'

const { width, height } = Dimensions.get('window')

export default class App extends PureComponent {
	state = {
		winner: 0, // 0: none, 1: player, 2: computer
		speed: options.startingGameSpeed,
		playerXPosition: 0,
		lives: options.numberOfLives,
		aliens: [],
		direction: 1,
		down: false,
		rockets: [],
		explosion: [],
		score: 0,
		highest: 0
	}

	componentDidMount() {
		this.initGame()
	}

	componentDidUpdate(prevProps, prevState) {
		const { winner, aliens } = this.state

		// One less alien, increase speed
		// Must not be called at init (when there was a winner before) or it won't reset the speed!
		// It shouldn't be called even at the last alien, it's not needed and it remains an active interval
		if (!prevState.winner && prevState.aliens.length > 1 && prevState.aliens.length !== aliens.length) {
			this.increaseSpeed(prevState.speed)
		}

		// There is a winner (and only if there were no others before)
		if (!prevState.winner && winner) {
			winner === 1 ? this.victory() : this.gameOver()
		}
	}

	initGame() {
		const { winner } = this.state
	
		if (this.delay) clearTimeout(this.delay)
		if (winner) this.reinitState()
	
		this.generateAliens()
		this.gameLoop = setInterval(() => this.renderFrame(), this.state.speed)
	}
	
	
	reinitState() {
		const common = {
			winner: 0,
			speed: options.startingGameSpeed,
			direction: 1,
			down: false
		}
		this.setState(this.state.winner === 1 ? { ...common } : { ...common, lives: options.numberOfLives, aliens: [], score: 0 })
	}
	
	
	exit() {
		console.log('Exit')
	}

	victory() {
		clearInterval(this.gameLoop)
		this.delay = setTimeout(() => this.initGame(), 500)
	}

	gameOver() {
		const { score, highest, playerXPosition } = this.state
	
		clearInterval(this.gameLoop)
		this.setState({ highest: Math.max(score, highest), explosion: [playerXPosition, 0] })
	
		Alert.alert(
			'GAME OVER',
			'The aliens have won!',
			[
				{ text: 'You go out', onPress: () => this.exit(), style: 'cancel' },
				{ text: 'New match', onPress: () => this.initGame() }
			],
			{ cancelable: false })
	}

	increaseSpeed(startingSpeed) {
		clearInterval(this.gameLoop)
		// Speed ​​increases by x% compared to its last value
		// newSpeed ​​becomes a string, crash on Android, ok on IOS (?)
		const newSpeed = +(startingSpeed - (startingSpeed * options.speedMultiplier)).toFixed(0)
		this.setState({ speed: newSpeed }, () => {
			this.gameLoop = setInterval(() => this.renderFrame(), newSpeed)
		})
	}
	
	
	// To clone arrays composed of objects [{...}, {...}, {...}]
	cloneState = source => source.map(el => Object.assign({}, el))
	
	
	generateAliens() {
		const aliens = []
	
		const alienHorSpace = options.alienSize + options.aliensHorDistance
		const alienVerSpace = options.alienSize + options.aliensVerDistance
		
		const offsetForCentering = options.aliensHorDistance / 2
		const xOffset = offsetForCentering + (width - alienHorSpace * Math.max(...options.aliensInit)) / 2 // To target aliens
		const yOffset = alienVerSpace + (alienVerSpace * 0.4)
	
		options.aliensInit.map((el, ind) => {
			for (let i = 0; i < el; i++) {
				const type = ind + 1
				const num = i + 1
				// An alien è { id: 't1n1', t: 1, x: 120, y: 40 }
				aliens.push(
					{
						id: `t${type}n${num}`,
						t: type,
						x: xOffset + (alienHorSpace * i),
						y: height - (alienVerSpace * (ind + 1)) - yOffset
					}
				)
			}
		})
		aliens.reverse() // The first ones in the array must be closest to the bottom
	
		this.setState({ aliens })
	}
	
	
	moveAliens(dX, dY) {
		const { aliens, direction, playerXPosition } = this.state
	
		/* With aliens in multiple rows, the boundary reversal is repeated for each row, causing a bug on the direction, which is reversed multiple times. The check is therefore carried out only once, if it needs to be reversed there is no point in checking again */
		let inversionTrue = false
	
		// Reset the down state, by default aliens should not come down
		this.setState({ down: false })
	
		const clonedAliens = this.cloneState(aliens)
	
		clonedAliens.forEach(el => {
			el.x += dX
			el.y -= dY
	
		  	if (inversionTrue) return // Should we reverse it? Stopping, checking other aliens is useless
	
		  	/* Off screen? To reverse! I just check if the aliens are going in the same direction as the edge to avoid a bug in renderFrame when they only move down */
			if (direction === 1 && el.x + (options.alienSize + 16) > width || direction === -1 && el.x < 16) {
				this.setState(prevState => ({ direction: prevState.direction *= -1, down: true }))
				inversionTrue = true
			}
	
			if (el.y <= options.cannonSize) this.setState({ winner: 2, explosion: [playerXPosition, 0] })
		})
	
		return clonedAliens
	}
	
	
	renderFrame() {
		const { direction, down } = this.state
	
		const dX = down ? 0 : options.aliensHorStep * direction
		const dY = down ? options.aliensVerStep : 0
	
		const aliens = this.moveAliens(dX, dY)
	
		const doesShoot = Math.random() < options.shootingProbability
		if (doesShoot) {
		  	const randomAlien = aliens[Math.floor(Math.random() * aliens.length)]
			this.fire({ x: randomAlien.x, y: randomAlien.y }, 2)
		}
	
		// A new alien array returns, as the FINAL FRAME
		this.setState({ aliens })
	}
	
	
	removeAlien = id => {
		const { aliens } = this.state
	
		const clonedAliens = this.cloneState(aliens)
	
		const killedAlienInd = clonedAliens.findIndex(el => el.id === id)
		const killedAlienType = clonedAliens[killedAlienInd].t
	
		// Find the next aliens in the same row (same type as the dead one and lower index because the array is reversed)
		const nextAliens = clonedAliens.filter((el, ind) => el.id !== id && el.t === killedAlienType && ind < killedAlienInd)
	
		// Move the next row of aliens by an offset equal to the space occupied by an alien
		nextAliens.forEach(el => el.x + options.aliensHorSpace)
	
		const commonState = {
			aliens: clonedAliens,
		  	// Coordinates to render the explosion
			explosion: [clonedAliens[killedAlienInd].x, clonedAliens[killedAlienInd].y]
		}
	
		clonedAliens.splice(killedAlienInd, 1)
	
		this.setState(clonedAliens.length === 0 ? { ...commonState, winner: 1 } : commonState)
	}
	
	
	fire = (launchPos, player = 1) => {
		// Different rockets per player, you need to know who fired the shot
		const { rockets: stateRockets } = this.state
	
		if (stateRockets.length === options.maxRocketsOnScreen) return
	
		const id = Math.random().toString(36).substring(2, 8)
	
		const rockets = [
			...stateRockets,
			{ id, player, ...launchPos }
		]
	
		this.setState({ rockets })
	}
	
	
	removeRocket = id => {
		const { rockets: stateRockets } = this.state
	
		const rockets = this.cloneState(stateRockets)
		const rocketInd = rockets.findIndex(el => el.id === id)
	
		rockets.splice(rocketInd, 1)
	
		this.setState({ rockets })
	}
	
	
	updateScore = () => this.setState(prevState => ({ score: prevState.score + 1 }))
	
	updatePlayerPosition = value => this.setState({ playerXPosition: value })
	
	updateLives = () => {
		this.setState(prevState => {
			const lives = prevState.lives - 1
			return lives === 0 ? { lives, winner: 2 } : { lives }
		})
	}
	
	clearExplosion = () => this.setState({ explosion: [] })
	
	render() {
		const { score, highest, rockets, aliens, explosion, playerXPosition, lives, winner } = this.state
	
		return (
			<GameView
				width={width} // screen width
				height={height} // screen height
				score={score}
				updateScore={this.updateScore}
				highest={highest}
				fire={this.fire}
				rockets={rockets}
				removeRocket={this.removeRocket}
				aliens={aliens}
				removeAlien={this.removeAlien}
				explosion={explosion}
				clearExplosion={this.clearExplosion}
				playerXPosition={playerXPosition}
				updatePlayerPosition={this.updatePlayerPosition}
				lives={lives}
				updateLives={this.updateLives}
				winner={winner}
				exit={this.exit}
			/>
		)
	}
}