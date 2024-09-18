class Menu extends SimpleScene {

    constructor() {
        super("Menu");
    }

    init() {}

    preload() {
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {
        document.getElementById('flex-box').flexDirection = "row";
        document.getElementById('downloads').innerHTML = "";
        document.getElementById('download0').innerHTML = "";
        document.getElementById('download0').href = "#";
        document.getElementById('download1').innerHTML = "";
        document.getElementById('download1').href = "#";
        document.getElementById('download2').innerHTML = "";
        document.getElementById('download2').href = "#";
        document.getElementById('label').innerHTML = "";
        document.getElementById('input').value = "";
        document.getElementById('input').style.display = 'none';
        document.getElementById('label2').innerHTML = "";
        document.getElementById('label3').innerHTML = "";
        document.getElementById('dropdown').value = "Choose Type";
        document.getElementById('dropdown').style.display = 'none';

        WebFont.load({
            custom: {
                families: ['Sans'],
                urls: ['assets/sans.ttf']  // Ensure the path to your font is correct
            },
            active: () => {
                this.title = this.add.text(deviceWidth / 2, deviceHeight * 0.045, "CIRCUITFUL", 0x999999);
                this.title.setOrigin(0.5, 0);
                this.title.setFontSize(deviceHeight * 0.075);
                this.instructions = this.add.text(deviceWidth / 2, deviceHeight * 0.15, "Welcome. Circuitful is a tool for drawing colorful circuit diagrams.", 0x000000)
                this.instructions.setOrigin(0.5, 0);
                this.instructions.setFontSize(deviceHeight * 0.03);

                this.prepareObject = this.add.rectangle(deviceWidth * 0.18, deviceHeight * 0.6, deviceWidth * 0.25, deviceHeight * 0.75, 0xbbbbbb);
                this.prepareObjectLabel = this.add.text(deviceWidth * 0.07, deviceHeight * 0.25, "PREPARE", 0xffffff);
                this.prepareObjectLabel.setFontSize(deviceHeight*0.08);
                this.prepareObjectLabel2 = this.add.text(deviceWidth * 0.07, deviceHeight * 0.35, "A NEW OBJECT", 0xffffff);
                this.prepareObjectLabel2.setFontSize(deviceHeight*0.05);
                this.prepareObject.enableClick();
                this.prepareObjectLabel.enableClick();
                this.prepareObjectLabel2.enableClick();

                this.goWorkspace = this.add.rectangle(deviceWidth / 2, deviceHeight * 0.6, deviceWidth * 0.35, deviceHeight * 0.75, 0xbbbbbb);
                this.goWorkspaceLabel = this.add.text(deviceWidth * 0.34, deviceHeight * 0.25, "GO TO", 0xffffff);
                this.goWorkspaceLabel.setFontSize(deviceHeight*0.1);
                this.goWorkspaceLabel2 = this.add.text(deviceWidth * 0.34, deviceHeight * 0.37, "WORKSPACE", 0xffffff);
                this.goWorkspaceLabel2.setFontSize(deviceHeight*0.08);
                this.goWorkspace.enableClick();
                this.goWorkspaceLabel.enableClick();
                this.goWorkspaceLabel2.enableClick();

                this.importPart = this.add.rectangle(deviceWidth*0.82,deviceHeight*0.4,deviceWidth*0.25,deviceHeight*0.35,0xbbbbbb);
                this.importPartLabel = this.add.text(deviceWidth*0.71,deviceHeight*0.25,"IMPORT",0xffffff);
                this.importPartLabel.setFontSize(deviceHeight*0.08);
                this.importPartLabel2 = this.add.text(deviceWidth*0.71,deviceHeight*0.35,"SAVED PART",0xffffff);
                this.importPartLabel2.setFontSize(deviceHeight * 0.05);
                this.importPart.enableClick();
                this.importPartLabel.enableClick();
                this.importPartLabel2.enableClick();

                this.import = this.add.rectangle(deviceWidth * 0.82, deviceHeight * 0.8, deviceWidth * 0.25, deviceHeight * 0.35, 0xbbbbbb);
                this.importLabel = this.add.text(deviceWidth * 0.71, deviceHeight * 0.65, "IMPORT", 0xffffff);
                this.importLabel.setFontSize(deviceHeight*0.08);
                this.importLabel2 = this.add.text(deviceWidth * 0.71, deviceHeight * 0.75, "SAVED WORKSPACE", 0xffffff);
                this.importLabel2.setFontSize(deviceHeight * 0.04);
                this.import.enableClick();
                this.importLabel.enableClick();
                this.importLabel2.enableClick();
            }
        });
    }

    update() {
        setTimeout(() => {
        const pElement = document.getElementsByTagName("body")[0];

        if (this.prepareObject.wasClicked() || this.prepareObjectLabel.wasClicked() || this.prepareObjectLabel2.wasClicked()) {
            this.scene.start("PartEditor");
        }
        if (this.goWorkspace.wasClicked() || this.goWorkspaceLabel.wasClicked() || this.goWorkspaceLabel2.wasClicked()) {
            this.scene.start("Workspace");
        }
        if(this.importPart.wasClicked() || this.importPartLabel.wasClicked() || this.importPartLabel2.wasClicked()){
            window.open('/Tutorial.html', '_blank');
        }
        if (this.import.wasClicked() || this.importLabel.wasClicked() || this.importLabel2.wasClicked()) {
            window.open('/Tutorial.html', '_blank');
        }

        this.prepareObject.fillColor = 0xbbbbbb;
        this.goWorkspace.fillColor = 0xbbbbbb;
        this.importPart.fillColor = 0xbbbbbb;
        this.import.fillColor = 0xbbbbbb;

        if (this.prepareObject.isOver() || this.prepareObjectLabel.isOver() || this.prepareObjectLabel2.isOver()) {
            this.prepareObject.fillColor = 0xED4040;
            pElement.style.cursor = "url('assets/hand.png'), auto";
        } else {
            pElement.style.cursor = "url('assets/blackcursor.png'), auto";
        }

        if (this.goWorkspace.isOver() || this.goWorkspaceLabel.isOver() || this.goWorkspaceLabel2.isOver()) {
            this.goWorkspace.fillColor = 0xEDDD2D;
            pElement.style.cursor = "url('assets/hand.png'), auto";
        }

        if(this.importPart.isOver() || this.importPartLabel.isOver() || this.importPartLabel2.isOver()){
            this.importPart.fillColor = 0x4FBA52;
            pElement.style.cursor = "url('assets/hand.png'), auto";
        }

        if (this.import.isOver() || this.importLabel.isOver() || this.importLabel2.isOver()) {
            this.import.fillColor = 0x406EED;
            pElement.style.cursor = "url('assets/hand.png'), auto";
        }
        }, 20);
    }
}
