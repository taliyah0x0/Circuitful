class Menu extends SimpleScene {

    constructor() {
        super("Menu");
    }

    init() {}

    preload() {

    }

    create() {

        document.getElementById('downloadObjectInfo').innerHTML = "";
        document.getElementById('downloadObjectInfo').href = "#";
        document.getElementById('downloadXLink').innerHTML = "";
        document.getElementById('downloadXLink').href = "#";
        document.getElementById('downloadYLink').innerHTML = "";
        document.getElementById('downloadYLink').href = "#";

        this.title = this.add.text(deviceWidth / 2, deviceHeight * 0.045, "CIRCUITFUL", 0x999999);
        this.title.setOrigin(0.5, 0);
        this.title.setFontSize(deviceHeight * 0.075);
        this.instructions = this.add.text(deviceWidth / 2, deviceHeight * 0.15, "Welcome. Circuitful is a tool for drawing colorful circuit diagrams.", 0x000000)
        this.instructions.setOrigin(0.5, 0);
        this.instructions.setFontSize(deviceHeight * 0.03);

        this.prepareObject = this.add.rectangle(deviceWidth * 0.18, deviceHeight * 0.6, deviceWidth * 0.25, deviceHeight * 0.75, 0xbbbbbb);
        this.prepareObjectLabel = this.add.text(deviceWidth * 0.07, deviceHeight * 0.25, "PREPARE", 0xffffff);
        this.prepareObjectLabel.setFontSize(50);
        this.prepareObjectLabel2 = this.add.text(deviceWidth * 0.07, deviceHeight * 0.37, "A NEW OBJECT", 0xffffff);
        this.prepareObjectLabel2.setFontSize(30);
        this.prepareObject.enableClick();
        this.prepareObjectLabel.enableClick();
        this.prepareObjectLabel2.enableClick();

        this.goWorkspace = this.add.rectangle(deviceWidth / 2, deviceHeight * 0.6, deviceWidth * 0.35, deviceHeight * 0.75, 0xbbbbbb);
        this.goWorkspaceLabel = this.add.text(deviceWidth * 0.34, deviceHeight * 0.25, "GO TO", 0xffffff);
        this.goWorkspaceLabel.setFontSize(70);
        this.goWorkspaceLabel2 = this.add.text(deviceWidth * 0.34, deviceHeight * 0.37, "WORKSPACE", 0xffffff);
        this.goWorkspaceLabel2.setFontSize(50);
        this.goWorkspace.enableClick();
        this.goWorkspaceLabel.enableClick();
        this.goWorkspaceLabel2.enableClick();

        this.import = this.add.rectangle(deviceWidth * 0.82, deviceHeight * 0.6, deviceWidth * 0.25, deviceHeight * 0.75, 0xbbbbbb);
        this.importLabel = this.add.text(deviceWidth * 0.71, deviceHeight * 0.25, "IMPORT", 0xffffff);
        this.importLabel.setFontSize(50);
        this.importLabel2 = this.add.text(deviceWidth * 0.71, deviceHeight * 0.37, "SAVED WORKSPACE", 0xffffff);
        this.importLabel2.setFontSize(30);
        this.import.enableClick();
        this.importLabel.enableClick();
        this.importLabel2.enableClick();

    }

    update() {
        const pElement = document.getElementsByTagName("body")[0];
        if (this.prepareObject.wasClicked() || this.prepareObjectLabel.wasClicked() || this.prepareObjectLabel2.wasClicked()) {
            this.scene.start("Step1");
        }
        if (this.goWorkspace.wasClicked() || this.goWorkspaceLabel.wasClicked() || this.goWorkspaceLabel2.wasClicked()) {
            this.scene.start("Step4");
        }
        if (this.import.wasClicked() || this.importLabel.wasClicked() || this.importLabel2.wasClicked()) {
            this.scene.start("Import");
        }

        this.prepareObject.fillColor = 0xbbbbbb;
        this.goWorkspace.fillColor = 0xbbbbbb;
        this.import.fillColor = 0xbbbbbb;

        if (this.prepareObject.isOver() || this.prepareObjectLabel.isOver() || this.prepareObjectLabel2.isOver()) {
            this.prepareObject.fillColor = 0xED4040;
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
        } else {
            pElement.style.cursor = "url('https://i.ibb.co/hsnxb67/icons8-cursor-30.png'), auto";
        }

        if (this.goWorkspace.isOver() || this.goWorkspaceLabel.isOver() || this.goWorkspaceLabel2.isOver()) {
            this.goWorkspace.fillColor = 0xEDDD2D;
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
        }

        if (this.import.isOver() || this.importLabel.isOver() || this.importLabel2.isOver()) {
            this.import.fillColor = 0x45B5C4;
            pElement.style.cursor = "url('https://i.ibb.co/RD5jn4v/icons8-hand-cursor-24-1-1.png'), auto";
        }


    }
}
