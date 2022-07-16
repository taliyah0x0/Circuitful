let deviceWidth = window.innerWidth * 0.985;
let deviceHeight = window.innerHeight * 0.935;

let config = {
    type: Phaser.AUTO,
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: 0xF4F5F6,
    parent: "phaser-div",
    dom: {
        createContainer: false
    },
    fontFamily: `Sans`,
    scene: [Workspace],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    }
};


const game = new Phaser.Game(config);
