import React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity,Image} from 'react-native';

import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import Physics ,{resetPipeCount}from './Physics';

import Constants from './Constants';
import Bird from './Bird';
import Wall from './Wall';
import Floor from './Floor';

import Images from './assets/Images';



export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const generatePipes = () => {
  let topPipeHeight = randomBetween(100, (Constants.MAX_HEIGHT / 2) - 100);
  let bottomPipeHeight = Constants.MAX_HEIGHT - topPipeHeight - Constants.GAP_SIZE;

  let sizes = [topPipeHeight, bottomPipeHeight];

  if (Math.random() < 0.5) {
    sizes = sizes.reverse();
  }

  return sizes;
}


export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.gameEngine = null;
    this.entities = this.setupWorld();
    this.state = {
      running: true,
      score:0
    };
  }


  setupWorld = () => {
    let engine = Matter.Engine.create({ enableSleeping: false });
    let world = engine.world;
    world.gravity.y=0.0;

    let bird = Matter.Bodies.rectangle(Constants.MAX_WIDTH / 2,
       Constants.MAX_HEIGHT / 2,Constants.BIRD_WIDTH,Constants.BIRD_HEIGHT);
    let floor1= Matter.Bodies.rectangle(
      Constants.MAX_WIDTH / 2, 
      Constants.MAX_HEIGHT - 25,
      Constants.MAX_WIDTH+4
      , 50, 
      { isStatic: true }
      );

      let floor2= Matter.Bodies.rectangle(
        Constants.MAX_WIDTH+(Constants.MAX_WIDTH / 2), 
        Constants.MAX_HEIGHT - 25,
        Constants.MAX_WIDTH+4
        , 50, 
        { isStatic: true }
        );

  
    Matter.World.add(world, [bird, floor1,floor2]);

    Matter.Events.on(engine, 'collisionStart', (event) => {
      var pairs = event.pairs;
      this.gameEngine.dispatch({ type: "game-over" });
    });

    return {
      physics: { engine: engine, world: world },

      bird: { body: bird, pose:1 , renderer: Bird },
      floor1: { body: floor1,renderer: Floor },
      floor2: { body: floor2,renderer: Floor }

    }

  }

 onEvent = (e) => {
    if (e.type === "game-over") {

      this.setState({
        running: false
      })
    }
  }
  reset = () => {
    resetPipeCount();
    this.gameEngine.swap(this.setupWorld());
    this.setState({
      running: true
    });
  }


  render() {
    return (
      <View style={styles.container}>

        <Image source={Images.background} style={styles.backgroundImages} resizeMode="stretch"/>

        <GameEngine
          ref={(ref) => { this.gameEngine = ref; }}
          style={styles.gameContainer}
          systems={[Physics]}
          running={this.state.running}
          onEvent={this.onEvent}
          entities={this.entities}>
          <StatusBar hidden={true} />
        </GameEngine>
    <Text style={styles.score}>{this.state.score}</Text>
        {!this.state.running && <TouchableOpacity style={styles.fullScreenButton} onPress={this.reset}>
          <View style={styles.fullScreen}>
            <Text style={styles.gameOverText}>Game Over</Text>
          </View>
        </TouchableOpacity>}
      </View>
    )
  }
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundImages:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width:Constants.MAX_WIDTH,
    height:Constants.MAX_HEIGHT
  },
  gameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gameOverText: {
    color: 'white',
    fontSize: 48
  },
  fullScreenButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1
  },
  score: {
    color: 'white',
    fontSize: 72,  
    position: 'absolute',
    top: 50,
    left: Constants.MAX_WIDTH / 2 - 24,
    textShadowColor:'#222222',
    textShadowOffset:{width: 2, height: 2},
    textShadowRadius:2,
    
}
});
