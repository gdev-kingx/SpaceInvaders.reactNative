const options = {
    numberOfStars: 30,
    starSize: 1,

    startingGameSpeed: 1000,
    speedMultiplier: 0.08,
    rocketSpeed: 1600,
    rocketCoolDown: 800, // Time interval between one missile and another
    explosionDuration: 400,

    aliensInit: [5, 5, 5], // 3 rows, each with 5 aliens; the index + 1 is the type of alien
    aliensHorDistance: 20,
    aliensVerDistance: 20,
    aliensHorStep: 20,
    aliensVerStep: 30,
    shootingProbability: 0.25,
    
    maxRocketsOnScreen: 4,
    numberOfLives: 3,

    cannonSize: 50,
    alienSize: 40,

    mainColor: '#22cc00' // just texts and missile
}

// All sprites must be square!
export const sprites = {
    cannon: require('../assets/512/cannon.png'),
    explosion1: require('../assets/512/explosion1.png'),
    explosion2: require('../assets/512/explosion2.png'),
    alien1_1: require('../assets/512/alien1_1.png'),
    alien1_2: require('../assets/512/alien1_2.png'),
    alien2_1: require('../assets/512/alien2_1.png'),
    alien2_2: require('../assets/512/alien2_2.png'),
    alien3_1: require('../assets/512/alien3_1.png'),
    alien3_2: require('../assets/512/alien3_2.png')
}

export default options