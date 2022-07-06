class Loading extends SimpleScene {

  constructor() {
    super("Loading");
  }

  init() {}

  preload() {
  }

  create() {
    this.loading = this.add.text(deviceWidth/2,deviceHeight/2,"Loading Circuitful...",0x000000);
    this.loading.setOrigin(0.5,0.5)
    this.loading.setFontSize(deviceHeight*0.05)
    this.loading.enableClick();
  }

  update() {
    if(this.loading.wasClicked()){
      this.scene.start("Menu")
    }
  }
}
