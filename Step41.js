let wiringXPoints = {
    x0: [-0.2224101622247, -0.1786268360115335, 0.18782608695652173, -0.06191304347826091],
    x1: [-0.4659403153633775, -0.3309482613795956],
    x2: [0.012844036697246156, 0.04692005242463803, 0.08099606815202991],
    x3: [-0.002547770700637522, -0.002547770700637522]
};

let wiringYPoints = {
    y0: [-0.5983869549299624, -0.5983869549299624, -0.5983869549299624, 0.5759803921568636],
    y1: [-0.6962504266508758, 0.696250426650873],
    y2: [0.15849739987527595, 0.15849739987527595, 0.15849739987527595],
    y3: [-0.15615615615615633, 0.13213213213213196]
};

let objectsData = [
  "Arduino UNO", "Microcontrollers", 1.3488501525493075,
  "Arduino MEGA", "Microcontrollers", 1.5487197695815458,
  "Relay", "Other", 0.31857907915693673,
  "Resistor", "Electrical", 0.3488864431110525,

];


var objectID = 0;
var itemObjectID = [];
var itemObjectData = [];
var currentItemType = 0;
var currentPage = 0;
var itemTypes = ["All", "Microcontrollers", "Electrical", "Modules", "Other"];
var scaleCount = 1;
var snapPlacementX = 0.02;
var snapPlacementY = 0.04;
var snapStartX = -10010;
var snapStartY = -10006;
var grid;
var activeWire = false;
var activeWireXY = [];
var down = false;
var up = true;
var del = 0;
var wireLinks = [];
var wireColors = [];
var nodeLinks = [];
var pass = false;
var lineWidth;
var wireClick = 0;
var clickTime = 0;

class Step4 extends SimpleScene {

    constructor() {
        super("Step4");
    }

    init() {}

    preload() {
        this.load.image("binhandlearrow", "assets/binhandlearrow.png");
        this.load.image("increasescale", "assets/increasescale.png");
        this.load.image("decreasescale", "assets/decreasescale.png");
        this.load.image("home", "assets/home.png");
        this.load.image("grid", "assets/grid.jpeg");
        this.load.image("magnet", "assets/magnet.png");
        this.load.image("slash", "assets/slash.png");
        this.load.image("arrow", "assets/arrow.png");
        this.load.image("rotate", "assets/rotate.png");

        objectID = 0;
        for (var i = 0; i < objectsData.length / 3; i++) {
            this.load.image(`${objectID}`, `workspace-objects/${objectID}.png`);
            objectID++;
        }
    }

    create() {
        document.getElementById('downloadObjectInfo').innerHTML = "";
        document.getElementById('downloadObjectInfo').href = "#";
        document.getElementById('downloadXLink').innerHTML = "";
        document.getElementById('downloadXLink').href = "#";
        document.getElementById('downloadYLink').innerHTML = "";
        document.getElementById('downloadYLink').href = "#";

        this.title = this.add.text(deviceWidth / 2, deviceHeight * 0.045, "WORKSPACE", 0x999999);
        this.title.setOrigin(0.5, 0);
        this.title.setFontSize(deviceHeight * 0.075);
        this.title.setDepth(1);
        this.instructions = this.add.text(deviceWidth / 2, deviceHeight * 0.15, "Create a wiring diagram here.", 0x000000)
        this.instructions.setOrigin(0.5, 0);
        this.instructions.setFontSize(deviceHeight * 0.03);
        this.instructions.setDepth(1);

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
        this.binLabel.enableClick();

        this.nextPageButton = this.add.rectangle(deviceWidth * 0.1, deviceHeight * 0.97, deviceWidth * 0.22, deviceWidth * 0.03, 0xffffff);
        this.nextPageButton.setAlpha(0.3);
        this.nextPageButton.enableDrag();
        this.nextPageButton.enableClick();
        this.nextPageArrow = this.add.sprite(deviceWidth * 0.1, deviceHeight * 0.97, "binhandlearrow");
        this.nextPageArrow.setScale(0.04);
        this.nextPageArrow.setAngle(90);
        this.nextPageArrow.enableClick();

        this.itemTypeButton = this.add.circle(deviceWidth * 0.18, deviceHeight * 0.05, deviceWidth * 0.05, 0xF4F5F6);
        this.itemTypeButton.enableClick();
        this.itemTypeButton.setAlpha(0);

        this.itemTypeArrow = this.add.text(deviceWidth * 0.16, deviceHeight * 0.015, "⇄", 0x999999);
        this.itemTypeArrow.setFontSize(40);
        this.itemTypeArrow.enableClick();

        objectID = 0;
        this.items = [];
        this.itemLabels = [];
        var v = 0;
        for (var i = 0; i < objectsData.length / 3; i++) {
            if (v < 8) {
                var obj;
                var label;
                if (i % 2 == 0) {
                    obj = this.add.sprite(deviceWidth * 0.05, (Math.floor(i / 2) * deviceHeight * 0.21) + deviceHeight * 0.2, `${objectID}`);
                    label = this.add.text(deviceWidth * 0.05, (Math.floor(i / 2) * deviceHeight * 0.18) + deviceHeight * 0.3, objectsData[i * 3], 0x000000);
                }
                if (i % 2 == 1) {
                    obj = this.add.sprite(deviceWidth * 0.15, (Math.floor(i / 2) * deviceHeight * 0.21) + deviceHeight * 0.2, `${objectID}`);
                    label = this.add.text(deviceWidth * 0.15, (Math.floor(i / 2) * deviceHeight * 0.18) + deviceHeight * 0.3, objectsData[i * 3], 0x000000);
                }
                obj.scale *= (objectsData[(i * 3) + 2]);
                obj.width *= (objectsData[(i * 3) + 2]);
                obj.height *= (objectsData[(i * 3) + 2])
                obj.width *= 10;
                obj.height *= 10;
                while (obj.width < 1000 && obj.height < 600) {
                    obj.width *= 1.1;
                    obj.scale *= 1.1;
                    obj.height *= 1.1;
                }
                while (obj.width > 1200 || obj.height > 700) {
                    obj.width *= 0.9;
                    obj.scale *= 0.9;
                    obj.height *= 0.9;
                }
                obj.enableClick();
                this.items.push(obj);
                itemObjectID.push(objectID);
                itemObjectData.push(i);
                label.setOrigin(0.5, 0);
                this.itemLabels.push(label);
                objectID++;
                v++;
            }
        }

        this.objects = [];
        var object = this.objects;
        this.objectIDs = [];

        this.wires = [];
        this.wireLines = [];
        lineWidth = deviceWidth * 0.005;
        this.activeWire = this.add.line(0, 0, 0, 0, 0xff0000);
        this.activeWire.setLineWidth(3);

        this.nodes = [];

        this.leftarrow = this.add.key("LEFT");
        this.rightarrow = this.add.key("RIGHT");
        this.uparrow = this.add.key("UP");
        this.downarrow = this.add.key("DOWN")
        this.shift = this.add.key("SHIFT");
        this.del = this.add.key("BACKSPACE");
        this.esc = this.add.key("ESC")

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

        this.saveButton = this.add.rectangle(deviceWidth * 0.95, deviceHeight * 0.94, deviceWidth * 0.07, deviceHeight * 0.075, 0x3fce29);
        this.saveButton.enableClick();
        this.save = this.add.text(deviceWidth * 0.95, deviceHeight * 0.94, "Save");
        this.save.setOrigin(0.5, 0.5);
        this.save.setFontSize(deviceHeight * 0.03);
        this.save.enableClick();

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

        this.newgrid = this.add.gridLayout(snapStartX, snapStartY, 100000, 100000, deviceWidth * snapPlacementX, deviceHeight * snapPlacementY);
        this.newgrid.setOutlineStyle(0xdddddd, 0.5)
        this.newgrid.setDepth(0);
        grid = this.newgrid;

        var pointer = this.input.activePointer;

        this.wiringPointer = this.add.circle(0, 0, deviceWidth * 0.005, 0xff0000);

        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {

            grid.x -= deltaX * 0.2;
            grid.y -= deltaY * 0.2;
            snapStartX -= deltaX * 0.2;
            snapStartY -= deltaY * 0.2;

            for (var i = 0; i < object.length; i++) {
                object[i].x -= deltaX * 0.2;
                object[i].y -= deltaY * 0.2;
            }

        });

        this.popupover = this.add.rectangle(deviceWidth / 2, deviceHeight / 2, deviceWidth, deviceHeight, 0xffffff);
        this.popupover.setAlpha(0.5);
        this.popupover.setVisible(0);
        this.popup = this.add.rectangle(deviceWidth / 2, deviceHeight / 2, deviceWidth * 0.6, deviceHeight * 0.3, 0xcccccc);
        this.popup.setVisible(0)
        this.popuptext = this.add.text(deviceWidth / 2, deviceHeight * 0.45, "Are you sure you want to leave? You will lose your work.", 0x000000);
        this.popuptext.setOrigin(0.5, 0.5);
        this.popuptext.setFontSize(deviceHeight * 0.04);
        this.popuptext.setVisible(0);
        this.popupcancel = this.add.rectangle(deviceWidth * 0.44, deviceHeight * 0.55, deviceWidth * 0.1, deviceHeight * 0.05, 0xed4040);
        this.popupcancel.widht = deviceWidth * 0.1;
        this.popupcancel.height = deviceHeight * 0.05;
        this.popupcancel.enableClick();
        this.popupcancel.setVisible(0);
        this.popupyes = this.add.rectangle(deviceWidth * 0.56, deviceHeight * 0.55, deviceWidth * 0.1, deviceHeight * 0.05, 0xaaaaaa);
        this.popupyes.widht = deviceWidth * 0.1;
        this.popupyes.height = deviceHeight * 0.05;
        this.popupyes.enableClick();
        this.popupyes.setVisible(0);
        this.popupcanceltext = this.add.text(deviceWidth * 0.44, deviceHeight * 0.55, "Cancel", 0x000000);
        this.popupcanceltext.setOrigin(0.5, 0.5);
        this.popupcanceltext.setFontSize(deviceHeight * 0.03);
        this.popupcanceltext.enableClick();
        this.popupcanceltext.setVisible(0);
        this.popupyestext = this.add.text(deviceWidth * 0.56, deviceHeight * 0.55, "Yes", 0x000000);
        this.popupyestext.setOrigin(0.5, 0.5);
        this.popupyestext.setFontSize(deviceHeight * 0.03);
        this.popupyestext.enableClick();
        this.popupyestext.setVisible(0);

        this.popupcandel = this.add.rectangle(deviceWidth * 0.44, deviceHeight * 0.55, deviceWidth * 0.1, deviceHeight * 0.05, 0xaaaaaa);
        this.popupcandel.widht = deviceWidth * 0.1;
        this.popupcandel.height = deviceHeight * 0.05;
        this.popupcandel.enableClick();
        this.popupcandel.setVisible(0);
        this.popupdel = this.add.rectangle(deviceWidth * 0.56, deviceHeight * 0.55, deviceWidth * 0.1, deviceHeight * 0.05, 0xed4040);
        this.popupdel.widht = deviceWidth * 0.1;
        this.popupdel.height = deviceHeight * 0.05;
        this.popupdel.enableClick();
        this.popupdel.setVisible(0);
        this.popupcandeltext = this.add.text(deviceWidth * 0.44, deviceHeight * 0.55, "Cancel", 0x000000);
        this.popupcandeltext.setOrigin(0.5, 0.5);
        this.popupcandeltext.setFontSize(deviceHeight * 0.03);
        this.popupcandeltext.enableClick();
        this.popupcandeltext.setVisible(0);
        this.popupdeltext = this.add.text(deviceWidth * 0.56, deviceHeight * 0.55, "Delete", 0x000000);
        this.popupdeltext.setOrigin(0.5, 0.5);
        this.popupdeltext.setFontSize(deviceHeight * 0.03);
        this.popupdeltext.enableClick();
        this.popupdeltext.setVisible(0);

        this.panel = this.add.rectangle(deviceWidth * 0.7, deviceHeight * 0.2, deviceWidth * 0.3, deviceHeight * 0.3, 0xDDDDDD);
        this.panel.setVisible(0);
        this.paneltext = this.add.text(deviceWidth * 0.7, deviceHeight * 0.2, "Wire", 0x000000);
        this.paneltext.setFontSize(deviceHeight * 0.03);
        this.paneltext.setOrigin(0.5, 0.5);
        this.paneltext.setVisible(0);
        this.palette = this.add.rectangle(deviceWidth * 0.71, deviceHeight * 0.15, deviceWidth * 0.05, deviceWidth * 0.05, 0xED4040);
        this.palette.setVisible(0);

    }

    update() {

        if (down == true) {
            down = false;
        }
        if (this.input.activePointer.isDown == true && up == true) {
            down = true;
            up = false;
        }
        if (this.input.activePointer.isDown == false) {
            up = true;
        }

        const pElement = document.getElementsByTagName("body")[0];
        pElement.style.cursor = "url('https://i.ibb.co/hsnxb67/icons8-cursor-30.png'), auto";

        if (this.home.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.home.setAlpha(0.5);
        } else {
            this.home.setAlpha(1);
        }

        if (this.popupcancel.isOver() || this.popupcanceltext.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.popupcancel.fillColor = 0xff9999;
        } else {
            this.popupcancel.fillColor = 0xed4040;
        }

        if (this.popupyes.isOver() || this.popupyestext.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.popupyes.fillColor = 0xeeeeee;
        } else {
            this.popupyes.fillColor = 0xaaaaaa;
        }

        if (this.popupdel.isOver() || this.popupdeltext.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.popupdel.fillColor = 0xff9999;
        } else {
            this.popupdel.fillColor = 0xed4040;
        }

        if (this.popupcandel.isOver() || this.popupcandeltext.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.popupcandel.fillColor = 0xeeeeee;
        } else {
            this.popupcandel.fillColor = 0xaaaaaa;
        }

        if (this.increaseScale.isOver() || this.decreaseScale.isOver() || this.increaseScaleButton.isOver() || this.decreaseScaleButton.isOver() || this.save.isOver() || this.saveButton.isOver() || this.binHandle.isOver() || this.binHandleArrow.isOver() || this.itemTypeArrow.isOver() || this.itemTypeButton.isOver() || this.magnet.isOver() || this.slash.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
        }

        if (this.nextPageButton.isOver() || this.nextPageArrow.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.nextPageButton.setAlpha(1);
        } else {
            this.nextPageButton.setAlpha(0.3);
        }

        this.binLabel.setDepth(3);
        this.binLabelDivider.setDepth(3);
        this.itemTypeButton.setDepth(3);
        this.itemTypeArrow.setDepth(3);
        this.binHandleArrow.setDepth(3);
        this.binHandle.setDepth(3);
        this.nextPageButton.setDepth(3);
        this.nextPageArrow.setDepth(3);
        this.itemBin.setDepth(3);
        this.increaseScaleButton.setDepth(3);
        this.decreaseScaleButton.setDepth(3);
        this.increaseScale.setDepth(3);
        this.decreaseScale.setDepth(3);
        this.home.setDepth(3);
        this.saveButton.setDepth(3);
        this.save.setDepth(3);
        this.magnet.setDepth(3);
        this.slash.setDepth(3);
        this.panel.setDepth(3);
        this.paneltext.setDepth(3);
        this.palette.setDepth(3);
        for (var i = 0; i < this.itemLabels.length; i++) {
            if (this.items[i].x < deviceWidth * 0.22) {
                this.items[i].setDepth(4);
                this.itemLabels[i].setDepth(4);
            }
        }

        if (this.magnet.wasClicked() || this.slash.wasClicked()) {
            if (this.slash.visible == 0) {
                this.slash.setVisible(1);
            } else {
                this.slash.setVisible(0);
            }
        }

        if (this.itemTypeArrow.wasClicked() || this.itemTypeButton.wasClicked()) {
            currentPage = 0;
            currentItemType++;
            if (currentItemType == 5) {
                currentItemType = 0;
            }
            itemObjectID.splice(0, itemObjectID.length);
            itemObjectData.splice(0, itemObjectData.length);
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].destroy();
                this.itemLabels[i].destroy();
            }
            clean(this.items);
            clean(this.itemLabels);
            this.binLabel.setText(itemTypes[currentItemType]);

            if (currentItemType == 1) {
                this.binLabel.setFontSize(deviceHeight * 0.035);
                this.binLabel.setY(deviceHeight * 0.035);
            } else {
                this.binLabel.setFontSize(deviceHeight * 0.045)
                this.binLabel.setY(deviceHeight * 0.03);
            }

            objectID = 0;
            var v = 0;
            for (var i = 0; i < objectsData.length / 3; i++) {
                var obj;
                var label;
                if (currentItemType == 0 || objectsData[(i * 3) + 1] == itemTypes[currentItemType]) {
                    if (v % 2 == 0) {
                        obj = this.add.sprite(deviceWidth * 0.05, (Math.floor(v / 2) * deviceHeight * 0.2) + deviceHeight * 0.2, `${objectID}`);
                        label = this.add.text(deviceWidth * 0.05, (Math.floor(v / 2) * deviceHeight * 0.18) + deviceHeight * 0.3, objectsData[i * 3], 0x000000);
                    }
                    if (v % 2 == 1) {
                        obj = this.add.sprite(deviceWidth * 0.15, (Math.floor(v / 2) * deviceHeight * 0.2) + deviceHeight * 0.2, `${objectID}`);
                        label = this.add.text(deviceWidth * 0.15, (Math.floor(v / 2) * deviceHeight * 0.18) + deviceHeight * 0.3, objectsData[i * 3], 0x000000);
                    }
                    obj.scale *= (objectsData[(i * 3) + 2]);
                    obj.width *= (objectsData[(i * 3) + 2]);
                    obj.height *= (objectsData[(i * 3) + 2]);
                    obj.width *= 10;
                    obj.height *= 10;
                    while (obj.width < 1000 && obj.height < 600) {
                        obj.width *= 1.1;
                        obj.scale *= 1.1;
                        obj.height *= 1.1;
                    }
                    while (obj.width > 1200 || obj.height > 700) {
                        obj.width *= 0.9;
                        obj.scale *= 0.9;
                        obj.height *= 0.9;
                    }
                    obj.enableClick();
                    this.items[v] = obj;
                    itemObjectID.push(objectID);
                    itemObjectData.push(i);
                    label.setOrigin(0.5, 0);
                    this.itemLabels[v] = label;
                    v++;
                }
                objectID++;
            }

        }

        if (this.nextPageArrow.wasClicked() || this.nextPageButton.wasClicked()) {
            currentPage++;
            itemObjectID.splice(0, itemObjectID.length);
            itemObjectData.splice(0, itemObjectData.length);
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].destroy();
                this.itemLabels[i].destroy();
            }
            clean(this.items);
            clean(this.itemLabels);

            objectID = 0;
            var v = 0;
            for (var i = 0; i < objectsData.length / 3; i++) {
                if (v < 8) {
                    var obj;
                    var label;
                    if (currentItemType == 0 || objectsData[(i * 3) + 1] == itemTypes[currentItemType]) {
                        if (v >= currentPage * 2) {
                            if (v % 2 == 0) {
                                obj = this.add.sprite(deviceWidth * 0.05, (Math.floor((v - currentPage * 2) / 2) * deviceHeight * 0.2) + deviceHeight * 0.2, `${objectID}`);
                                label = this.add.text(deviceWidth * 0.05, (Math.floor((v - currentPage * 2) / 2) * deviceHeight * 0.18) + deviceHeight * 0.3, objectsData[i * 3], 0x000000);
                            }
                            if (v % 2 == 1) {
                                obj = this.add.sprite(deviceWidth * 0.15, (Math.floor((v - currentPage * 2) / 2) * deviceHeight * 0.2) + deviceHeight * 0.2, `${objectID}`);
                                label = this.add.text(deviceWidth * 0.15, (Math.floor((v - currentPage * 2) / 2) * deviceHeight * 0.18) + deviceHeight * 0.3, objectsData[i * 3], 0x000000);
                            }
                            obj.scale *= (objectsData[(i * 3) + 2]);
                            obj.width *= (objectsData[(i * 3) + 2]);
                            obj.height *= (objectsData[(i * 3) + 2]);
                            obj.width *= 10;
                            obj.height *= 10;
                            while (obj.width < 1000 && obj.height < 600) {
                                obj.width *= 1.1;
                                obj.scale *= 1.1;
                                obj.height *= 1.1;
                            }
                            while (obj.width > 1200 || obj.height > 700) {
                                obj.width *= 0.9;
                                obj.scale *= 0.9;
                                obj.height *= 0.9;
                            }
                            obj.enableClick();
                            this.items[v - currentPage * 2] = obj;
                            itemObjectID.push(objectID);
                            itemObjectData.push(i);
                            label.setOrigin(0.5, 0);
                            this.itemLabels[v - currentPage * 2] = label;
                        }
                        v++;
                    }
                    objectID++;
                }
            }

        }

      if(wireClick == 1){
        clickTime++;
        if(clickTime > 20){
          wireClick = 0;
          clickTime = 0;
        }
      }

      for(var i = 0; i < this.wireLines.length; i++){
        this.wireLines[i].setDepth(3);
      }

        for (var i = 0; i < this.wires.length; i++) {
            this.wires[i].setDepth(3);
            if (this.wires[i].isOver()) {
                pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
                this.wires[i].alpha = 0.5;
            } else {
                this.wires[i].alpha = 1;
            }
            if (this.wires[i].wasClicked()) {
              wireClick++;
                this.panel.setVisible(1);
                this.paneltext.setText("Wire");
                this.paneltext.setVisible(1);
                this.palette.setVisible(1);
              if(wireClick == 2){
                wireClick = 0;
                clickTime = 0;
                var node;
                if(this.wireLines[i].geom.y1 != this.wireLines[i].geom.y2){
                node = this.add.circle((this.input.mousePointer.y-this.wireLines[i].geom.y1)/((this.wireLines[i].geom.y1-this.wireLines[i].geom.y2)/(this.wireLines[i].geom.x1-this.wireLines[i].geom.x2))+this.wireLines[i].geom.x1,this.input.mousePointer.y, deviceWidth * 0.005 * scaleCount, 0xffffff);
                }else{
                  node = this.add.circle(this.input.mousePointer.x,this.wireLines[i].geom.y1,deviceWidth * 0.005 * scaleCount, 0xffffff);
                }
                this.nodes.push(node);
                var node2;
                if(this.wireLines[i].geom.y1 != this.wireLines[i].geom.y2){
                node2 = this.add.circle((this.input.mousePointer.y-this.wireLines[i].geom.y1)/((this.wireLines[i].geom.y1-this.wireLines[i].geom.y2)/(this.wireLines[i].geom.x1-this.wireLines[i].geom.x2))+this.wireLines[i].geom.x1,this.input.mousePointer.y, deviceWidth * 0.005 * scaleCount, wireColors[wireColors.length-1]);
                }else{
                  node2 = this.add.circle(this.input.mousePointer.x,this.wireLines[i].geom.y1,deviceWidth * 0.005 * scaleCount, wireColors[wireColors.length-1]);
                }
                node2.enableClick();
                node2.enableDrag();
                this.nodes.push(node2);
                nodeLinks.push(-3);
                nodeLinks.push(-3);
                nodeLinks.push(-2);
                nodeLinks.push(-2);
                var obj = this.add.line(this.wireLines[i].geom.x1,this.wireLines[i].geom.y1,node.x,node.y,0xffffff);
obj.setLineWidth(deviceWidth*0.002*scaleCount);
                var obj2 = this.add.line(this.wireLines[i].geom.x2,this.wireLines[i].geom.y2,node.x,node.y,0xffffff);
obj2.setLineWidth(deviceWidth*0.002*scaleCount);
                this.wireLines[i].setVisible(0);
                this.wireLines.push(obj);
                this.wireLines.push(obj2);
                wireLinks.push(wireLinks[(i*4)]);
                wireLinks.push(wireLinks[(i*4)+1]);
                wireLinks.push(-2);
                wireLinks.push(-2);
                wireLinks.push(wireLinks[(i*4)+2]);
                wireLinks.push(wireLinks[(i*4)+3]);
                wireLinks.push(-2);
                wireLinks.push(-2);
                var obj3 = this.add.rectangle((this.wireLines[this.wireLines.length-2].geom.x1 + this.wireLines[this.wireLines.length-2].geom.x2) / 2, (this.wireLines[this.wireLines.length-2].geom.y1 + this.wireLines[this.wireLines.length-2].geom.y2) / 2, lineWidth, (Math.sqrt(Math.pow(Math.abs(this.wireLines[this.wireLines.length-2].geom.x1 - this.wireLines[this.wireLines.length-2].geom.x2), 2) + Math.pow(Math.abs(this.wireLines[this.wireLines.length-2].geom.y1-this.wireLines[this.wireLines.length-2].geom.y2), 2))), wireColors[wireColors.length - 1]);
                                obj3.setAngle(-(Math.atan(Math.abs(this.wireLines[this.wireLines.length-2].geom.x1-this.wireLines[this.wireLines.length-2].geom.x2) / Math.abs(this.wireLines[this.wireLines.length-2].geom.y1-this.wireLines[this.wireLines.length-2].geom.y2))) * (180 / Math.PI));
                var obj4 = this.add.rectangle((this.wireLines[this.wireLines.length-1].geom.x1 + this.wireLines[this.wireLines.length-1].geom.x2) / 2, (this.wireLines[this.wireLines.length-1].geom.y1 + this.wireLines[this.wireLines.length-1].geom.y2) / 2, lineWidth, (Math.sqrt(Math.pow(Math.abs(this.wireLines[this.wireLines.length-1].geom.x1 - this.wireLines[this.wireLines.length-1].geom.x2), 2) + Math.pow(Math.abs(this.wireLines[this.wireLines.length-1].geom.y1-this.wireLines[this.wireLines.length-1].geom.y2), 2))), wireColors[wireColors.length - 1]);
                                obj4.setAngle(-(Math.atan(Math.abs(this.wireLines[this.wireLines.length-1].geom.x1-this.wireLines[this.wireLines.length-1].geom.x2) / Math.abs(this.wireLines[this.wireLines.length-1].geom.y1-this.wireLines[this.wireLines.length-1].geom.y2))) * (180 / Math.PI));
                obj3.enableClick();
                obj4.enableClick();
              this.wires.push(obj3);
                this.wires.push(obj4);
                wireColors.push(obj3.fillColor);
                wireColors.push(obj4.fillColor);
                this.wires[i].setVisible(0);
              }
            }
        }

        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].setDepth(5);
          if(nodeLinks[i*2] == -2){
            if(this.nodes[i].isOver()){
              this.nodes[i].alpha = 0.5;
              pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            }else{
              this.nodes[i].alpha = 1;
            }
                      if (this.slash.visible == 0 && this.nodes[i].isClicked()) {
                for (var v = -10000; v < 10000; v++) {

                    if (Math.abs(((v * deviceWidth * snapPlacementX + (snapStartX % (deviceWidth * snapPlacementX))) - this.nodes[i].x)) < (deviceWidth * snapPlacementX) / 2 && Math.abs(((v * deviceWidth * snapPlacementX + (snapStartX % (deviceWidth * snapPlacementX))) - this.nodes[i].x)) > 0) {
                        this.nodes[i].x = (v * deviceWidth * snapPlacementX + (snapStartX % (deviceWidth * snapPlacementX)));
                    }
                }
                for (var v = -10000; v < 10000; v++) {

                    if (Math.abs(((v * deviceHeight * snapPlacementY + (snapStartY % (deviceHeight * snapPlacementY))) - this.nodes[i].y)) < (deviceHeight * snapPlacementY) / 2 && Math.abs(((v * deviceHeight * snapPlacementY + (snapStartY % (deviceHeight * snapPlacementY))) - this.nodes[i].y)) > 0) {
                        this.nodes[i].y = (v * deviceHeight * snapPlacementY + (snapStartY % (deviceHeight * snapPlacementY)));
                    }
                }
            }
          }
        }

        var wiringPointer = false;
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].setDepth(2);
            if (this.objects[i].isClicked()) {
                pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            }
            if (this.objects[i].isOver()) {
                this.objects[i].setTint(0xffbfbf);
                if (this.rightarrow.isPressed() && !(this.shift.isPressed())) {
                    this.objects[i].x += 0.5;
                }
                if (this.leftarrow.isPressed() && !(this.shift.isPressed())) {
                    this.objects[i].x -= 0.5;
                }
                if (this.uparrow.isPressed()) {
                    this.objects[i].y -= 0.5;
                }
                if (this.downarrow.isPressed()) {
                    this.objects[i].y += 0.5;
                }
                if (this.del.wasPressed()) {
                    del = i;
                    this.popupover.setVisible(1);
                    this.popupover.setDepth(5);
                    this.popup.setVisible(1);
                    this.popup.setDepth(6);
                    this.popuptext.setText("Are you sure you want to delete this component?")
                    this.popuptext.setVisible(1);
                    this.popuptext.setDepth(7);
                    this.popupcandel.setVisible(1);
                    this.popupcandel.setDepth(7);
                    this.popupdel.setVisible(1);
                    this.popupdel.setDepth(7);
                    this.popupcandeltext.setVisible(1);
                    this.popupcandeltext.setDepth(8);
                    this.popupdeltext.setVisible(1);
                    this.popupdeltext.setDepth(8);
                  for(var v = 0; v < this.objects.length; v++){
                    this.objects[v].disableClick();
                    this.objects[v].disableDrag();
                  }
                }
                          if (this.shift.isPressed()) {
                if (this.rightarrow.wasPressed()) {
                    this.objects[i].angle += 90;
                    var pointsHolder = [];
                    var widthHolder = this.objects[i].width;
                    this.objects[i].width = this.objects[i].height;
                    this.objects[i].height = widthHolder;
                    for (var v = 0; v < wiringXPoints["x" + this.objectIDs[i]].length; v++) {
                        pointsHolder[v] = wiringXPoints["x" + this.objectIDs[i]][v];
                        wiringXPoints["x" + this.objectIDs[i]][v] = (0 - wiringYPoints["y" + this.objectIDs[i]][v]);
                        wiringYPoints["y" + this.objectIDs[i]][v] = pointsHolder[v];
                    }
                }
                if (this.leftarrow.wasPressed()) {
                    this.objects[i].angle -= 90;
                    var pointsHolder = [];
                    var widthHolder = this.objects[i].width;
                    this.objects[i].width = this.objects[i].height;
                    this.objects[i].height = widthHolder;
                    for (var v = 0; v < wiringXPoints["x" + this.objectIDs[i]].length; v++) {
                        pointsHolder[v] = wiringXPoints["x" + this.objectIDs[i]][v];
                        wiringXPoints["x" + this.objectIDs[i]][v] = (wiringYPoints["y" + this.objectIDs[i]][v]);
                        wiringYPoints["y" + this.objectIDs[i]][v] = (0 - pointsHolder[v]);
                    }

                }
            }
            } else {
                this.objects[i].setTint(0xffffff);
            }

            for (var v = 0; v < this.wireLines.length; v++) {
                if (wireLinks[v * 4] == i) {
                    this.wireLines[v].setTo(this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][wireLinks[(v * 4) + 1]] * this.objects[i].width), this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][wireLinks[(v * 4) + 1]] * this.objects[i].height), this.wireLines[v].geom.x2, this.wireLines[v].geom.y2);

                }
                if (wireLinks[(v * 4) + 2] == i) {
                    this.wireLines[v].setTo(this.wireLines[v].geom.x1, this.wireLines[v].geom.y1, this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][wireLinks[(v * 4) + 3]] * this.objects[i].width), this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][wireLinks[(v * 4) + 3]] * this.objects[i].height));
                }
            }

           /* for (var v = 0; v < this.wires.length; v++) {
                this.wires[v].x = (this.wireLines[v].geom.x1 + this.wireLines[v].geom.x2) / 2;
                this.wires[v].y = (this.wireLines[v].geom.y1 + this.wireLines[v].geom.y2) / 2;
                this.wires[v].height = Math.sqrt(Math.pow(Math.abs(this.wireLines[v].geom.x1 - this.wireLines[v].geom.x2), 2) + Math.pow(Math.abs(this.wireLines[v].geom.y1 - this.wireLines[v].geom.y2), 2));
                if ((this.wireLines[v].geom.x1 < this.wireLines[v].geom.x2 && this.wireLines[v].geom.y1 < this.wireLines[v].geom.y2) || (this.wireLines[v].geom.x1 > this.wireLines[v].geom.x2 && this.wireLines[v].geom.y1 > this.wireLines[v].geom.y2)) {
                    this.wires[v].setAngle((-Math.atan(Math.abs(this.wireLines[v].geom.x1 - this.wireLines[v].geom.x2) / Math.abs(this.wireLines[v].geom.y1 - this.wireLines[v].geom.y2))) * (180 / Math.PI));
                }
                if ((this.wireLines[v].geom.x1 > this.wireLines[v].geom.x2) && (this.wireLines[v].geom.y1 < this.wireLines[v].geom.y2) || (this.wireLines[v].geom.x1 < this.wireLines[v].geom.x2 && this.wireLines[v].geom.y1 > this.wireLines[v].geom.y2)) {
                    this.wires[v].setAngle((Math.atan(Math.abs(this.wireLines[v].geom.x1 - this.wireLines[v].geom.x2) / Math.abs(this.wireLines[v].geom.y1 - this.wireLines[v].geom.y2))) * (180 / Math.PI));
                }
                this.wires[v].setOrigin(0.5, 0.5);
            }*/

            for (var v = 0; v < this.nodes.length; v++) {
                if (nodeLinks[v * 2] == i) {
                    this.nodes[v].setX(this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][wireLinks[(v * 2) + 1]] * this.objects[i].width));
                    this.nodes[v].setY(this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][wireLinks[(v * 2) + 1]] * this.objects[i].height));
                }
            }

            for (var v = 0; v < wiringXPoints["x" + this.objectIDs[i]].length; v++) {
                if (activeWireXY[0] == i && activeWireXY[1] == v) {
                    activeWireXY[2] = this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width);
                    activeWireXY[3] = this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height);
                }
                if (activeWire == true) {
                    this.activeWire.setTo(activeWireXY[2], activeWireXY[3], this.input.mousePointer.x, this.input.mousePointer.y);
                    this.activeWire.setDepth(3);
                    this.activeWire.setVisible(1);

                  if(this.esc.wasPressed()){
                    activeWire = false;
                    this.activeWire.setVisible(0);
                  }

                    if (down == true) {
                        if (this.input.mousePointer.x >= (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width)) - deviceWidth * 0.01 && this.input.mousePointer.x <= (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width)) + deviceWidth * 0.01 && this.input.mousePointer.y <= (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height)) + deviceHeight * 0.015 && this.input.mousePointer.y >= (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height)) - deviceHeight * 0.015) {
                            activeWire = false;
                            this.activeWire.setVisible(0);
                           var node = this.add.circle(this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width), this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height), deviceWidth * 0.005 * scaleCount, 0xED4040);
                            this.nodes.push(node);
                            nodeLinks.push(i);
                            nodeLinks.push(v);
                            var obj = this.add.line(this.nodes[this.nodes.length-2].x, this.nodes[this.nodes.length-2].y, node.x, node.y, 0xffffff);                        obj.setLineWidth(deviceWidth*0.002*scaleCount);
                            this.wireLines.push(obj);
                          var obj2;
                            if (wireColors.length > 0) {
                                //obj2 = this.add.rectangle((activeWireXY[2] + (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width))) / 2, (activeWireXY[3] + (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height))) / 2, lineWidth, (Math.sqrt(Math.pow(Math.abs(activeWireXY[2] - (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width))), 2) + Math.pow(Math.abs(activeWireXY[3] - (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height))), 2))), wireColors[wireColors.length - 1]);
                              obj2 = this.add.rectangle((obj.geom.x1+obj.geom.x2)/2,(obj.geom.y1+obj.geom.y2)/2,lineWidth,Math.sqrt(Math.pow(Math.abs(obj.geom.x1-obj.geom.x2),2)+Math.pow(Math.abs(obj.geom.y1-obj.geom.y2),2)),wireColors[wireColors.length-1]);
                               // obj2.setAngle(-(Math.atan(Math.abs(activeWireXY[2] - (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width))) / Math.abs(activeWireXY[3] - (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height)))) * 180 / Math.PI));
                            } else {
                                //obj2 = this.add.rectangle((activeWireXY[2] + (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width))) / 2, (activeWireXY[3] + (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height))) / 2, lineWidth, (Math.sqrt(Math.pow(Math.abs(activeWireXY[2] - (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width))), 2) + Math.pow(Math.abs(activeWireXY[3] - (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height))), 2))), 0xED4040);
                              obj2 = this.add.rectangle((obj.geom.x1+obj.geom.x2)/2,(obj.geom.y1+obj.geom.y2)/2,lineWidth,Math.sqrt(Math.pow(Math.abs(obj.geom.x1-obj.geom.x2),2)+Math.pow(Math.abs(obj.geom.y1-obj.geom.y2),2)),0xED4040);
                              
                            }
                          
                           // obj2.setAngle(-(Math.atan(Math.abs(activeWireXY[2] - (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width))) / Math.abs(activeWireXY[3] - (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height)))) * 180 / Math.PI));
                                                        obj2.setAngle(-Math.atan(Math.abs(obj.geom.x1-obj.geom.x2)/Math.abs(obj.geom.y1-obj.geom.y2))*180/Math.PI);
                            obj2.enableClick();
                            this.wires.push(obj2);
                            wireColors.push(obj2.fillColor)
                            down = false;
                        }
                    }
                }
                if (this.input.mousePointer.x >= (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width)) - deviceWidth * 0.01 && this.input.mousePointer.x <= (this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width)) + deviceWidth * 0.01 && this.input.mousePointer.y <= (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height)) + deviceHeight * 0.015 && this.input.mousePointer.y >= (this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height)) - deviceHeight * 0.015) {
                    wiringPointer = true;
                    this.wiringPointer.x = this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width)
                    this.wiringPointer.y = this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height);
                    this.wiringPointer.setVisible(1);
                    this.wiringPointer.setDepth(3);
                    pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
                    if (down == true) {
                        if (activeWire == false) {
                            activeWire = true;
                          var node = this.add.circle(this.objects[i].x + (wiringXPoints["x" + this.objectIDs[i]][v] * this.objects[i].width), this.objects[i].y + (wiringYPoints["y" + this.objectIDs[i]][v] * this.objects[i].height), deviceWidth * 0.005 * scaleCount, 0xED4040);
                            this.nodes.push(node);
                            nodeLinks.push(i);
                            nodeLinks.push(v);
                            activeWireXY[0] = i;
                            activeWireXY[1] = v;
                            activeWireXY[2] = this.nodes[this.nodes.length - 1].x;
                            activeWireXY[3] = this.nodes[this.nodes.length - 1].y;
                            down = false;
                        }

                    }
                }
            }

            if (this.slash.visible == 0 && this.objects[i].isClicked()) {
                for (var v = -10000; v < 10000; v++) {

                    if (Math.abs(((v * deviceWidth * snapPlacementX + (snapStartX % (deviceWidth * snapPlacementX))) - ((wiringXPoints["x" + this.objectIDs[i]][0] * this.objects[i].width) + this.objects[i].x))) < (deviceWidth * snapPlacementX) / 2 && Math.abs(((v * deviceWidth * snapPlacementX + (snapStartX % (deviceWidth * snapPlacementX))) - ((wiringXPoints["x" + this.objectIDs[i]][0] * this.objects[i].width) + this.objects[i].x))) > 0) {
                        this.objects[i].x = (v * deviceWidth * snapPlacementX + (snapStartX % (deviceWidth * snapPlacementX))) - (wiringXPoints["x" + this.objectIDs[i]][0] * this.objects[i].width);
                    }
                }
                for (var v = -10000; v < 10000; v++) {

                    if (Math.abs(((v * deviceHeight * snapPlacementY + (snapStartY % (deviceHeight * snapPlacementY))) - ((wiringYPoints["y" + this.objectIDs[i]][0] * this.objects[i].height) + this.objects[i].y))) < (deviceHeight * snapPlacementY) / 2 && Math.abs(((v * deviceHeight * snapPlacementY + (snapStartY % (deviceHeight * snapPlacementY))) - ((wiringYPoints["y" + this.objectIDs[i]][0] * this.objects[i].height) + this.objects[i].y))) > 0) {
                        this.objects[i].y = (v * deviceHeight * snapPlacementY + (snapStartY % (deviceHeight * snapPlacementY))) - (wiringYPoints["y" + this.objectIDs[i]][0] * this.objects[i].height);
                    }
                }
            }
        }

        if (wiringPointer == false) {
            this.wiringPointer.setVisible(0);
        }

        if (this.popupcandel.wasClicked() || this.popupcandeltext.wasClicked()) {
            this.popupover.setVisible(0);
            this.popup.setVisible(0);
            this.popuptext.setVisible(0);
            this.popupcandel.setVisible(0);
            this.popupdel.setVisible(0);
            this.popupcandeltext.setVisible(0);
            this.popupdeltext.setVisible(0);
          for(var v = 0; v < this.objects.length; v++){
            this.objects[v].enableClick();
            this.objects[v].enableDrag();
          }
        }

        if (this.popupdel.wasClicked()) {
            this.popupover.setVisible(0);
            this.popup.setVisible(0);
            this.popuptext.setVisible(0);
            this.popupcandel.setVisible(0);
            this.popupdel.setVisible(0);
            this.popupcandeltext.setVisible(0);
            this.popupdeltext.setVisible(0);
            this.objects[del].destroy();
            this.objectIDs.splice(del, 1);
          wireColors.splice(del,1);
            for (var v = 0; v < this.wires.length; v++) {
                if (wireLinks[v * 4] == del || wireLinks[(v * 4) + 2] == del) {
                    this.wires[v].destroy();
                    this.wireLines[v].destroy();
                    wireLinks[v * 4] = -1;
                    wireLinks[(v * 4) + 1] = -1;
                    wireLinks[(v * 4) + 2] = -1;
                    wireLinks[(v * 4) + 3] = -1;
                }
            }
            for (var v = 0; v < this.wires.length; v++) {
                if (wireLinks[v * 4] > del) {
                    wireLinks[v * 4] -= 1;
                }
                if (wireLinks[(v * 4) + 2] > del) {
                    wireLinks[(v * 4) + 2] -= 1;
                }
            }
            for (var v = 0; v < this.nodes.length; v++) {
                if (nodeLinks[v * 2] == del) {
                    this.nodes[v].destroy();
                    nodeLinks[v * 2] = -1;
                    nodeLinks[(v * 2) + 1] = -1;
                }
            }
            for (var v = 0; v < this.nodes.length; v++) {
                if (nodeLinks[v * 2] > del) {
                    nodeLinks[(v * 2)] -= 1;
                }
            }
            wireLinks = wireLinks.filter(removeObj);
            nodeLinks = nodeLinks.filter(removeObj);

            function removeObj(remove) {
                return remove != -1;
            }

            clean(this.objects);
            clean(this.wires);
            clean(this.wireLines);
            clean(this.nodes);
        }

        for (var i = 0; i < this.items.length; i++) {

            if (this.items[i].isOver()) {
                pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
                this.items[i].setTint(0xffbfbf)
            } else {
                this.items[i].setTint(0xffffff)
            }

            if (this.items[i].wasClicked()) {
                var obj = this.add.sprite(deviceWidth / 2 + deviceWidth * 0.002, deviceHeight / 2, `${itemObjectID[i]}`)
                obj.setScale(objectsData[(itemObjectData[i] * 3) + 2]);
                obj.scale *= scaleCount;
              obj.width *= scaleCount;
              obj.height *= scaleCount;
                obj.setDepth(2);
                obj.enableDrag();
                obj.enableClick();
                this.objects.push(obj);
                this.objectIDs.push(itemObjectID[i]);
            }
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

        if (this.binHandleArrow.x <= deviceWidth * 0.015) {
            closing = false;
            itemBinOpen = false;
        }

        if (this.binHandleArrow.x >= deviceWidth * 0.21) {
            opening = false;
            itemBinOpen = true;
            this.binLabel.setAlpha(1);
            this.binLabelDivider.setAlpha(1);
            this.itemTypeButton.setVisible(1);
            this.itemTypeArrow.setVisible(1);
            for (var t = 0; t < this.itemLabels.length; t++) {
                this.itemLabels[t].setVisible(1);
                this.items[t].setVisible(1);
            }
            this.nextPageButton.setVisible(1);
            this.nextPageArrow.setVisible(1);
        }

        if (closing == true) {
            this.itemBin.x -= 10;
            this.binHandle.x -= 10;
            this.binHandleArrow.x -= 10;
            this.binLabel.setAlpha(0);
            this.binLabelDivider.setAlpha(0);
            this.itemTypeButton.setVisible(0);
            this.itemTypeArrow.setVisible(0);
            for (var t = 0; t < this.itemLabels.length; t++) {
                this.itemLabels[t].setVisible(0);
                this.items[t].setVisible(0);
            }
            this.nextPageButton.setVisible(0);
            this.nextPageArrow.setVisible(0);
        }

        if (opening == true) {
            this.itemBin.x += 10;
            this.binHandle.x += 10;
            this.binHandleArrow.x += 10;
        }

        if (this.increaseScale.isClicked() || this.increaseScaleButton.isClicked()) {
            scaleCount *= 1.005;
            snapPlacementX *= 1.005;
            snapPlacementY *= 1.005;
            snapStartX = ((snapStartX - (deviceWidth / 2)) * 1.005) + (deviceWidth / 2);
            snapStartY = ((snapStartY - (deviceHeight / 2)) * 1.005) + (deviceHeight / 2);
            for (var t = 0; t < this.objects.length; t++) {
                this.objects[t].scale *= 1.005;
                this.objects[t].width *= 1.005;
                this.objects[t].height *= 1.005;
                this.objects[t].x = ((this.objects[t].x - (deviceWidth / 2)) * 1.005) + (deviceWidth / 2);
                this.objects[t].y = ((this.objects[t].y - (deviceHeight / 2)) * 1.005) + (deviceHeight / 2);
                this.objects[t].setDepth(2);
            }
            this.title.setDepth(1);
            this.instructions.setDepth(1);
            this.newgrid.destroy();
            this.newgrid = this.add.gridLayout(snapStartX, snapStartY, 100000, 100000, deviceWidth * snapPlacementX, deviceHeight * snapPlacementY);
            this.newgrid.setOutlineStyle(0xdddddd, 0.5)
            this.newgrid.setDepth(0);
            grid = this.newgrid;
            lineWidth *= 1.005;
            for (var v = 0; v < this.wires.length; v++) {
                this.wires[v].width *= 1.005;
            }
            for (var v = 0; v < this.nodes.length; v++) {
this.nodes[v].setRadius(this.nodes[v].radius *= 1.005);
            }
          for(var v = 0; v < this.wireLines.length; v++){
this.wireLines[v].setLineWidth(this.wireLines[v].lineWidth*1.005);
          }

        }

        if (this.decreaseScale.isClicked() || this.decreaseScaleButton.isClicked() || this.binLabel.isClicked()) {
            scaleCount *= 0.995;
            snapPlacementX *= 0.995;
            snapPlacementY *= 0.995;
            snapStartX = ((snapStartX - (deviceWidth / 2)) * 0.995) + (deviceWidth / 2);
            snapStartY = ((snapStartY - (deviceHeight / 2)) * 0.995) + (deviceHeight / 2);
            for (var t = 0; t < this.objects.length; t++) {
                this.objects[t].scale *= 0.995;
                this.objects[t].width *= 0.995;
                this.objects[t].height *= 0.995;
                this.objects[t].x = ((this.objects[t].x - (deviceWidth / 2)) * 0.995) + (deviceWidth / 2);
                this.objects[t].y = ((this.objects[t].y - (deviceHeight / 2)) * 0.995) + (deviceHeight / 2);
                this.objects[t].setDepth(2);
            }
            this.title.setDepth(1);
            this.instructions.setDepth(1);

            this.newgrid.destroy();
            this.newgrid = this.add.gridLayout(snapStartX, snapStartY, 100000, 100000, deviceWidth * snapPlacementX, deviceHeight * snapPlacementY);
            this.newgrid.setOutlineStyle(0xdddddd, 0.5)
            this.newgrid.setDepth(0);
            grid = this.newgrid;
            lineWidth *= 0.995;
            for (var v = 0; v < this.wires.length; v++) {
                this.wires[v].width *= 0.995;
            }
            for (var v = 0; v < this.nodes.length; v++) {
this.nodes[v].setRadius(this.nodes[v].radius *= 0.995);
            }
          for(var v = 0; v < this.wireLines.length; v++){
this.wireLines[v].setLineWidth(this.wireLines[v].lineWidth*0.995);
          }
        }

        if (this.home.wasClicked()) {
            this.popupover.setVisible(1);
            this.popupover.setDepth(5);
            this.popup.setVisible(1);
            this.popup.setDepth(6);
            this.popuptext.setText("Are you sure you want to leave? You will lose your work.");
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
          for(var v = 0; v < this.objects.length; v++){
            this.objects[v].disableClick();
            this.objects[v].disableDrag();
          }
        }

        if (this.popupcancel.wasClicked() || this.popupcanceltext.wasClicked()) {
            this.popupover.setVisible(0);
            this.popup.setVisible(0);
            this.popuptext.setVisible(0);
            this.popupcancel.setVisible(0);
            this.popupyes.setVisible(0);
            this.popupcanceltext.setVisible(0);
            this.popupyestext.setVisible(0);
          for(var v = 0; v < this.objects.length; v++){
            this.objects[v].enableClick();
            this.objects[v].enableDrag();
          }
        }

        if (this.popupyes.wasClicked() || this.popupyestext.wasClicked()) {
            this.scene.start("Menu");
        }

    }
}
