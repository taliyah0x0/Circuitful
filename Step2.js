var closing = false;
var opening = false;
var itemBinOpen = true;

var objectInfo;

var wiringPoint;
var object;
var create = true;
var matchx = false;
var matchy = false;
var xcoor = 0;
var ycoor = 0;
var xdist = 0;
var ydist = 0;
var matchxdist = false;
var matchydist = false;
var secureSpotX = false;
var secureSpotY = false;
var locX = [];
var locY = [];
var workshopScale;

class Step2 extends SimpleScene {

    constructor() {
        super("Step2");
    }

    init() {}

    preload() {
        this.load.image("object", 'object/object.png');
        this.load.image("binhandlearrow", "./assets/binhandlearrow.png");
        this.load.image("increasescale", "./assets/increasescale.png");
        this.load.image("decreasescale", "./assets/decreasescale.png");
        this.load.image("home", "assets/home.png");
        this.load.image("magnet", "assets/magnet.png");
        this.load.image("slash", "assets/slash.png");
        this.load.image("grid", "assets/grid.jpeg");
    }

    create() {
        this.grid = this.add.sprite(deviceWidth / 2-2, deviceHeight / 2-12, "grid");
       this.grid.setScale(0.77, 0.83)
      this.grid.setAngle(90)
        this.grid.setAlpha(0.5)
        document.getElementById('downloadObjectInfo').innerHTML = "";
        document.getElementById('downloadObjectInfo').href = "#";
        document.getElementById('downloadXLink').innerHTML = "";
        document.getElementById('downloadXLink').href = "#";
        document.getElementById('downloadYLink').innerHTML = "";
        document.getElementById('downloadYLink').href = "#";

        this.title = this.add.text(deviceWidth / 2, deviceHeight * 0.045, "STEP 2", 0x999999);
        this.title.setOrigin(0.5, 0);
        this.title.setFontSize(deviceHeight * 0.075);
        this.instructions = this.add.text(deviceWidth / 2, deviceHeight * 0.15, "Scale the object and place wiring point(s).", 0x000000)
        this.instructions.setOrigin(0.5, 0);
        this.instructions.setFontSize(deviceHeight * 0.03);

        this.object = this.add.sprite(deviceWidth / 2, deviceHeight * 0.57, "object");
        this.object.enableClick();
        object = this.object;

        this.wiringPoint = [];
        let obj = this.add.circle(deviceWidth * 0.05, deviceHeight * 0.22, deviceWidth * 0.005, 0xff0000);
        obj.width = deviceWidth*0.02;
        obj.height = deviceWidth*0.02;
        obj.enableClick();
        obj.enableDrag();
        this.wiringPoint.push(obj);
        wiringPoint = this.wiringPoint;

      this.crossV = this.add.line(0,0,0,0,0xff0000);
      this.crossH = this.add.line(0,0,0,0,0xff0000);
      this.crossV.setLineWidth(1);
      this.crossH.setLineWidth(1);

        this.binHandle = this.add.circle(deviceWidth * 0.21, deviceHeight / 2, deviceWidth * 0.02, 0xdddddd);
        this.binHandle.enableClick();

        this.binHandleArrow = this.add.sprite(deviceWidth * 0.215, deviceHeight / 2, "binhandlearrow");
        this.binHandleArrow.setScale(0.02);
        this.binHandleArrow.setAngle(180);
        this.binHandleArrow.enableClick();

        this.itemBin = this.add.rectangle(deviceWidth * 0.1, deviceHeight * 0.22, deviceWidth * 0.22, deviceHeight * 2, 0xdddddd);
        this.binLabel = this.add.text(deviceWidth * 0.02, deviceHeight * 0.03, "All", 0x999999);
        this.binLabel.setFontSize(deviceHeight * 0.045);
        this.binLabelDivider = this.add.line(deviceWidth * 0.015, deviceHeight * 0.09, deviceWidth * 0.2, deviceHeight * 0.09, 5, 0xdddddd);
        this.wiringPointLabel = this.add.text(deviceWidth * 0.05, deviceHeight * 0.3, "Wiring Point", 0x000000);
        this.wiringPointLabel.setOrigin(0.5, 0);
        this.binLabel.enableClick();

        this.increaseScaleButton = this.add.circle(deviceWidth * 0.88, deviceHeight * 0.94, deviceWidth * 0.02, 0xF4F5F6);
        this.increaseScaleButton.enableClick();
        this.increaseScaleButton.setAlpha(0.1);
        this.decreaseScaleButton = this.add.circle(deviceWidth * 0.84, deviceHeight * 0.94, deviceWidth * 0.02, 0xF4F5F6);
        this.decreaseScaleButton.enableClick();
        this.decreaseScaleButton.setAlpha(0.1);

        this.increaseScale = this.add.sprite(deviceWidth * 0.88, deviceHeight * 0.94, "increasescale");
        this.increaseScale.setScale(0.04);
        this.increaseScale.enableClick();
        this.decreaseScale = this.add.sprite(deviceWidth * 0.84, deviceHeight * 0.94, "decreasescale");
        this.decreaseScale.setScale(0.04);
        this.decreaseScale.enableClick();

        this.nextStepButton = this.add.rectangle(deviceWidth * 0.95, deviceHeight * 0.94, deviceWidth * 0.07, deviceHeight * 0.075, 0x3fce29);
        this.nextStepButton.enableClick();
        this.nextStep = this.add.text(deviceWidth * 0.95, deviceHeight * 0.94, "Next ►");
        this.nextStep.setOrigin(0.5, 0.5);
        this.nextStep.setFontSize(deviceHeight * 0.03);
        this.nextStep.enableClick();

        this.home = this.add.sprite(deviceWidth * 0.95, deviceHeight * 0.1, "home");
        this.home.setScale(0.15)
        this.home.enableClick();

        this.magnet = this.add.sprite(deviceWidth * 0.79, deviceHeight * 0.94, "magnet");
        this.magnet.setScale(0.55);
        this.magnet.enableClick();
        this.slash = this.add.sprite(deviceWidth * 0.79, deviceHeight * 0.94, "slash");
        this.slash.setScale(0.5);
        this.slash.enableClick();
        this.slash.setVisible(0);

        var pointer = this.input.activePointer;

        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {

            object.x -= deltaX * 0.2;
            object.y -= deltaY * 0.2;

        });

            this.popupover = this.add.rectangle(deviceWidth/2,deviceHeight/2,deviceWidth,deviceHeight,0xffffff);
      this.popupover.setAlpha(0.5);
      this.popupover.setVisible(0);
      this.popup = this.add.rectangle(deviceWidth/2,deviceHeight/2,deviceWidth*0.6,deviceHeight*0.3,0xcccccc);
      this.popup.setVisible(0)
      this.popuptext = this.add.text(deviceWidth/2,deviceHeight*0.45,"Are you sure you want to leave? You will lose your work.",0x000000);
      this.popuptext.setOrigin(0.5,0.5);
      this.popuptext.setFontSize(deviceHeight*0.04);
      this.popuptext.setVisible(0);
      this.popupcancel = this.add.rectangle(deviceWidth*0.44,deviceHeight*0.55,deviceWidth*0.1,deviceHeight*0.05,0xed4040);
      this.popupcancel.enableClick();
      this.popupcancel.setVisible(0);
      this.popupyes = this.add.rectangle(deviceWidth*0.56,deviceHeight*0.55,deviceWidth*0.1,deviceHeight*0.05,0xaaaaaa);
      this.popupyes.enableClick();
      this.popupyes.setVisible(0);
      this.popupcanceltext = this.add.text(deviceWidth*0.44,deviceHeight*0.55,"Cancel",0x000000);
      this.popupcanceltext.setOrigin(0.5,0.5);
      this.popupcanceltext.setFontSize(deviceHeight*0.03);
      this.popupcanceltext.enableClick();
      this.popupcanceltext.setVisible(0);
      this.popupyestext = this.add.text(deviceWidth*0.56,deviceHeight*0.55,"Yes",0x000000);
      this.popupyestext.setOrigin(0.5,0.5);
      this.popupyestext.setFontSize(deviceHeight*0.03);
      this.popupyestext.enableClick();
      this.popupyestext.setVisible(0);

    }

    update() {
        const pElement = document.getElementsByTagName("body")[0];
        pElement.style.cursor = "url('https://i.ibb.co/hsnxb67/icons8-cursor-30.png'), auto";

        if (this.home.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.home.setAlpha(0.5);
        } else {
            this.home.setAlpha(1);
        }
      if(!(this.input.activePointer.isDown == true)){
        this.crossV.setAlpha(0);
        this.crossH.setAlpha(0);
      }

      if(this.popupcancel.isOver() || this.popupcanceltext.isOver()){
        pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.popupcancel.fillColor = 0xff9999;
      }else{
        this.popupcancel.fillColor = 0xed4040;
      }

      if(this.popupyes.isOver() || this.popupyestext.isOver()){
        pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.popupyes.fillColor = 0xeeeeee;
      }else{
        this.popupyes.fillColor = 0xaaaaaa;
      }


        if (this.increaseScale.isOver() || this.decreaseScale.isOver() || this.increaseScaleButton.isOver() || this.decreaseScaleButton.isOver() || this.nextStep.isOver() || this.nextStepButton.isOver() || this.binHandle.isOver() || this.binHandleArrow.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
        }

        for (let i = 0; i < this.wiringPoint.length; i++) {
            if (this.wiringPoint[i].isOver()) {
                pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
                this.wiringPoint[i].fillColor = (0xf46464);
            } else {
                this.wiringPoint[i].fillColor = (0xff0000);
            }

            if (this.wiringPoint[i].x != deviceWidth * 0.05 && this.wiringPoint[i].y != deviceHeight * 0.22 && this.wiringPoint[i].isClicked()) {
                if (this.slash.visible == 0) {
                    for (var v = 1; v < 51; v++) {
                        if (Math.abs((this.wiringPoint[i].x - (v * deviceWidth * 0.02))) < (deviceWidth * 0.02) / 2 && Math.abs((this.wiringPoint[i].x - (v * deviceWidth * 0.02))) > 0) {
                            this.wiringPoint[i].x = v * deviceWidth * 0.02;
                          this.crossV.setTo(this.wiringPoint[i].x,0,this.wiringPoint[i].x,deviceHeight);
                        }
                    }
                    for (var v = 1; v < 26; v++) {
                        if (Math.abs((this.wiringPoint[i].y - (v * deviceHeight * 0.04))) < (deviceHeight * 0.04) / 2 && Math.abs((this.wiringPoint[i].y - (v * deviceHeight * 0.04))) > 0) {
                            this.wiringPoint[i].y = v * deviceHeight * 0.04;
              this.crossH.setTo(0,this.wiringPoint[i].y,deviceWidth,this.wiringPoint[i].y)
                        }
                    }
                }
            }

            if (this.wiringPoint[i].isClicked()) {
                this.wiringPoint[i].setDepth(3);
              this.crossV.setTo(this.wiringPoint[i].x,0,this.wiringPoint[i].x,deviceHeight);
              this.crossH.setTo(0,this.wiringPoint[i].y,deviceWidth,this.wiringPoint[i].y)
              this.crossV.setAlpha(1);
              this.crossH.setAlpha(1);
            }
          
            this.wiringPointLabel.setDepth(1);
            this.binLabel.setDepth(1);
            this.binLabelDivider.setDepth(1);
            this.binHandleArrow.setDepth(1);
            this.binHandle.setDepth(1);
            this.itemBin.setDepth(1);
          this.magnet.setDepth(1);
          this.slash.setDepth(1);
            this.crossV.setDepth(2);
            this.crossH.setDepth(2);

            if (this.wiringPoint[i].isClicked() && (this.wiringPoint[i].x > deviceWidth * 0.21 || itemBinOpen == false)) {
                for (var v = 0; v < i; v++) {
                    if (this.wiringPoint[v].x > deviceWidth * 0.21 || itemBinOpen == false) {
                        if (this.wiringPoint[v].x > this.wiringPoint[i].x - 10 && this.wiringPoint[v].x < this.wiringPoint[i].x + 10) {
                            matchx = true;
                            xcoor = this.wiringPoint[v].x;

                            for (var t = 0; t < v; t++) {
                                if (this.wiringPoint[t].x == this.wiringPoint[v].x) {
                                    matchydist = true;
                                    if (Math.abs(this.wiringPoint[i].y - this.wiringPoint[v].y) < Math.abs(this.wiringPoint[i].y - this.wiringPoint[t].y)) {
                                        if (this.wiringPoint[i].y < this.wiringPoint[v].y) {
                                            ydist = this.wiringPoint[v].y - Math.abs(this.wiringPoint[v].y - this.wiringPoint[t].y);
                                        } else {
                                            ydist = this.wiringPoint[v].y + Math.abs(this.wiringPoint[v].y - this.wiringPoint[t].y);
                                        }
                                    } else {
                                        if (this.wiringPoint[i].y < this.wiringPoint[t].y) {
                                            ydist = this.wiringPoint[t].y - Math.abs(this.wiringPoint[v].y - this.wiringPoint[t].y);
                                        } else {
                                            ydist = this.wiringPoint[t].y + Math.abs(this.wiringPoint[v].y - this.wiringPoint[t].y);
                                        }
                                    }
                                }
                            }
                            for (var t = this.wiringPoint.length - 1; t > v; t--) {
                                if (this.wiringPoint[t].x == this.wiringPoint[v].x) {
                                    matchydist = true;
                                    if (Math.abs(this.wiringPoint[i].y - this.wiringPoint[v].y) < Math.abs(this.wiringPoint[i].y - this.wiringPoint[t].y)) {
                                        if (this.wiringPoint[i].y < this.wiringPoint[v].y) {
                                            ydist = this.wiringPoint[v].y - Math.abs(this.wiringPoint[v].y - this.wiringPoint[t].y);
                                        } else {
                                            ydist = this.wiringPoint[v].y + Math.abs(this.wiringPoint[v].y - this.wiringPoint[t].y);
                                        }
                                    } else {
                                        if (this.wiringPoint[i].y < this.wiringPoint[t].y) {
                                            ydist = this.wiringPoint[t].y - Math.abs(this.wiringPoint[v].y - this.wiringPoint[t].y);
                                        } else {
                                            ydist = this.wiringPoint[t].y + Math.abs(this.wiringPoint[v].y - this.wiringPoint[t].y);
                                        }
                                    }
                                }
                            }
                        }
                        if (this.wiringPoint[v].y > this.wiringPoint[i].y - 10 && this.wiringPoint[v].y < this.wiringPoint[i].y + 10) {
                            matchy = true;
                            ycoor = this.wiringPoint[v].y;
                            for (var t = 0; t < v; t++) {
                                if (this.wiringPoint[t].y == this.wiringPoint[v].y) {
                                    matchxdist = true;
                                    if (Math.abs(this.wiringPoint[i].x - this.wiringPoint[v].x) < Math.abs(this.wiringPoint[i].x - this.wiringPoint[t].x)) {
                                        if (this.wiringPoint[i].x < this.wiringPoint[v].x) {
                                            xdist = this.wiringPoint[v].x - Math.abs(this.wiringPoint[v].x - this.wiringPoint[t].x);
                                        } else {
                                            xdist = this.wiringPoint[v].x + Math.abs(this.wiringPoint[v].x - this.wiringPoint[t].x);
                                        }
                                    } else {
                                        if (this.wiringPoint[i].y < this.wiringPoint[t].y) {
                                            xdist = this.wiringPoint[t].x - Math.abs(this.wiringPoint[v].x - this.wiringPoint[t].x);
                                        } else {
                                            xdist = this.wiringPoint[t].x + Math.abs(this.wiringPoint[v].x - this.wiringPoint[t].x);
                                        }
                                    }
                                }
                            }
                            for (var t = this.wiringPoint.length - 1; t > v; t--) {
                                if (this.wiringPoint[t].y == this.wiringPoint[v].y) {
                                    matchxdist = true;
                                    if (Math.abs(this.wiringPoint[i].x - this.wiringPoint[v].x) < Math.abs(this.wiringPoint[i].x - this.wiringPoint[t].x)) {
                                        if (this.wiringPoint[i].x < this.wiringPoint[v].x) {
                                            xdist = this.wiringPoint[v].x - Math.abs(this.wiringPoint[v].x - this.wiringPoint[t].x);
                                        } else {
                                            xdist = this.wiringPoint[v].x + Math.abs(this.wiringPoint[v].x - this.wiringPoint[t].x);
                                        }
                                    } else {
                                        if (this.wiringPoint[i].x < this.wiringPoint[t].x) {
                                            xdist = this.wiringPoint[t].x - Math.abs(this.wiringPoint[v].x - this.wiringPoint[t].x);
                                        } else {
                                            xdist = this.wiringPoint[t].x + Math.abs(this.wiringPoint[v].x - this.wiringPoint[t].x);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                for (var v = this.wiringPoint.length - 1; v > i; v--) {
                    if (this.wiringPoint[v].x > deviceWidth * 0.21 || itemBinOpen == false) {
                        if (this.wiringPoint[v].x > this.wiringPoint[i].x - 10 && this.wiringPoint[v].x < this.wiringPoint[i].x + 10) {
                            matchx = true;
                            xcoor = this.wiringPoint[v].x;
                        }
                        if (this.wiringPoint[v].y > this.wiringPoint[i].y - 10 && this.wiringPoint[v].y < this.wiringPoint[i].y + 10) {
                            matchy = true;
                            ycoor = this.wiringPoint[v].y;
                        }
                    }
                }

                if (this.wiringPoint[i].x > xdist - 10 && this.wiringPoint[i].x < xdist + 10) {
                    secureSpotX = true;
                }
                if (this.wiringPoint[i].y > ydist - 10 && this.wiringPoint[i].y < ydist + 10) {
                    secureSpotY = true;
                }
            }


            if (matchx == true) {
                this.wiringPoint[i].setX(xcoor);
                if (secureSpotY == true) {
                    this.wiringPoint[i].setY(ydist);
                }
            }
            if (matchy == true) {
                this.wiringPoint[i].setY(ycoor);
                if (secureSpotX == true) {
                    this.wiringPoint[i].setX(xdist);
                }
            }
            matchx = false;
            matchy = false;
            matchxdist = false;
            matchydist = false;
            secureSpotX = false;
            secureSpotY = false;
        }

            if (this.binHandleArrow.wasClicked() || this.binHandle.wasClicked()) {
                if (itemBinOpen == true) {
                    if (closing == false) {
                        closing = true;
                        this.binHandleArrow.setAngle(0);
                    }
                } else {
                    if (opening == false) {
                        opening = true;
                        this.binHandleArrow.setAngle(180);
                    }
                }
            }

            if (this.magnet.isOver() || this.slash.isOver()) {
                pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            } else {
                this.object.setTint(0xffffff);
            }

            if (this.magnet.wasClicked() || this.slash.wasClicked()) {
                if (this.slash.visible == 0) {
                    this.slash.setVisible(1);
                } else {
                    this.slash.setVisible(0);
                }
            }
      
        if (this.binHandleArrow.x <= deviceWidth * 0.015) {
            closing = false;
            itemBinOpen = false;
        }

      

        if (this.binHandleArrow.x >= deviceWidth * 0.21) {
            opening = false;
            itemBinOpen = true;
            this.binLabel.setAlpha(1);
            this.binLabelDivider.setAlpha(1);
             this.wiringPointLabel.setAlpha(1);
            }

        if (closing == true) {
            this.itemBin.x -= 10;
            this.binHandle.x -= 10;
            this.binHandleArrow.x -= 10;
            this.binLabel.setAlpha(0);
            this.binLabelDivider.setAlpha(0);
            this.wiringPointLabel.setAlpha(0);
            for (var v = 0; v < this.wiringPoint.length; v++) {
                if (this.wiringPoint[v].x == deviceWidth * 0.05 && this.wiringPoint[v].y == deviceHeight * 0.22) {
                    this.wiringPoint[v].destroy();
                }
            }
         clean(this.wiringPoint)
        }

        if (opening == true) {
            this.itemBin.x += 10;
            this.binHandle.x += 10;
            this.binHandleArrow.x += 10;
        }


        if (this.increaseScale.isClicked() || this.increaseScaleButton.isClicked()) {
            this.object.scale *= 1.005;
          this.object.width *= 1.005;
          this.object.height *= 1.005;
            for (var v = 0; v < this.wiringPoint.length; v++) {
                if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                    this.wiringPoint[v].x = ((this.wiringPoint[v].x - this.object.x) * 1.005) + this.object.x;
                    this.wiringPoint[v].y = ((this.wiringPoint[v].y - this.object.y) * 1.005) + this.object.y;
                }
            }
        }

        if (this.decreaseScale.isClicked() || this.decreaseScaleButton.isClicked()) {
            this.object.scale *= 0.995;
          this.object.width *= 0.995;
          this.object.height *= 0.995;
            for (var v = 0; v < this.wiringPoint.length; v++) {
                if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                    this.wiringPoint[v].x = ((this.wiringPoint[v].x - this.object.x) * 0.995) + this.object.x;
                    this.wiringPoint[v].y = ((this.wiringPoint[v].y - this.object.y) * 0.995) + this.object.y;
                }
            }
        }

        if (itemBinOpen == true && closing == false) {
            var create = false;
            for(var v = 0; v < this.wiringPoint.length; v++){
              if(this.wiringPoint[v].x < deviceWidth * 0.21 && !(this.wiringPoint[v].isClicked()) && !(this.wiringPoint[v].intersects(this.object))){
                this.wiringPoint[v].x = deviceWidth * 0.05;
                this.wiringPoint[v].y = deviceHeight * 0.22;
                this.wiringPoint[v].setDepth(2);
              }else{
                if(this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22 && !(this.wiringPoint[v].isClicked())){
                this.wiringPoint[v].setDepth(0);
                }
              }
              if(this.wiringPoint[v].x == deviceWidth * 0.05 && this.wiringPoint[v].y == deviceHeight * 0.22){
                create = true;
              }
            }
          if(create == false){
            let obj = this.add.circle(deviceWidth * 0.05, deviceHeight * 0.22, deviceWidth * 0.005, 0xff0000);
            obj.width = deviceWidth*0.02;
            obj.height = deviceWidth*0.02;
                obj.enableClick();
                obj.enableDrag();
                this.wiringPoint.push(obj);
          }
          for(var v = 0; v < this.wiringPoint.length - 1; v++){
            if(this.wiringPoint[v].x == deviceWidth * 0.05 && this.wiringPoint[v].y == deviceHeight * 0.22){
              this.wiringPoint[v].destroy();
            }
          }
          clean(this.wiringPoint)
        }


        if (this.binLabel.wasClicked() || this.nextStep.wasClicked() || this.nextStepButton.wasClicked()) {
            for (var v = 0; v < this.wiringPoint.length; v++) {
                if (this.wiringPoint[v].intersects(this.object)) {
                    locX[locX.length] = (this.wiringPoint[v].x - this.object.x) / this.object.width;
                    locY[locY.length] = (this.wiringPoint[v].y - this.object.y) / this.object.height;
                }
            }

            workshopScale = this.object.scale;

            objectInfo = ["\"<Object Name>\"", "\"<Object Type>\"", workshopScale];

            this.scene.start("Step3");
        }

                if (this.home.wasClicked()) {
          this.popupover.setVisible(1);
          this.popupover.setDepth(5);
          this.popup.setVisible(1);
          this.popup.setDepth(6);
          this.popuptext.setVisible(1);
          this.popuptext.setDepth(7);
          this.popupcancel.setVisible(1);
          this.popupcancel.setDepth(7);
          this.popupyes.setVisible(1);
          this.popupyes.setDepth(7);
          this.popupcanceltext.setVisible(1);
          this.popupcanceltext.setDepth(8);
          this.popupyestext.setVisible(1);
          this.popupyestext.setDepth(8);
        }

      if(this.popupcancel.wasClicked() || this.popupcanceltext.wasClicked()){
        this.popupover.setVisible(0);
        this.popup.setVisible(0);
        this.popuptext.setVisible(0);
        this.popupcancel.setVisible(0);
        this.popupyes.setVisible(0);
        this.popupcanceltext.setVisible(0);
        this.popupyestext.setVisible(0);
      }

      if(this.popupyes.wasClicked() || this.popupyestext.wasClicked()){
        this.scene.start("Menu");
      }
    }
}
