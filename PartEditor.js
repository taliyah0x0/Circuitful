//// Import Saved Part ////

var xLocationsImport = [
    -0.2260912022563598, 0.22785329178666386, 0.34774731695634875, 0.4291533285853066, 0.4528765644996553, 0.4301329531555218, 0.3497065660967791, 0.22785329178666386, -0.3482877410958964, -0.42735288035982555, -0.4564786601501534, -0.42833250493004077, -0.34247006972580774, -0.22643942787727464

];
var yLocationsImport = [
    -0.3951466325379341, 0.3936245944772217, 0.2911646730599088, 0.15440097163588754, -0.002193757186519534, -0.15679349730162326, -0.2934144796766195, -0.3951466325379341, -0.2924328919309129, -0.15679349730162326, -0.002193757186519534, 0.1560471704551244, 0.29480586058644664, 0.3926430067315151
];
var objectInfoImport = [
    "Circuit Playground", "Microcontrollers", 0.7401785998271294, 14, 1418.4

];

////    ////


////  Warning: Crazy Code Below!!  ////

var objectInfo;
var wiringPoint;
var object;
var create = true;
var workshopScale;

var closing = false;
var opening = false;
var itemBinOpen = true;

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

var counter = 0;
var element = document.querySelector(":focus");

var undo = [];
var redo = [];

var lastPosition = [];
var lastScale = 1;
var pointDistances = [];

var gridColor = 0xdddddd;

class PartEditor extends SimpleScene {

    constructor() {
        super("PartEditor");
    }

    init() { }

    preload() {
        this.load.image("object", 'object/object.png');
        this.load.imageset("binhandlearrow", "./assets/binhandlearrow.png", 560, 981);
        this.load.image("increasescale", "./assets/increasescale.png");
        this.load.image("decreasescale", "./assets/decreasescale.png");
        this.load.image("home", "assets/home.png");
        this.load.image("magnet", "assets/magnet.png");
        this.load.image("slash", "assets/slash.png");
        this.load.image("grid", "assets/grid.jpeg");
        this.load.image("saved", "assets/saved.png");
        this.load.image("info", "assets/info.png");
        this.load.image("undo", "assets/undo.png");
        this.load.image("glue", "assets/glue.png");
        this.load.image("dark", "assets/dark.png");
    }

    create() {
        closing = false;
        opening = false;
        itemBinOpen = true;
        lastPosition = [];
        undo.splice(0, undo.length);
        redo.splice(0, redo.length);
        this.clearHTML();

        document.getElementById('label').innerHTML = "Object Name:";
        document.getElementById('label2').innerHTML = "Object Type:";
        document.getElementById('input').style.display = 'block';
        document.getElementById('dropdown').style.display = 'block';
        document.getElementById('option1').value = "Choose";
        document.getElementById('option1').style.display = "block";
        document.getElementById('option2').value = "Microcontrollers";
        document.getElementById('option2').style.display = "block";
        document.getElementById('option3').value = "Electrical";
        document.getElementById('option3').style.display = "block";
        document.getElementById('option4').value = "Modules";
        document.getElementById('option4').style.display = "block";
        document.getElementById('option5').value = "Other";
        document.getElementById('option5').style.display = "block";

        this.floor = this.add.rectangle(deviceWidth / 2, deviceHeight / 2, deviceWidth, deviceHeight, 0xffffff);
        this.floor.setDepth(0);
        this.floor.enableClick();
        
        this.grid = this.add.gridLayout(snapStartX, snapStartY, 100000, 100000, 28 * scaleCount, 28 * scaleCount);
        this.grid.setOutlineStyle(gridColor, 1)
        this.grid.setDepth(0);
        this.grid.enableClick();
        grid = this.grid;

        this.object = this.add.sprite(deviceWidth / 2, deviceHeight * 0.57, "object");
        if (objectInfoImport.length > 0) {
            document.getElementById('input').value = objectInfoImport[0];
            document.getElementById('dropdown').value = objectInfoImport[1];
            this.object.scale *= objectInfoImport[2];
            this.object.width *= objectInfoImport[2];
            this.object.height *= objectInfoImport[2];
            while (this.object.width < deviceWidth * 0.3 && this.object.height < deviceHeight * 0.6) {
                this.object.width *= 1.1;
                this.object.scale *= 1.1;
                this.object.height *= 1.1;
                this.grid.scale *= 1.1;
                scaleCount *= 1.1;
                this.grid.destroy();
                this.grid = this.add.gridLayout(snapStartX, snapStartY, 100000, 100000, 28 * scaleCount, 28 * scaleCount);
                this.grid.setOutlineStyle(gridColor, 1)
                this.grid.setDepth(0);
                this.grid.enableClick();
                grid = this.grid;
            }
            while (this.object.width > deviceWidth * 0.5 || this.object.height > deviceHeight) {
                this.object.width *= 0.9;
                this.object.scale *= 0.9;
                this.object.height *= 0.9;
                this.grid.scale *= 0.9;
                scaleCount *= 0.9;
                this.grid.destroy();
                this.grid = this.add.gridLayout(snapStartX, snapStartY, 100000, 100000, 28 * scaleCount, 28 * scaleCount);
                this.grid.setOutlineStyle(gridColor, 1)
                this.grid.setDepth(0);
                this.grid.enableClick();
                grid = this.grid;
            }
        } else {
            while (this.object.width < deviceWidth * 0.3 && this.object.height < deviceHeight * 0.6) {
                this.object.width *= 1.1;
                this.object.scale *= 1.1;
                this.object.height *= 1.1;
            }
            while (this.object.width > deviceWidth * 0.5 || this.object.height > deviceHeight) {
                this.object.width *= 0.9;
                this.object.scale *= 0.9;
                this.object.height *= 0.9;
            }
        }
        this.object.enableClick();
        this.object.enableDrag();
        this.object.setDepth(2);
        object = this.object;
        lastScale = this.object.scale;

        this.title = this.add.text(deviceWidth / 2, deviceHeight * 0.045, "PART EDITOR", 0x999999);
        this.title.setOrigin(0.5, 0);
        this.title.setFontSize(deviceHeight * 0.075);

        this.instructions = this.add.text(deviceWidth / 2, deviceHeight * 0.15, "Set up the object scale and wiring points.", 0x000000)
        this.instructions.setOrigin(0.5, 0);
        this.instructions.setFontSize(deviceHeight * 0.03);

        this.wiringPoint = [];
        let obj = this.add.circle(deviceWidth * 0.05, deviceHeight * 0.22, deviceWidth * 0.005, 0xff0000);
        obj.width = deviceWidth * 0.02;
        obj.height = deviceWidth * 0.02;
        obj.enableClick();
        obj.enableDrag();
        this.wiringPoint.push(obj);
        wiringPoint = this.wiringPoint;

        this.crossV = this.add.line(0, 0, 0, 0, 0xff0000);
        this.crossV.setLineWidth(1);
        this.crossV.setDepth(7);

        this.crossH = this.add.line(0, 0, 0, 0, 0xff0000);
        this.crossH.setLineWidth(1);
        this.crossH.setDepth(7);

        this.binHandle = this.add.circle(deviceWidth * 0.21, deviceHeight / 2, deviceWidth * 0.02, 0xdddddd);
        this.binHandle.enableClick();
        this.binHandle.setDepth(5);

        this.binHandleArrow = this.add.sprite(deviceWidth * 0.215, deviceHeight / 2, "binhandlearrow", 0);
        this.binHandleArrow.setScale(deviceWidth * 0.00002);
        this.binHandleArrow.setAngle(180);
        this.binHandleArrow.enableClick();
        this.binHandleArrow.setDepth(5);

        this.itemBin = this.add.rectangle(deviceWidth * 0.1, deviceHeight * 0.22, deviceWidth * 0.22, deviceHeight * 2, 0xdddddd);
        this.itemBin.setDepth(5);

        this.binLabel = this.add.text(deviceWidth * 0.02, deviceHeight * 0.03, "All", 0x999999);
        this.binLabel.enableClick();
        this.binLabel.setFontSize(deviceHeight * 0.045);
        this.binLabel.setDepth(5);

        this.binLabelDivider = this.add.line(deviceWidth * 0.015, deviceHeight * 0.09, deviceWidth * 0.2, deviceHeight * 0.09, 5, 0xdddddd);
        this.binLabelDivider.setDepth(5);
        this.binHandle.setDepth(5);

        this.wiringPointLabel = this.add.text(deviceWidth * 0.05, deviceHeight * 0.3, "Wiring Point", 0x000000);
        this.wiringPointLabel.setOrigin(0.5, 0);
        this.wiringPointLabel.setDepth(6);

        this.uparrow = this.add.key("UP");
        this.downarrow = this.add.key("DOWN");
        this.rightarrow = this.add.key("RIGHT");
        this.leftarrow = this.add.key("LEFT");
        this.shift = this.add.key("SHIFT");
        this.space = this.add.key("SPACE");
        this.del = this.add.key("BACKSPACE");
        this.esc = this.add.key("ESC");
        this.return = this.add.key("ENTER");
        this.s = this.add.key("S");
        this.w = this.add.key("W");
        this.z = this.add.key("Z");
        this.x = this.add.key("X");

        this.increaseScaleButton = this.add.circle(deviceWidth * 0.83, deviceHeight * 0.94, deviceWidth * 0.02, 0xF4F5F6);
        this.increaseScaleButton.enableClick();
        this.increaseScaleButton.setAlpha(0.01);
        this.increaseScaleButton.setDepth(5);

        this.decreaseScaleButton = this.add.circle(deviceWidth * 0.785, deviceHeight * 0.94, deviceWidth * 0.02, 0xF4F5F6);
        this.decreaseScaleButton.enableClick();
        this.decreaseScaleButton.setAlpha(0.01);
        this.decreaseScaleButton.setDepth(5);

        this.increaseScale = this.add.sprite(deviceWidth * 0.83, deviceHeight * 0.94, "increasescale");
        this.increaseScale.setScale(deviceWidth * 0.000035);
        this.increaseScale.enableClick();
        this.increaseScale.setDepth(5);

        this.decreaseScale = this.add.sprite(deviceWidth * 0.785, deviceHeight * 0.94, "decreasescale");
        this.decreaseScale.setScale(deviceWidth * 0.000035);
        this.decreaseScale.enableClick();
        this.decreaseScale.setDepth(5);

        this.saveButton = this.add.rectangle(deviceWidth * 0.9, deviceHeight * 0.94, deviceWidth * 0.07, deviceHeight * 0.075, 0x3fce29);
        this.saveButton.enableClick();
        this.saveButton.setDepth(5);

        this.save = this.add.text(deviceWidth * 0.9, deviceHeight * 0.94, "Save");
        this.save.setOrigin(0.5, 0.5);
        this.save.setFontSize(deviceHeight * 0.03);
        this.save.enableClick();
        this.save.setDepth(5);

        this.saved = this.add.sprite(deviceWidth * 0.9, deviceHeight * 0.94, "saved");
        this.saved.setScale(deviceWidth * 0.0004);
        this.saved.setVisible(0);
        this.saved.setDepth(5);

        this.home = this.add.sprite(deviceWidth * 0.965, deviceHeight * 0.94, "home");
        this.home.setScale(deviceWidth * 0.00012)
        this.home.enableClick();
        this.home.setDepth(5);

        this.info = this.add.sprite(deviceWidth * 0.965, deviceHeight * 0.06, "info");
        this.info.setScale(deviceWidth * 0.0004);
        this.info.enableClick();
        this.info.setDepth(5);

        this.dark = this.add.sprite(deviceWidth * 0.92, deviceHeight * 0.06, "dark");
        this.dark.setScale(deviceWidth * 0.00035);
        this.dark.enableClick();
        this.dark.setDepth(5);

        this.magnet = this.add.sprite(deviceWidth * 0.735, deviceHeight * 0.945, "magnet");
        this.magnet.setScale(deviceWidth * 0.0005);
        this.magnet.enableClick();
        this.magnet.setDepth(5);

        this.slash = this.add.sprite(deviceWidth * 0.735, deviceHeight * 0.95, "slash");
        this.slash.setScale(deviceWidth * 0.0004);
        this.slash.enableClick();
        this.slash.setVisible(0);
        this.slash.setDepth(5);

        this.glue = this.add.sprite(deviceWidth * 0.875, deviceHeight * 0.06, "glue");
        this.glue.setScale(deviceWidth * 0.0004);
        this.glue.enableClick();
        this.glue.flipY = true;
        this.glue.setDepth(5);

        this.glueSlash = this.add.sprite(deviceWidth * 0.875, deviceHeight * 0.06, "slash");
        this.glueSlash.setScale(deviceWidth * 0.0003);
        this.glueSlash.enableClick();
        this.glueSlash.setDepth(5);

        this.redo = this.add.sprite(deviceWidth * 0.685, deviceHeight * 0.945, "undo");
        this.redo.setScale(deviceWidth * 0.0005);
        this.redo.flipX = true;
        this.redo.setDepth(5);
        this.redo.enableClick();

        this.undo = this.add.sprite(deviceWidth * 0.635, deviceHeight * 0.945, "undo");
        this.undo.setScale(deviceWidth * 0.0005);
        this.undo.setDepth(5);
        this.undo.enableClick();

        var pointer = this.input.activePointer;

        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY) {

            object.x -= deltaX * 0.2;
            object.y -= deltaY * 0.2;

            grid.x -= deltaX * 0.2;
            grid.y -= deltaY * 0.2;

            snapStartX -= deltaX * 0.2;
            snapStartY -= deltaY * 0.2;

            for (var i = 0; i < wiringPoint.length; i++) {
                if (wiringPoint[i].x != deviceWidth * 0.05 && wiringPoint[i].y != deviceHeight * 0.22) {
                    wiringPoint[i].x -= deltaX * 0.2;
                    wiringPoint[i].y -= deltaY * 0.2;
                }
            }

            if (lastPosition[1] != deviceWidth * 0.05 && lastPosition[2] != deviceHeight * 0.22) {
                lastPosition[1] -= deltaX * 0.2;
                lastPosition[2] -= deltaY * 0.2;
            }

        });

        this.popupover = this.add.rectangle(deviceWidth / 2, deviceHeight / 2, deviceWidth, deviceHeight, 0xffffff);
        this.popupover.setAlpha(0.5);
        this.popupover.setDepth(6);
        this.popupover.setVisible(0);

        this.popup = this.add.rectangle(deviceWidth / 2, deviceHeight / 2, deviceWidth * 0.6, deviceHeight * 0.3, 0xcccccc);
        this.popup.setDepth(7);
        this.popup.setVisible(0);

        this.popuptext = this.add.text(deviceWidth / 2, deviceHeight * 0.45, "Are you sure you want to leave? You will lose your work.", 0x000000);
        this.popuptext.setOrigin(0.5, 0.5);
        this.popuptext.setFontSize(deviceHeight * 0.04);
        this.popuptext.setDepth(8);
        this.popuptext.setVisible(0);

        this.popupcancel = this.add.rectangle(deviceWidth * 0.44, deviceHeight * 0.55, deviceWidth * 0.1, deviceHeight * 0.05, 0xaaaaaa);
        this.popupcancel.enableClick();
        this.popupcancel.setDepth(8);
        this.popupcancel.setVisible(0);

        this.popupyes = this.add.rectangle(deviceWidth * 0.56, deviceHeight * 0.55, deviceWidth * 0.1, deviceHeight * 0.05, 0xed4040);
        this.popupyes.enableClick();
        this.popupyes.setDepth(8);
        this.popupyes.setVisible(0);

        this.popupcanceltext = this.add.text(deviceWidth * 0.44, deviceHeight * 0.55, "Cancel", 0x000000);
        this.popupcanceltext.setOrigin(0.5, 0.5);
        this.popupcanceltext.setFontSize(deviceHeight * 0.03);
        this.popupcanceltext.enableClick();
        this.popupcanceltext.setDepth(9);
        this.popupcanceltext.setVisible(0);

        this.popupyestext = this.add.text(deviceWidth * 0.56, deviceHeight * 0.55, "Yes", 0x000000);
        this.popupyestext.setOrigin(0.5, 0.5);
        this.popupyestext.setFontSize(deviceHeight * 0.03);
        this.popupyestext.enableClick();
        this.popupyestext.setDepth(9);
        this.popupyestext.setVisible(0);

        this.popupdone = this.add.rectangle(deviceWidth * 0.44, deviceHeight * 0.55, deviceWidth * 0.1, deviceHeight * 0.05, 0xaaaaaa);
        this.popupdone.width = deviceWidth * 0.1;
        this.popupdone.height = deviceHeight * 0.05;
        this.popupdone.enableClick();
        this.popupdone.setDepth(8);
        this.popupdone.setVisible(0);

        this.popupadd = this.add.rectangle(deviceWidth * 0.56, deviceHeight * 0.55, deviceWidth * 0.1, deviceHeight * 0.05, 0x4FBA52);
        this.popupadd.width = deviceWidth * 0.1;
        this.popupadd.height = deviceHeight * 0.05;
        this.popupadd.enableClick();
        this.popupadd.setDepth(8);
        this.popupadd.setVisible(0);

        this.popupdonetext = this.add.text(deviceWidth * 0.44, deviceHeight * 0.55, "Done", 0x000000);
        this.popupdonetext.setOrigin(0.5, 0.5);
        this.popupdonetext.setFontSize(deviceHeight * 0.03);
        this.popupdonetext.enableClick();
        this.popupdonetext.setDepth(9);
        this.popupdonetext.setVisible(0);

        this.popupaddtext = this.add.text(deviceWidth * 0.56, deviceHeight * 0.55, "Add to Workspace", 0x000000);
        this.popupaddtext.setOrigin(0.5, 0.5);
        this.popupaddtext.setFontSize(deviceHeight * 0.02);
        this.popupaddtext.enableClick();
        this.popupaddtext.setDepth(9);
        this.popupaddtext.setVisible(0);

        var shiftX = 0;
        var shiftY = 0;
        if (xLocationsImport.length > 0) {
            for (var i = 0; i < xLocationsImport.length; i++) {
                var point = this.add.circle((this.object.width * xLocationsImport[i]) + this.object.x, (this.object.height * yLocationsImport[i]) + this.object.y, deviceWidth * 0.005, 0xff0000);
                point.width = deviceWidth * 0.02;
                point.height = deviceWidth * 0.02;
                point.enableClick();
                point.enableDrag();

                if (i == 0) {
                    for (var v = -10000; v < 10000; v++) {
                        if (Math.abs(((v * 28 * scaleCount + (snapStartX % (28 * scaleCount))) - point.x)) < (28 * scaleCount) / 2 && Math.abs(((v * 28 * scaleCount + (snapStartX % (28 * scaleCount))) - point.x)) > 0) {
                            shiftX = (v * 28 * scaleCount + (snapStartX % (28 * scaleCount))) - point.x;
                        }
                    }
                    for (var v = -10000; v < 10000; v++) {
                        if (Math.abs(((v * 28 * scaleCount + (snapStartY % (28 * scaleCount))) - point.y)) < (28 * scaleCount) / 2 && Math.abs(((v * 28 * scaleCount + (snapStartY % (28 * scaleCount))) - point.y)) > 0) {
                            shiftY = (v * 28 * scaleCount + (snapStartY % (28 * scaleCount))) - point.y;
                        }
                    }
                }

                point.x += shiftX;
                point.y += shiftY;
                this.wiringPoint.push(point);
            }
        }
        this.object.x += shiftX;
        this.object.y += shiftY;

    }

    update() {

        element = document.querySelector(":focus");
        if (element == document.getElementById('input') || element == document.getElementById('dropdown')) {
            if (this.return.wasPressed() || this.esc.wasPressed()) {
                document.getElementById('input').blur();
                document.getElementById('inputnum').blur();
                document.getElementById('dropdown').blur();
            }
            if (this.space.wasPressed()) {
                element.value += " ";
            }
            if (this.s.wasPressed() && !(this.shift.isPressed())) {
                element.value += "s";
            }
            if (this.w.wasPressed() && !(this.shift.isPressed())) {
                element.value += "w";
            }
            if (this.del.wasPressed()) {
                element.value = element.value.slice(0, -1);
            }
            if (this.z.wasPressed() && !(this.shift.isPressed())) {
                element.value += "z";
            }
            if (this.x.wasPressed() && !(this.shift.isPressed())) {
                element.value += "x";
            }
        } else {
            if (element != null) {
                element.blur();
            }
        }

        const pElement = document.getElementsByTagName("body")[0];
        pElement.style.cursor = "url('https://i.ibb.co/hsnxb67/icons8-cursor-30.png'), auto";

        if (this.home.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.home.setAlpha(0.5);
        } else {
            this.home.setAlpha(1);
        }

        if (this.info.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.info.setAlpha(0.5);
        } else {
            this.info.setAlpha(1);
        }

        if (!(this.input.activePointer.isDown == true)) {
            this.crossV.setAlpha(0);
            this.crossH.setAlpha(0);
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

        if (this.save.isOver() || this.saveButton.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.saveButton.fillColor = 0x99ff99;
        } else {
            this.saveButton.fillColor = 0x3fce29;
        }

        if (this.increaseScale.isOver() || this.increaseScaleButton.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.increaseScale.setAlpha(0.5);
        } else {
            this.increaseScale.setAlpha(1);
        }

        if (this.decreaseScale.isOver() || this.decreaseScaleButton.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.decreaseScale.setAlpha(0.5);
        } else {
            this.decreaseScale.setAlpha(1);
        }

        if (this.magnet.isOver() || this.slash.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.magnet.setAlpha(0.5);
            this.slash.setAlpha(0.5);
        } else {
            this.magnet.setAlpha(1);
            this.slash.setAlpha(1);
        }

        if (this.glue.isOver() || this.glueSlash.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.glue.setAlpha(0.5);
            this.glueSlash.setAlpha(0.5);
        } else {
            this.glue.setAlpha(1);
            this.glueSlash.setAlpha(1);
        }

        if (this.undo.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.undo.setAlpha(0.5);
        } else {
            if (undo.length > 0) {
                this.undo.setAlpha(1);
            } else {
                this.undo.setAlpha(0.5);
            }
        }

        if (this.redo.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.redo.setAlpha(0.5);
        } else {
            if (redo.length > 0) {
                this.redo.setAlpha(1);
            } else {
                this.redo.setAlpha(0.5);
            }
        }

        if (this.binHandle.isOver() || this.binHandleArrow.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
        }

        if (this.popupdone.visible == 1) {
            if (this.popupdone.isOver() || this.popupdonetext.isOver()) {
                pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
                this.popupdone.fillColor = 0xeeeeee;
            } else {
                this.popupdone.fillColor = 0xaaaaaa;
            }
            if (this.popupadd.isOver() || this.popupaddtext.isOver()) {
                pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
                this.popupadd.fillColor = 0x99ff99;
            } else {
                this.popupadd.fillColor = 0x4FBA52;
            }
            if (this.popupadd.wasClicked() || this.popupaddtext.wasClicked()) {
                window.open('/Tutorial.html', '_blank');
            }
        }

        if (this.object.wasClicked()) {
            this.title.setVisible(0);
            this.instructions.setVisible(0);
            for (var v = 0; v < this.wiringPoint.length; v++) {
                this.wiringPoint[v].disableDrag();
                this.wiringPoint[v].disableClick();
            }
            lastPosition[0] = -1;
            lastPosition[1] = this.object.x;
            lastPosition[2] = this.object.y;

            if (this.glueSlash.visible == 0) {
                for (var v = 0; v < this.wiringPoint.length; v++) {
                    if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                        pointDistances[(v * 2)] = this.wiringPoint[v].x - this.object.x;
                        pointDistances[(v * 2) + 1] = this.wiringPoint[v].y - this.object.y;
                    }
                }
            }
        }

        if (this.object.isClicked()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            if (element != null) {
                element.blur();
            }
            if (this.glueSlash.visible == 0) {
                for (var v = 0; v < this.wiringPoint.length; v++) {
                    if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                        this.wiringPoint[v].x = this.object.x + pointDistances[(v * 2)];
                        this.wiringPoint[v].y = this.object.y + pointDistances[(v * 2) + 1];
                    }
                }
            }
        }

        if (this.object.wasDropped()) {
            for (var v = 0; v < this.wiringPoint.length; v++) {
                this.wiringPoint[v].enableClick();
                this.wiringPoint[v].enableDrag();
            }
        }

        if (this.object.scale != lastScale && !(this.shift.isPressed()) && !(this.uparrow.isPressed()) && !(this.downarrow.isPressed())) {
            undo.push("scaledObject");
            undo.push(this.glueSlash.visible);
            undo.push(lastScale / this.object.scale);
            undo.push(-1);
            redo.splice(0, redo.length);
        }

        if (lastPosition[0] == -1 && !(this.object.isClicked()) && (lastPosition[1] != this.object.x || lastPosition[2] != this.object.y) && !(this.uparrow.isPressed()) && !(this.leftarrow.isPressed()) && !(this.rightarrow.isPressed()) && !(this.downarrow.isPressed())) {
            undo.push("movedObject");
            undo.push(this.glueSlash.visible);
            undo.push(lastPosition[1] - this.object.x);
            undo.push(lastPosition[2] - this.object.y);
            lastPosition[1] = this.object.x;
            lastPosition[2] = this.object.y;
            redo.splice(0, redo.length);
        }

        var scalingObject = false;
        if (element == null) {
            if (this.uparrow.wasPressed() || this.leftarrow.wasPressed() || this.downarrow.wasPressed() || this.rightarrow.wasPressed()) {
                var noOther = true;
                for (var v = 0; v < this.wiringPoint.length; v++) {
                    if (this.wiringPoint[v].isOver()) {
                        noOther = v;
                    }
                }

                if (noOther == true) {
                    lastPosition[0] = - 1;
                    lastPosition[1] = this.object.x;
                    lastPosition[2] = this.object.y;
                } else {
                    lastPosition[0] = noOther;
                    lastPosition[1] = this.wiringPoint[noOther].x;
                    lastPosition[2] = this.wiringPoint[noOther].y;
                }

                lastScale = this.object.scale;
            }
            if (this.shift.isPressed()) {
                if (this.uparrow.isPressed()) {
                    scalingObject = true;
                    this.object.scale *= 1.001;
                    this.object.width *= 1.001;
                    this.object.height *= 1.001;
                    counter++;

                    if (this.glueSlash.visible == 0) {
                        for (var v = 0; v < this.wiringPoint.length; v++) {
                            if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                this.wiringPoint[v].x = ((this.wiringPoint[v].x - this.object.x) * 1.001) + this.object.x;
                                this.wiringPoint[v].y = ((this.wiringPoint[v].y - this.object.y) * 1.001) + this.object.y;
                            }
                        }
                    }

                    if (counter > 50) {
                        this.object.scale *= 1.005;
                        this.object.width *= 1.005;
                        this.object.height *= 1.005;

                        if (this.glueSlash.visible == 0) {
                            for (var v = 0; v < this.wiringPoint.length; v++) {
                                if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                    this.wiringPoint[v].x = ((this.wiringPoint[v].x - this.object.x) * 1.005) + this.object.x;
                                    this.wiringPoint[v].y = ((this.wiringPoint[v].y - this.object.y) * 1.005) + this.object.y;
                                }
                            }
                        }
                    }
                }

                if (this.downarrow.isPressed()) {
                    scalingObject = true;
                    this.object.scale *= 0.999;
                    this.object.width *= 0.999;
                    this.object.height *= 0.999;
                    counter++;

                    if (this.glueSlash.visible == 0) {
                        for (var v = 0; v < this.wiringPoint.length; v++) {
                            if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                this.wiringPoint[v].x = ((this.wiringPoint[v].x - this.object.x) * 0.999) + this.object.x;
                                this.wiringPoint[v].y = ((this.wiringPoint[v].y - this.object.y) * 0.999) + this.object.y;
                            }
                        }
                    }

                    if (counter > 50) {
                        this.object.scale *= 0.995;
                        this.object.width *= 0.995;
                        this.object.height *= 0.995;

                        if (this.glueSlash.visible == 0) {
                            for (var v = 0; v < this.wiringPoint.length; v++) {
                                if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                    this.wiringPoint[v].x = ((this.wiringPoint[v].x - this.object.x) * 0.995) + this.object.x;
                                    this.wiringPoint[v].y = ((this.wiringPoint[v].y - this.object.y) * 0.995) + this.object.y;
                                }
                            }
                        }
                    }
                }
            } else {
                var wiringPointHover = false;
                for (var v = 0; v < this.wiringPoint.length; v++) {
                    if (this.wiringPoint[v].isOver()) {
                        wiringPointHover = true;
                    }
                }
                if (wiringPointHover == false) {
                    if (this.uparrow.isPressed()) {
                        this.object.y -= 0.25;
                        if (this.glueSlash.visible == 0) {
                            for (var v = 0; v < this.wiringPoint.length; v++) {
                                if (this.wiringPoint[v].x != 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                    this.wiringPoint[v].y -= 0.25;
                                }
                            }
                        }
                    }
                    if (this.downarrow.isPressed()) {
                        this.object.y += 0.25;
                        if (this.glueSlash.visible == 0) {
                            for (var v = 0; v < this.wiringPoint.length; v++) {
                                if (this.wiringPoint[v].x != 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                    this.wiringPoint[v].y += 0.25;
                                }
                            }
                        }
                    }
                    if (this.rightarrow.isPressed()) {
                        this.object.x += 0.25;
                        if (this.glueSlash.visible == 0) {
                            for (var v = 0; v < this.wiringPoint.length; v++) {
                                if (this.wiringPoint[v].x != 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                    this.wiringPoint[v].x += 0.25;
                                }
                            }
                        }
                    }
                    if (this.leftarrow.isPressed()) {
                        this.object.x -= 0.25;
                        if (this.glueSlash.visible == 0) {
                            for (var v = 0; v < this.wiringPoint.length; v++) {
                                if (this.wiringPoint[v].x != 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                    this.wiringPoint[v].x -= 0.25;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (scalingObject == false) {
            counter = 0;
        }

        for (let i = 0; i < this.wiringPoint.length; i++) {
            this.wiringPoint[i].radius = deviceWidth * 0.005;
            this.wiringPoint[i].width = deviceWidth * 0.02;
            this.wiringPoint[i].height = deviceWidth * 0.02;
            if (this.wiringPoint[i].isOver()) {
                pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
                this.wiringPoint[i].fillColor = (0xf46464);
                if (this.del.wasPressed()) {
                    this.wiringPoint[i].visible = 0;
                    undo.push("deletedWiringPoint");
                    undo.push(i);
                    undo.push(-1);
                    undo.push(-1);
                    redo.splice(0, redo.length);
                }
                if (!(this.shift.isPressed())) {
                    if (this.uparrow.isPressed()) {
                        this.wiringPoint[i].y -= 0.25;
                    }
                    if (this.downarrow.isPressed()) {
                        this.wiringPoint[i].y += 0.25;
                    }
                    if (this.rightarrow.isPressed()) {
                        this.wiringPoint[i].x += 0.25;
                    }
                    if (this.leftarrow.isPressed()) {
                        this.wiringPoint[i].x -= 0.25;
                    }
                }
            } else {
                this.wiringPoint[i].fillColor = (0xff0000);
            }

            if (this.wiringPoint[i].wasClicked()) {
                this.title.setVisible(0);
                this.instructions.setVisible(0);
                lastPosition[0] = i;
                lastPosition[1] = this.wiringPoint[i].x;
                lastPosition[2] = this.wiringPoint[i].y;
            }

            if (i == lastPosition[0] && !(this.wiringPoint[i].isClicked()) && (lastPosition[1] != this.wiringPoint[i].x || lastPosition[2] != this.wiringPoint[i].y) && !(this.uparrow.isPressed()) && !(this.leftarrow.isPressed()) && !(this.rightarrow.isPressed()) && !(this.downarrow.isPressed())) {
                if (lastPosition[1] != deviceWidth * 0.05 && lastPosition[2] != deviceHeight * 0.22) {
                    undo.push("movedWiringPoint");
                    undo.push(i);
                    undo.push(lastPosition[1] - this.wiringPoint[i].x);
                    undo.push(lastPosition[2] - this.wiringPoint[i].y);
                    lastPosition[1] = this.wiringPoint[i].x;
                    lastPosition[2] = this.wiringPoint[i].y;
                } else {
                    undo.push("createdWiringPoint");
                    undo.push(i);
                    undo.push(-1);
                    undo.push(-1);
                    lastPosition[1] = this.wiringPoint[i].x;
                    lastPosition[2] = this.wiringPoint[i].y;
                }
                redo.splice(0, redo.length);
            }

            if (this.wiringPoint[i].x != deviceWidth * 0.05 && this.wiringPoint[i].y != deviceHeight * 0.22 && this.wiringPoint[i].isClicked()) {
                this.wiringPoint[i].setDepth(6);
                if (this.slash.visible == 0) {
                    for (var v = -10000; v < 10000; v++) {
                        if (Math.abs(((v * 28 * scaleCount + (snapStartX % (28 * scaleCount))) - this.wiringPoint[i].x)) < (28 * scaleCount) / 2 && Math.abs(((v * 28 * scaleCount + (snapStartX % (28 * scaleCount))) - this.wiringPoint[i].x)) > 0) {
                            this.wiringPoint[i].x = (v * 28 * scaleCount + (snapStartX % (28 * scaleCount)));
                        }
                    }
                    for (var v = -10000; v < 10000; v++) {
                        if (Math.abs(((v * 28 * scaleCount + (snapStartY % (28 * scaleCount))) - this.wiringPoint[i].y)) < (28 * scaleCount) / 2 && Math.abs(((v * 28 * scaleCount + (snapStartY % (28 * scaleCount))) - this.wiringPoint[i].y)) > 0) {
                            this.wiringPoint[i].y = (v * 28 * scaleCount + (snapStartY % (28 * scaleCount)));
                        }
                    }
                } else {
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
            }

            if (this.wiringPoint[i].isClicked()) {
                this.crossV.setTo(this.wiringPoint[i].x, 0, this.wiringPoint[i].x, deviceHeight);
                this.crossH.setTo(0, this.wiringPoint[i].y, deviceWidth, this.wiringPoint[i].y)
                this.crossV.setAlpha(1);
                this.crossH.setAlpha(1);
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

        if (this.magnet.wasClicked() || this.slash.wasClicked()) {
            if (this.slash.visible == 0) {
                this.slash.setVisible(1);
            } else {
                this.slash.setVisible(0);
            }
        }

        if (this.glue.wasClicked() || this.glueSlash.wasClicked()) {
            if (this.glueSlash.visible == 0) {
                this.glueSlash.setVisible(1);
            } else {
                this.glueSlash.setVisible(0);
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

        if (this.grid.wasClicked() || this.floor.wasClicked()) {
            this.title.setVisible(0);
            this.instructions.setVisible(0);
            if (element != null) {
                element.blur();
            }
        }

        if (this.undo.wasClicked() || this.z.wasPressed()) {
            if (undo.length >= 4) {
                redo.push(undo[undo.length - 4]);
                redo.push(undo[undo.length - 3]);
                redo.push(undo[undo.length - 2]);
                redo.push(undo[undo.length - 1]);
                if (undo[undo.length - 4] == "deletedWiringPoint") {
                    this.wiringPoint[undo[undo.length - 3]].setVisible(1);
                }
                if (undo[undo.length - 4] == "movedWiringPoint") {
                    redo[redo.length - 2] = -undo[undo.length - 2];
                    redo[redo.length - 1] = -undo[undo.length - 1];
                    this.wiringPoint[undo[undo.length - 3]].x += undo[undo.length - 2];
                    this.wiringPoint[undo[undo.length - 3]].y += undo[undo.length - 1];
                    this.wiringPoint[undo[undo.length - 3]].radius = 8 * scaleCount;
                    lastPosition[0] = undo[undo.length - 3];
                    lastPosition[1] = this.wiringPoint[undo[undo.length - 3]].x;
                    lastPosition[2] = this.wiringPoint[undo[undo.length - 3]].y;
                }
                if (undo[undo.length - 4] == "createdWiringPoint") {
                    this.wiringPoint[undo[undo.length - 3]].setVisible(0);
                }
                if (undo[undo.length - 4] == "movedObject") {
                    redo[redo.length - 2] = -undo[undo.length - 2];
                    redo[redo.length - 1] = -undo[undo.length - 1];
                    this.object.x += undo[undo.length - 2];
                    this.object.y += undo[undo.length - 1];
                    if (undo[undo.length - 3] == false) {
                        for (var v = 0; v < this.wiringPoint.length; v++) {
                            if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                this.wiringPoint[v].x += undo[undo.length - 2];
                                this.wiringPoint[v].y += undo[undo.length - 1];
                            }
                        }
                    }
                    lastPosition[0] = -1;
                    lastPosition[1] = this.object.x;
                    lastPosition[2] = this.object.y;
                }
                if (undo[undo.length - 4] == "scaledObject") {
                    redo[redo.length - 2] = 1 / undo[undo.length - 2];
                    this.object.scale *= undo[undo.length - 2];
                    if (redo[redo.length - 3] == false) {
                        for (var v = 0; v < this.wiringPoint.length; v++) {
                            if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                this.wiringPoint[v].x = ((this.wiringPoint[v].x - this.object.x) * undo[undo.length - 2]) + this.object.x;
                                this.wiringPoint[v].y = ((this.wiringPoint[v].y - this.object.y) * undo[undo.length - 2]) + this.object.y;
                            }
                        }
                    }
                    lastScale = this.object.scale;
                }
                undo.splice(undo.length - 4, 4);
            }
        }

        if (this.redo.wasClicked() || this.x.wasPressed()) {
            if (redo.length >= 4) {
                undo.push(redo[redo.length - 4]);
                undo.push(redo[redo.length - 3]);
                undo.push(redo[redo.length - 2]);
                undo.push(redo[redo.length - 1]);
                if (redo[redo.length - 4] == "deletedWiringPoint") {
                    this.wiringPoint[redo[redo.length - 3]].setVisible(0);
                }
                if (redo[redo.length - 4] == "movedWiringPoint") {
                    undo[undo.length - 2] = -redo[redo.length - 2];
                    undo[undo.length - 1] = -redo[redo.length - 1];
                    this.wiringPoint[redo[redo.length - 3]].x += redo[redo.length - 2];
                    this.wiringPoint[redo[redo.length - 3]].y += redo[redo.length - 1];
                    this.wiringPoint[redo[redo.length - 3]].radius = 8 * scaleCount;
                    lastPosition[0] = redo[redo.length - 3];
                    lastPosition[1] = this.wiringPoint[redo[redo.length - 3]].x;
                    lastPosition[2] = this.wiringPoint[redo[redo.length - 3]].y;
                }
                if (redo[redo.length - 4] == "createdWiringPoint") {
                    this.wiringPoint[redo[redo.length - 3]].setVisible(1);
                }
                if (redo[redo.length - 4] == "movedObject") {
                    undo[undo.length - 2] = -redo[redo.length - 2];
                    undo[undo.length - 1] = -redo[redo.length - 1];
                    this.object.x += redo[redo.length - 2];
                    this.object.y += redo[redo.length - 1];
                    if (redo[redo.length - 3] == false) {
                        for (var v = 0; v < this.wiringPoint.length; v++) {
                            if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                this.wiringPoint[v].x += redo[redo.length - 2];
                                this.wiringPoint[v].y += redo[redo.length - 1];
                            }
                        }
                    }
                    lastPosition[0] = -1;
                    lastPosition[1] = this.object.x;
                    lastPosition[2] = this.object.y;
                }
                if (redo[redo.length - 4] == "scaledObject") {
                    undo[undo.length - 2] = 1 / redo[redo.length - 2];
                    this.object.scale *= redo[redo.length - 2];
                    if (redo[redo.length - 3] == false) {
                        for (var v = 0; v < this.wiringPoint.length; v++) {
                            if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                                this.wiringPoint[v].x = ((this.wiringPoint[v].x - this.object.x) * redo[redo.length - 2]) + this.object.x;
                                this.wiringPoint[v].y = ((this.wiringPoint[v].y - this.object.y) * redo[redo.length - 2]) + this.object.y;
                            }
                        }
                    }
                    lastScale = this.object.scale;
                }
                redo.splice(redo.length - 4, 4);
            }
        }

        if (this.increaseScale.isClicked() || this.increaseScaleButton.isClicked() || (element == null && this.space.isPressed() && !(this.shift.isPressed()))) {
            scaleCount *= 1.005;
            snapStartX = ((snapStartX - (deviceWidth / 2)) * 1.005) + (deviceWidth / 2);
            snapStartY = ((snapStartY - (deviceHeight / 2)) * 1.005) + (deviceHeight / 2);
            this.object.scale *= 1.005;
            this.object.width *= 1.005;
            this.object.height *= 1.005;
            this.object.x = ((this.object.x - (deviceWidth / 2)) * 1.005) + (deviceWidth / 2);
            this.object.y = ((this.object.y - (deviceHeight / 2)) * 1.005) + (deviceHeight / 2);
            this.object.setDepth(2);

            this.title.setDepth(1);
            this.instructions.setDepth(1);

            this.grid.destroy();
            this.grid = this.add.gridLayout(snapStartX, snapStartY, 100000, 100000, 28 * scaleCount, 28 * scaleCount);
            this.grid.setOutlineStyle(gridColor, 1)
            this.grid.setDepth(0);
            this.grid.enableClick();
            grid = this.grid;

            for (var v = 0; v < this.wiringPoint.length; v++) {
                if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                    this.wiringPoint[v].setRadius(this.wiringPoint[v].radius *= 1.005);
                    this.wiringPoint[v].x = ((this.wiringPoint[v].x - (deviceWidth / 2)) * 1.005) + (deviceWidth / 2);
                    this.wiringPoint[v].y = ((this.wiringPoint[v].y - (deviceHeight / 2)) * 1.005) + (deviceHeight / 2);
                    this.wiringPoint[v].setDepth(6);
                }
            }

            if (lastPosition[1] != deviceWidth * 0.05 && lastPosition[2] != deviceHeight * 0.22) {
                lastPosition[1] = ((lastPosition[1] - (deviceWidth / 2)) * 1.005) + (deviceWidth / 2);
                lastPosition[2] = ((lastPosition[2] - (deviceHeight / 2)) * 1.005) + (deviceHeight / 2);
            }

            for (var v = 0; v < undo.length / 4; v++) {
                if (undo[v * 4] == "movedObject" || undo[v * 4] == "movedWiringPoint") {
                    undo[(v * 4) + 2] *= 1.005;
                    undo[(v * 4) + 3] *= 1.005;
                }
            }

            for (var v = 0; v < redo.length / 4; v++) {
                if (redo[v * 4] == "movedObject" || redo[v * 4] == "movedWiringPoint") {
                    redo[(v * 4) + 2] *= 1.005;
                    redo[(v * 4) + 3] *= 1.005;
                }
            }
        }

        if (this.decreaseScale.isClicked() || this.decreaseScaleButton.isClicked() || (this.space.isPressed() && this.shift.isPressed())) {
            scaleCount *= 0.995;
            snapStartX = ((snapStartX - (deviceWidth / 2)) * 0.995) + (deviceWidth / 2);
            snapStartY = ((snapStartY - (deviceHeight / 2)) * 0.995) + (deviceHeight / 2);
            this.object.scale *= 0.995;
            this.object.width *= 0.995;
            this.object.height *= 0.995;
            this.object.x = ((this.object.x - (deviceWidth / 2)) * 0.995) + (deviceWidth / 2);
            this.object.y = ((this.object.y - (deviceHeight / 2)) * 0.995) + (deviceHeight / 2);
            this.object.setDepth(2);

            this.title.setDepth(1);
            this.instructions.setDepth(1);

            this.grid.destroy();
            this.grid = this.add.gridLayout(snapStartX, snapStartY, 100000, 100000, 28 * scaleCount, 28 * scaleCount);
            this.grid.setOutlineStyle(gridColor, 1)
            this.grid.setDepth(0);
            this.grid.enableClick();
            grid = this.grid;

            for (var v = 0; v < this.wiringPoint.length; v++) {
                if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                    this.wiringPoint[v].setRadius(this.wiringPoint[v].radius *= 0.995);
                    this.wiringPoint[v].x = ((this.wiringPoint[v].x - (deviceWidth / 2)) * 0.995) + (deviceWidth / 2);
                    this.wiringPoint[v].y = ((this.wiringPoint[v].y - (deviceHeight / 2)) * 0.995) + (deviceHeight / 2);
                    this.wiringPoint[v].setDepth(6);
                }
            }

            if (lastPosition[1] != deviceWidth * 0.05 && lastPosition[2] != deviceHeight * 0.22) {
                lastPosition[1] = ((lastPosition[1] - (deviceWidth / 2)) * 0.995) + (deviceWidth / 2);
                lastPosition[2] = ((lastPosition[2] - (deviceHeight / 2)) * 0.995) + (deviceHeight / 2);
            }

            for (var v = 0; v < undo.length / 4; v++) {
                if (undo[v * 4] == "movedObject" || undo[v * 4] == "movedWiringPoint") {
                    undo[(v * 4) + 2] *= 0.995;
                    undo[(v * 4) + 3] *= 0.995;
                }
            }

            for (var v = 0; v < redo.length / 4; v++) {
                if (redo[v * 4] == "movedObject" || redo[v * 4] == "movedWiringPoint") {
                    redo[(v * 4) + 2] *= 0.995;
                    redo[(v * 4) + 3] *= 0.995;
                }
            }
        }

        if (itemBinOpen == true && closing == false) {
            var create = false;
            for (var v = 0; v < this.wiringPoint.length; v++) {
                if (!(this.wiringPoint[v].isClicked())) {
                    if (this.wiringPoint[v].x == deviceWidth * 0.05 && this.wiringPoint[v].y == deviceHeight * 0.22) {
                        this.wiringPoint[v].setDepth(6);
                    } else {
                        if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22) {
                            this.wiringPoint[v].setDepth(3);
                        }
                    }
                }
                if (this.wiringPoint[v].x == deviceWidth * 0.05 && this.wiringPoint[v].y == deviceHeight * 0.22) {
                    create = true;
                }
            }
            if (create == false) {
                let obj = this.add.circle(deviceWidth * 0.05, deviceHeight * 0.22, deviceWidth * 0.005, 0xff0000);
                obj.width = deviceWidth * 0.02;
                obj.height = deviceWidth * 0.02;
                obj.enableClick();
                obj.enableDrag();
                this.wiringPoint.push(obj);
            }
            for (var v = 0; v < this.wiringPoint.length - 1; v++) {
                if (this.wiringPoint[v].x == deviceWidth * 0.05 && this.wiringPoint[v].y == deviceHeight * 0.22) {
                    this.wiringPoint[v].destroy();
                }
            }
            clean(this.wiringPoint)
        }

        if (this.slash.visible == 0) {
            this.grid.visible = 1;
        } else {
            this.grid.visible = 0;
        }

        if (this.w.wasPressed()) {
            this.wiringPoint[this.wiringPoint.length - 1].x = this.input.mousePointer.x;
            this.wiringPoint[this.wiringPoint.length - 1].y = this.input.mousePointer.y;
            undo.push("createdWiringPoint");
            undo.push(this.wiringPoint.length - 1);
            undo.push(-1);
            undo.push(-1);
            redo.splice(0, redo.length);
        }

        if (this.save.wasClicked() || this.saveButton.wasClicked() || (element == null && this.s.wasPressed())) {
            this.save.setVisible(0);
            this.saved.setVisible(1);

            this.disabling();
            this.popupover.setVisible(1);
            this.popup.setVisible(1);
            this.popuptext.setText("Click the above links to download your data.");
            this.popuptext.setVisible(1);
            this.popupdone.setVisible(1);
            this.popupdonetext.setVisible(1);
            this.popupadd.setVisible(1);
            this.popupaddtext.setVisible(1);

            locX.splice(0, locX.length);
            locY.splice(0, locY.length);

            for (var v = 0; v < this.wiringPoint.length; v++) {
                if (this.wiringPoint[v].x != deviceWidth * 0.05 && this.wiringPoint[v].y != deviceHeight * 0.22 && this.wiringPoint[v].visible == 1) {
                    locX[locX.length] = (this.wiringPoint[v].x - this.object.x) / (this.object.width);
                    locY[locY.length] = (this.wiringPoint[v].y - this.object.y) / (this.object.height);
                }
            }

            workshopScale = this.object.scale / scaleCount;

            var objectName = document.getElementById('input').value;
            var objectType = document.getElementById('dropdown').value;
            var objectInfo = [];
            if (objectName != "") {
                objectInfo[0] = '"' + objectName + '"';
            } else {
                objectInfo[0] = "Object Name";
            }
            if (objectType != "") {
                objectInfo[1] = "\"" + objectType + "\"";
            } else {
                objectInfo[1] = "Object Type";
            }
            objectInfo[2] = workshopScale;
            objectInfo[3] = locX.length;
            objectInfo[4] = deviceWidth;

            var textFileUrl = null;

            function generateTextFileUrl(txt) {
                let fileData = new Blob([txt], {
                    type: 'text/plain'
                });

                if (textFileUrl !== null) {
                    window.URL.revokeObjectURL(textFile);
                }
                textFileUrl = window.URL.createObjectURL(fileData);

                return textFileUrl;
            };

            this.clearHTML();

            document.getElementById('downloads').innerHTML = "Downloads: ";

            document.getElementById('download0').innerHTML = "X Locations";
            document.getElementById('download0').download = "XLocations.txt";
            document.getElementById('download0').href = generateTextFileUrl(locX);

            textFileUrl = null;

            document.getElementById('download1').innerHTML = "Y Locations";
            document.getElementById('download1').download = "YLocations.txt";
            document.getElementById('download1').href = generateTextFileUrl(locY);

            textFileUrl = null;

            document.getElementById('download2').innerHTML = "Object Info";
            document.getElementById('download2').download = "ObjectInfo.txt";
            document.getElementById('download2').href = generateTextFileUrl(objectInfo);
        }

        if (this.home.wasClicked()) {
            this.clearHTML();
            this.popupover.setVisible(1);
            this.popup.setVisible(1);
            this.popuptext.setText("Are you sure you want to leave? You will lose your work.");
            this.popuptext.setVisible(1);
            this.popupcancel.setVisible(1);
            this.popupyes.setVisible(1);
            this.popupcanceltext.setVisible(1);
            this.popupyestext.setVisible(1);

            this.disabling();
        }

        if (this.info.wasClicked()) {
            //window.open('https://youtube.com', '_blank');
            window.open('/Tutorial.html', '_blank');
        }

        if (this.dark.isOver()) {
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
            this.dark.setAlpha(0.5);
        } else {
            this.dark.setAlpha(1);
        }

        if (this.dark.wasClicked()) {
            if (this.floor.fillColor == 0xffffff) {
                this.floor.fillColor = 0x000000;
                gridColor = 0x444444;
                this.grid.setOutlineStyle(gridColor, 1);
                this.instructions.setFontColor(0xffffff);
                this.itemBin.fillColor = 0x333333;
                this.binHandle.fillColor = 0x333333;
                this.binHandleArrow.setFrame(1);
                this.wiringPointLabel.setFontColor(0xffffff)
            } else {
                this.floor.fillColor = 0xffffff;
                gridColor = 0xdddddd;
                this.grid.setOutlineStyle(gridColor, 1);
                this.instructions.setFontColor(0x000000);
                this.itemBin.fillColor = 0xdddddd;
                this.binHandle.fillColor = 0xdddddd;
                this.binHandleArrow.setFrame(0);
                this.wiringPointLabel.setFontColor(0x000000)
            }
        }

        if (this.popupcancel.wasClicked() || this.popupcanceltext.wasClicked() || this.popupdone.wasClicked() || this.popupdonetext.wasClicked() || (element == null && this.esc.wasPressed())) {
            this.clearHTML();
            document.getElementById('label').innerHTML = "Object Name:";
            document.getElementById('label2').innerHTML = "Object Type:";
            document.getElementById('input').style.display = 'block';
            document.getElementById('dropdown').style.display = 'block';
            document.getElementById('option1').value = "Choose";
            document.getElementById('option1').style.display = "block";
            document.getElementById('option2').value = "Microcontrollers";
            document.getElementById('option2').style.display = "block";
            document.getElementById('option3').value = "Electrical";
            document.getElementById('option3').style.display = "block";
            document.getElementById('option4').value = "Modules";
            document.getElementById('option4').style.display = "block";
            document.getElementById('option5').value = "Other";
            document.getElementById('option5').style.display = "block";
            this.popupover.setVisible(0);
            this.popup.setVisible(0);
            this.popuptext.setVisible(0);
            this.popupcancel.setVisible(0);
            this.popupyes.setVisible(0);
            this.popupcanceltext.setVisible(0);
            this.popupyestext.setVisible(0);
            this.popupdone.setVisible(0);
            this.popupdonetext.setVisible(0);
            this.popupadd.setVisible(0);
            this.popupaddtext.setVisible(0);
            this.save.setVisible(1);
            this.saved.setVisible(0);
            this.enabling();
        }

        if (this.popupyes.wasClicked() || this.popupyestext.wasClicked() || (this.popupyes.visible == 1 && this.return.wasPressed())) {
            this.scene.start("Menu");
        }
    }

    disabling() {
        this.object.disableClick();
        this.object.disableDrag();
        this.info.disableClick();
        this.home.disableClick();
        this.increaseScale.disableClick();
        this.increaseScaleButton.disableClick();
        this.decreaseScale.disableClick();
        this.decreaseScaleButton.disableClick();
        this.magnet.disableClick();
        this.save.disableClick();
        this.saveButton.disableClick();
        this.binHandleArrow.disableClick();
        this.binHandle.disableClick();
        this.undo.disableClick();
        this.redo.disableClick();
        for (var i = 0; i < this.wiringPoint.length; i++) {
            this.wiringPoint[i].disableClick();
            this.wiringPoint[i].disableDrag();
        }
    }

    enabling() {
        this.object.enableClick();
        this.object.enableDrag();
        this.info.enableClick();
        this.home.enableClick();
        this.increaseScale.enableClick();
        this.increaseScaleButton.enableClick();
        this.decreaseScale.enableClick();
        this.decreaseScaleButton.enableClick();
        this.magnet.enableClick();
        this.save.enableClick();
        this.saveButton.enableClick();
        this.binHandleArrow.enableClick();
        this.binHandle.enableClick();
        this.undo.enableClick();
        this.redo.enableClick();
        for (var i = 0; i < this.wiringPoint.length; i++) {
            this.wiringPoint[i].enableClick();
            this.wiringPoint[i].enableDrag();
        }
    }

    clearHTML() {
        document.getElementById('flex-box').style.flexDirection = 'row';
        document.getElementById('label').innerHTML = "";
        document.getElementById('input').blur();
        document.getElementById('input').style.display = 'none';
        document.getElementById('inputnum').value = "";
        document.getElementById('inputnum').blur();
        document.getElementById('inputnum').style.display = 'none';
        document.getElementById('label2').innerHTML = "";
        document.getElementById('dropdown').blur();
        document.getElementById('dropdown').style.display = 'none';
        document.getElementById('option1').value = "Choose";
        document.getElementById('option2').value = "Microcontroller";
        document.getElementById('option3').value = "Electrical";
        document.getElementById('option4').value = "Modules";
        document.getElementById('option5').value = "Other";
        document.getElementById('label3').innerHTML = "";
        document.getElementById('downloads').innerHTML = "";
        document.getElementById('download0').innerHTML = "";
        document.getElementById('download0').href = "#";
        document.getElementById('download1').innerHTML = "";
        document.getElementById('download1').href = "#";
        document.getElementById('download2').innerHTML = "";
        document.getElementById('download2').href = "#";
    }
}
