class SimpleScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    // super({
    //   key: key,
    //   physics: {
    //     default: 'arcade',
    //     arcade: { }
    //   }
    // });
  }

  init() {
    this.alignTo = Phaser.Display.Align.To;
    this.alignIn = Phaser.Display.Align.In;

    //let pys = Phaser.Scenes.GetPhysicsPlugins(this.sys)  ArcadePhysics
    //console.log(this.plugins);
    // let ret = this.plugins.installScenePlugin('ArcadePhysics')
    // var source = Phaser.Plugins.PluginCache.getCore('ArcadePhysics');
    // console.log(source);
  }


  removeKey(key) {
    this.input.keyboard.removeKey(key);
    this.input.keyboard.removeCapture(key);
  }


  // display the pointer coordinates live on the screen
  showLiveCoordinates() {
    this.liveCoordinates = this.add.text(0, 0, "(0, 0)").setOrigin(0, 1);
    this.liveCoordinates.alpha = 0.8;
    this.liveCoordinates.depth = 200;

    this.input.on('pointermove', function (pointer) {
      pointer = this.getPointer();
      this.liveCoordinates.x = pointer.getX();
      this.liveCoordinates.y = pointer.getY();
      let text = `(${Math.round(pointer.getX())}, ${Math.round(pointer.getY())})`;
      this.liveCoordinates.setText(text);
    }, this);
  }

  // draws the origin location on top of the game Object
  // helps students to visualize the origin
  drawOrigin(obj) {
    if (!obj.originDot) {
      obj.originDot = this.add.circle(obj.x, obj.y, 3, 0xFF0000);
    }
    else {
      obj.originDot.x = obj.x;
      obj.originDot.y = obj.y;
    }
    return obj.originDot;
  }

  // draw a grid for reference 
  drawGrid() {
    var w = this.cameras.main.displayWidth;
    var h = this.cameras.main.displayHeight;
    var weight = .5;
    var color = "0xffffff";
    var font = {
      font: "10px Arial",
      fill: "#ffffff",
    };
		let grid = []
    for (var i = 100; i <= w; i += 100) {
      grid.push(this.add.rectangle(i, h / 2, weight, h, color));
      grid.push(this.add.text(i, 0, i, 0xFFFFFF, font).setOrigin(.5, 0));
    }
    for (var i = 100; i <= h; i += 100) {
      grid.push(this.add.rectangle(w / 2, i, w, weight, color));
      grid.push(this.add.text(0, i, i, 0xFFFFFF, font).setOrigin(0, 0.5));
    }
		grid.push(this.add.text(0, 0, "(0, 0)", 0xFFFFFF, font));
		if (this._grid && this._grid.length > 0) {
			for (let obj of this._grid) {
				obj.destroy();
			}
		}
		this._grid = grid;
  }

  //Use this to create a text input that allows new line
  // config options: https://www.w3schools.com/tags/tag_textarea.asp
  addTextArea(x, y, rows, cols, config) {
    var textarea = document.createElement("textarea");
    textarea.rows = rows;
    textarea.cols = cols;
    textarea.spellcheck = false;
    Object.assign(textarea, config);
    let obj = this.add.dom(x, y, textarea);
    obj.setOrigin(0, 0);
    this.addTextToInput(obj, config);

    this.addGetSetValue(obj);
    if (config && config.value != undefined)
      obj.setValue(config.value);
    this.addEnableDisable(obj);

    return obj;
  }

  //(private) Used to create input fields that need standard value getters and setters
  addGetSetValue(obj) {
    obj.getValue = function () {
      return obj.node.value;
    }
    obj.setValue = function (value) {

      obj.node.value = value;
      return obj;
    }
  }

  //(private) Used to create input fields that need standard enable and disable
  addEnableDisable(obj) {
    obj.disable = function () {
      obj.node.disabled = true;
      return obj;
    }
    obj.enable = function () {
      obj.node.disabled = false;
      return obj;
    }
  }


  //(public) Used to create drop down menus
  // option is an array of menu items. config is be true HTML options
  //{text:"text to show", value:"can bet set different from text if needed"}
  addSelectField(x, y, options, config) {
    var s = document.createElement("select");

    for (let i = 0; i < options.length; i++) {
      var o = document.createElement("option");
      Object.assign(o, options[i]);
      s.add(o);
    }
    Object.assign(s, config);
    let obj = this.add.dom(x, y, s);
    obj.setOrigin(0, 0.1);
    this.addTextToInput(obj, config);
    this.addGetSetValue(obj);
    if (config && config.value != undefined) {
      obj.setValue(config.value);
    }
    this.addEnableDisable(obj);


    return obj;
  }

  //User this to create different types of inputs
  //Tested with input types: number, text, range(slider), color
  addInputField(x, y, type, width, config) {

    var el = document.createElement("input");
    el.type = type.toLowerCase();
    el.autocomplete = false;
    el.style = `width: ${width}px;`;
    Object.assign(el, config);
    let obj = this.add.dom(x, y, el);
    obj.setOrigin(0, 0);
    this.addTextToInput(obj, config);

    if (el.type == "number" || el.type == "range") {
      //Numerical input types
      obj.getValue = function () {
        if (obj.node.max != "" && obj.node.value * 1 > obj.node.max * 1) {
          obj.node.value = obj.node.max * 1;
        }
        if (obj.node.min != "" && obj.node.value * 1 < obj.node.min * 1) {
          obj.node.value = obj.node.min * 1;
        }
        return obj.node.value * 1;
      }
    }
    else {
      //Text-based input types
      obj.getValue = function () {
        if (obj.node === null) return null;
        if (obj.node.type == "color") {
          return "0x" + obj.node.value.trim().substr(1);
        }
        else if (typeof obj.node.value == "string") {
          return obj.node.value.trim();
        }
        return obj.node.value;
      }
    }
    if (el.type == "text") {
      obj.setValue = function (value) {
        obj.node.value = value;
        setTimeout(function(){ obj.node.selectionStart = obj.node.selectionEnd = 10000; }, 0);
        return obj;
      }
    }
    else {
      obj.setValue = function (value) {
        obj.node.value = value;
        return obj;
      }      
    }
    this.addEnableDisable(obj);

    if (config && config.value != undefined) {
      obj.setValue(config.value);
    }

    return obj;
  }

  //(private) This is used to create labels on user input fields
  addTextToInput(obj, config) {
    obj.setLabel = function (text) {
      if (obj.label) {
        obj.label.destroy();
      }
      obj.label = this.scene.add.text(obj.x, obj.y, text).setOrigin(1, 0);
    }

    if (config == undefined) {
      return;
    }
    if (config.label) {
      obj.setLabel(config.label);
    }
    if (config.posttext) {
      obj.posttext = this.add.text(obj.x + obj.width, obj.y, " " + config.posttext).setOrigin(0, 0);
    }
  }

  // Create a html overlay component from key 
  // Use this.load.html(key, file) first to create key
  addHtml(x, y, key) {
    var obj = this.add.dom(x, y).createFromCache(key);
    return obj;
  }


  getPointer() {
    let obj = this.input.activePointer;

    obj.isDown = function () {
      return obj.isDown;
    }
    obj.getX = function () {
      return obj.worldX;
    }
    obj.getY = function () {
      return obj.worldY;
    }
    return obj
  }
}