class Step3 extends SimpleScene {

    constructor() {
        super("Step3");
    }

    init() {}

    preload() {
        this.load.image("home", "assets/home.png")
    }

    create() {
        const pElement = document.getElementsByTagName("body")[0];
        pElement.style.cursor = "url('https://i.ibb.co/hsnxb67/icons8-cursor-30.png'), auto";

        this.title = this.add.text(deviceWidth / 2, deviceHeight * 0.045, "STEP 3", 0x999999);
        this.title.setOrigin(0.5, 0);
        this.title.setFontSize(deviceHeight * 0.075);
        this.instructions = this.add.text(deviceWidth / 2, deviceHeight * 0.15, "Follow the instructions below.", 0x000000)
        this.instructions.setOrigin(0.5, 0);
        this.instructions.setFontSize(deviceHeight * 0.03);

        this.add.text(deviceWidth * 0.035, deviceHeight * 0.22, "1. Click the above links \"Download X Locations\", \"Download Y Locations\", and \"Download Object Info\" to retrieve object and wiring point(s) data.", 0x000000);
        this.add.text(deviceWidth * 0.035, deviceHeight * 0.27, "2. Go to Step4.js and create two 2 new arrays with the next object ID number.", 0x000000);
        this.add.text(deviceWidth * 0.035, deviceHeight * 0.32, "3. Copy and paste the X and Y location values into their corresponding arrays.", 0x000000);
        this.add.text(deviceWidth * 0.035, deviceHeight * 0.37, "4. In ObjectInfo.txt, replace <Object Name> with the name of the component.", 0x000000);
        this.add.text(deviceWidth * 0.035, deviceHeight * 0.42, "5. Choose from \"Microcontrollers\", \"Electrical\", \"Modules\", and \"Other\" to replace <Object Type>", 0x000000);
        this.add.text(deviceWidth * 0.035, deviceHeight * 0.47, "6. Copy and paste the entire object info array into a new line beneath the \"\\\\Paste object info here\" comment near the top of Step4.js.", 0x000000);
        this.add.text(deviceWidth * 0.035, deviceHeight * 0.52, "7. Rename object.png with the matching object ID number and drag it into the \"workspace-objects\" folder", 0x000000);

        this.home = this.add.sprite(deviceWidth * 0.95, deviceHeight * 0.94, "home");
        this.home.setScale(0.15)
        this.home.enableClick();


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

        document.getElementById('downloadXLink').innerHTML = "Download X Locations";
        document.getElementById('downloadXLink').href = generateTextFileUrl(locX);

        textFileUrl = null;

        document.getElementById('downloadYLink').innerHTML = "Download Y Locations";
        document.getElementById('downloadYLink').href = generateTextFileUrl(locY);

        textFileUrl = null;

        document.getElementById('downloadObjectInfo').innerHTML = "Download Object Info";
        document.getElementById('downloadObjectInfo').href = generateTextFileUrl(objectInfo);

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

        if (this.home.wasClicked()) {
            this.scene.start("Menu");
        }
    }
}
