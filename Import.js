class Import extends SimpleScene {

  constructor() {
    super("Import");
  }

  init() {}

  preload() {
      this.load.image("home","assets/home.png")
  }

  create() {
            document.getElementById('downloadObjectInfo').innerHTML = "";
        document.getElementById('downloadObjectInfo').href = "#";
      document.getElementById('downloadXLink').innerHTML = "";
        document.getElementById('downloadXLink').href = "#";
      document.getElementById('downloadYLink').innerHTML = "";
        document.getElementById('downloadYLink').href = "#";
    
    const pElement = document.getElementsByTagName("body")[0];
pElement.style.cursor = "url('https://i.ibb.co/hsnxb67/icons8-cursor-30.png'), auto";
    
      this.wpi = this.add.text(1410/2,670/2,"NOT READY YET",0x000000);
    this.wpi.setFontSize(50);
    this.wpi.setOrigin(0.5,0.5)

            this.home = this.add.sprite(deviceWidth * 0.95, deviceHeight * 0.94, "home");
        this.home.setScale(0.15)
        this.home.enableClick();
  }

  update() {

          this.home.on("pointerover", () => {
    const pElement = document.getElementsByTagName("body")[0];
pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
});

       this.home.on("pointerout", () => {
    const pElement = document.getElementsByTagName("body")[0];
pElement.style.cursor = "url('https://i.ibb.co/hsnxb67/icons8-cursor-30.png'), auto";
});

    if(this.home.wasClicked()){
        this.scene.start("Menu");
      }

  }
}
