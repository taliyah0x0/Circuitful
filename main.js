let deviceWidth = 1300;
let deviceHeight = 600;

let config = {
  type: Phaser.AUTO,
  width: deviceWidth,
  height: deviceHeight,
  backgroundColor: 0xF4F5F6,
  parent: "phaser-div",
  dom: {
    createContainer: false
  },
  fontFamily: `RoundPop`,
  scene: [Step4],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  }
};


const game = new Phaser.Game(config);
