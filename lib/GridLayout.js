Phaser.GameObjects.GameObjectFactory.register('gridLayout', function (x, y, columns, rows, cellWidth, cellHeight, fillColor, fillAlpha, outlineFillColor, outlineFillAlpha)
{
    return this.displayList.add(new GridLayout(this.scene, x, y, columns, rows, cellWidth, cellHeight, fillColor, fillAlpha, outlineFillColor, outlineFillAlpha));
});

Phaser.Loader.FileTypesManager.register('imageset', function (key, url, width, height, margin, spacing)
{
  width = (width === undefined) ? 16 : width;
  height = (height === undefined) ? width : height;
  
  var frameConfig = {
    frameWidth: width,
    frameHeight: height,
    margin: margin,
    spacing: spacing 
  };
  var file = new Phaser.Loader.FileTypes.SpriteSheetFile(this, key, url, frameConfig);
  this.addFile(file);
  return this;
});

class GridLayout extends Phaser.GameObjects.Grid {
  
  constructor(scene, x, y, columns, rows, cellWidth, cellHeight, fillColor, fillAlpha, outlineFillColor, outlineFillAlpha) {

    if (cellHeight === undefined) cellHeight = cellWidth;
    if (fillColor === undefined) fillColor = 0x000000;
    if (fillAlpha === undefined) fillAlpha = 0;
    if (outlineFillColor === undefined) outlineFillColor = 0xFFFFFF;
    if (outlineFillAlpha === undefined) outlineFillAlpha = 0.3;

    super(scene, x, y, columns * cellWidth, rows * cellHeight, cellWidth, cellHeight, fillColor, fillAlpha, outlineFillColor, outlineFillAlpha);

    this.columns = columns;
    this.rows = rows;
    this.setOrigin(0, 0);
  }

  hide() {
    this.visible = false;
    return this;
  }

  show() {
    this.visible = true;
    return this;
  }
  


  place(object, column, row, originX, originY) {
    if (column === undefined) column = 0;
    if (row === undefined) row = 0;
    if (originX === undefined) originX = 0.5;
    if (originY === undefined) originY = 0.5;

    if (Array.isArray(object)) {
      return this.fill(object, column, row, originX, originY)
    }

    if (typeof object == 'string') {
      object = this.scene.add.sprite(0, 0, object);
    }
    
    var xPos = (column + originX) * this.cellWidth;
    var yPos = (row + originY) * this.cellHeight; 
    object.x = (xPos * this.scaleX) + this.getTopLeft().x; 
    object.y = (yPos * this.scaleY) + this.getTopLeft().y;

    return object;
  }

  fill(objects, columnStart, rowStart, originX, originY) {
    if (typeof objects == 'string') {
      return this.fillSprite(objects, columnStart, rowStart, originX, originY);
    }

    if (objects === undefined || !Array.isArray(objects)) return;
    if (columnStart === undefined) columnStart = 0;
    if (rowStart === undefined) rowStart = 0;

    var i = 0;
    for (let row = rowStart; row < this.rows; row++) {
      for (let column = columnStart; column < this.columns && i < objects.length; column++) {
        this.place(objects[i++], column, row, originX, originY);
      }
    }
    return objects;
  }

  fillSprite(key, columnStart, rowStart, originX, originY) {
    if (key === undefined) return;
    if (columnStart === undefined) columnStart = 0;
    if (rowStart === undefined) rowStart = 0;

    let ret = [];
    for (let row = rowStart; row < this.rows; row++) {
      for (let column = columnStart; column < this.columns; column++) {
        ret.push(this.place(key, column, row, originX, originY));
      }
    }
    return ret;
  }


  map(objects, id, map) {
    if(typeof objects == 'string') { //objects is sprite key
      return this.mapSprite(objects, id, map);
    }

    if(!Array.isArray(objects)) objects = [objects];
    var i = 0;
    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length && i < objects.length; column++) {
        if (id == map[row][column]) {
          this.place(objects[i++], column, row);
        }
      }
    }
    return objects;
  }

  mapSprite(key, id, map) {
    let objects = [];
    for (let row = 0; row < map.length; row++) {
      for (let column = 0; column < map[row].length; column++) {
        if (id == map[row][column]) {
          objects.push(this.place(this.scene.add.sprite(0, 0, key), column, row));
        }
      }
    }
    return objects;
  }
  
  addTileset(tilesets, margin, spacing) {
   
    if (tilesets) {
      tilesets = Array.isArray(tilesets) ? tilesets : [tilesets];
      let gid = 0;
      for(let tileset of tilesets) {
        let texture = this.scene.textures.get(tileset);
        let width = this.cellWidth;
        let height = this.cellHeight;
        //scan texture for tileset properties loaded by imageset
        if (texture.frameTotal > 1) {
          let frame = texture.frames[0]
          width = frame.width;
          height = frame.height; 
          margin = (margin === undefined) ? frame.cutX : margin;
          let s = texture.frames[1].cutX - frame.cutX - width;
          spacing = (spacing === undefined) ? s : spacing;
        }
        
        if (this._map === undefined) {
          this._map = this.scene.make.tilemap({tileWidth: width, tileHeight: height});
        }
        tileset = this._map.addTilesetImage(tileset, tileset, width, height, margin, spacing, gid);
        gid += tileset.total;
      }
      this._map.totalTiles = gid;
    }
    return this._map;
  }

  getMap(name) {
    var cache = this.scene.cache.tilemap.get(name);
    switch (cache.format){
      case Phaser.Tilemaps.Formats.Google:
        return cache.data;
      case Phaser.Tilemaps.Formats.CSV:
        return cache.data.split("\n").map((row) =>{return row.split(",")});
      default:
        return null;
    }    
  }

  addTileLayer (map, autoScale, colOffset, rowOffset) {
    if (autoScale === undefined) autoScale = true;
    if (colOffset === undefined) colOffset = 0;
    if (rowOffset === undefined) rowOffset = 0;

    if (!this._map || !this._map.tilesets || !this._map.tilesets.length) {
      console.log("ERROR: Add tilesets to the grid before adding tile layers.");
      return;
    }

    var tilesets = this._map.tilesets;

    if (typeof map === 'string') {
      map = this.getMap(map);
    }
    //timemap is a 2D array
    let rows = map.length + rowOffset;
    let columns = map[0].length  + colOffset;
    let name = this._map.layers.length;
    let layer = this._map.createBlankDynamicLayer(name, tilesets, this.getTopLeft().x, this.getTopLeft().y, columns, rows);
    //populate layer with indices from tilemap
    layer.putTilesAt(map, colOffset, rowOffset);
    //layer = this._map.convertLayerToStatic(layer);

    autoScale ? layer.setScale(this.cellHeight/layer.tilemap.tileHeight) : null;
    layer.columns = columns;
    layer.rows = rows;
//this.layer1.getTiles().forEach((tile)=>tile.index = 15);
    layer.getTiles= (index, range)=> {
      let filter = (tile)=> true;
      if (typeof index === 'number') {
        filter =  (tile)=> tile.index === index;
        if (typeof range === 'number') {
          filter = (tile)=> tile.index >= index && tile.index <= range;
        }
      }
      else if (Array.isArray(index)) {
        filter = (tile) => index.includes(tile.index);
      }
      return layer.filterTiles(filter);
    }
    //Used by showPalette. It can also be used to debug the layer.
    layer.showIndex = ()=> {   
      let bounds = layer.scene.add.rectangle(0, 0, this._map.tileWidth, this._map.tileHeight)
      bounds.setStrokeStyle(3, 0xFF00FF, .7);
      bounds.depth = 202;
      
      layer.style = {
        color: '#FFF',
        fontFamily: `Arial`,
        fontSize: 14,
        stroke: '#000',
        strokeThickness: 3,
      }
      let label = layer.scene.add.text(0, 0, "X",layer.style);
      label.setOrigin(0.5, 1);
      label.depth = 202;

      layer.showBounds = (show) => {
        show = show == undefined ? true : show;
        bounds.visible = show;
        label.visible = show;
        bounds.setScale(layer.scale);
      }
      layer.showBounds(false);

      layer.highlightTile = (px, py)=> {

        let p = this.scene.getPointer();
        p.worldY = py;
        p.worldX = px;
        let tile = layer.getTileAtWorldXY(p.getX(), p.getY()); 

        if (!tile) return;
        if (tile.index == null)  {
          layer.showBounds(false);
          return;
        }

        let x = tile.getCenterX();
        let y = tile.getCenterY();
        bounds.setPosition(x, y);
        label.setPosition(x, y);
        label.setText(tile.index);
        layer.showBounds(true);
      }

      //Text optimization when you have render hundreds of labels
      layer.style.fontSize = 9;
      let text = layer.scene.add.text(0, 0, "x", layer.style);
      layer.style.metrics = text.getTextMetrics(); //save metrucs
      text.destroy();
      
      layer.labels = layer.scene.add.container(layer.x, layer.y, []);

      layer.forEachTile((tile) =>{
        let x = tile.getCenterX() - layer.x;//getTopLeft().x;
        let y = tile.getCenterY() - layer.y;//getTopLeft().y;
        let label = this.scene.add.text(x, y, tile.index, layer.style).setOrigin(0.5, 0.5);
        label.displayOriginX = Math.round(label.displayOriginX);
        label.displayOriginY = Math.round(label.displayOriginY);
        label.depth = 100;
        label.setScale(layer.scale);
        layer.labels.add(label);          
      }); 
      
      layer.labels.visible = false;
      
      layer.setInteractive();
      layer.on('pointermove', (pointer)=> {
        layer.highlightTile(pointer.x, pointer.y);
      });

      layer.on('pointerout', (pointer)=> {
        layer.showBounds(false);
      });

      layer.on('pointerdown', (pointer)=> {
        layer.labels.visible= !layer.labels.visible;
        layer.labels.setPosition(layer.x, layer.y);
      });

      layer.on('drag', function (pointer, dragX, dragY) {
        layer.labels.setPosition(layer.x, layer.y);
      });
      return layer;
    }

    
    return layer;
  }

  //Creates a layer to show the tilesets available
  //Used for debug and creating maps
  showPalette(x, y, scale) {
    if (this._palette) return; //prevent recreating
    if(scale === undefined) scale = 1;


    //calculate rows and columns of tilesets
    var columns = 0, rows = 0;
    for(let tileset of this._map.tilesets) {
      columns += tileset.columns;
      rows = tileset.rows < rows ? rows : tileset.rows;
    }

    var w = this._map.tileWidth;
    var h = this._map.tileHeight;
    var grid = this.scene.add.grid(x, y, columns * w, rows * h, w, h, 0, 0, 0xFFFFFF, 0.3).setOrigin(0,0);

    //create 2D array to populate
    var tilemap = new Array(rows);
    for (let i = 0; i < tilemap.length; i++) {
      tilemap[i] = new Array(columns);
    }
    //go through each tileset create 2D data array
    var col = 0, row = 0;
    for(var tileset of this._map.tilesets) {
      for(var i = 0; i < tileset.total; i++) {
        tilemap[row][col++] = tileset.firstgid + i;
        if (i % tileset.columns == tileset.columns - 1) {
          row++;
          col -= tileset.columns;
        }
      }
      col += tileset.columns;
      row = 0;
    }
    // Create layer and set scale 
    var palette = this.addTileLayer(tilemap, false);
    palette.setPosition(x, y);

    
    //Display index when pointer is over
    palette.showIndex();

    //add to label to show tileset names
    col = 0;
    for(let tileset of this._map.tilesets) {
      let t = palette.getTileAt(col, palette.rows-1);
      let label = this.scene.add.text(t.getLeft() - palette.x, t.getBottom() - palette.y, tileset.name, palette.style);
      palette.labels.add(label);
      col += tileset.columns;
    }

    //create button to hide palette
    palette.style.fontSize = 14;
    palette.button = this.scene.add.text(x, y - 16, "Hide Palette", palette.style);
    palette.button.alpha = 0.7
    palette.button.setBackgroundColor("#000");
    palette.button.setInteractive();
    palette.button.on("pointerdown", ()=> {
      palette.visible = !palette.visible;
      palette.labels.visible = palette.visible;
      palette.grid.visible = palette.visible;
      if (palette.visible) {
        palette.button.setText("Hide Palette");
      }
      else {
        palette.button.setText("Show Palette");
      }
    });

    //make palette draggable    
    this.scene.input.setDraggable(palette);
    palette.on('drag', function (pointer, dragX, dragY) {
      palette.setPosition(dragX, dragY);
      palette.grid.setPosition(dragX, dragY);
      palette.button.setPosition(dragX , dragY - 16);
    });
    
    palette.setScale(scale);
    palette.grid = grid.setScale(scale);
    palette.labels.setScale(scale);
    
    palette.depth = 200;
    palette.grid.depth = 199
    palette.button.depth = 201;
    palette.labels.depth = 201;
    this._palette = palette;
    return palette;
  }
}

Phaser.Tilemaps.Formats.Google = 825;

class GoogleSheet extends Phaser.Loader.File {

  constructor (loader, key, url, xhrSettings)  {
    
      var extension = 'txt';

      if (Phaser.Utils.Objects.IsPlainObject(key))
      {
          var config = key;

          key = Phaser.Utils.Objects.GetFastValue(config, 'key');
          url = Phaser.Utils.Objects.GetFastValue(config, 'url');
          xhrSettings = Phaser.Utils.Objects.GetFastValue(config, 'xhrSettings');
          extension = Phaser.Utils.Objects.GetFastValue(config, 'extension', extension);
      }

      var fileConfig = {
          type: 'googleSheet',
          cache: loader.cacheManager.tilemap,
          extension: extension,
          responseType: 'txt',
          key: key,
          url: url,
          xhrSettings: xhrSettings
      };

      super(loader, fileConfig);

      this.tilemapFormat = Phaser.Tilemaps.Formats.Google;
  }

  onProcess() {
    this.state = Phaser.Loader.FILE_PROCESSING;
    this.data = this.xhrLoader.responseText;
    this.onProcessComplete();
  }

  addToCache() {
    this.data = this.data.match(/<tbody>(.*)<\/tbody>/)[1]
    this.data = this.data.match(/<tr.*?<\/th>(.*?)<\/tr>/g)
    for(var [i, row] of this.data.entries()) {
      let values = row.match(/<td.*?>(.*?)<\/td>/g)
      this.data[i] = values;
      for(var [j, value] of values.entries()) {
        var x = value.match(/<td.*?>(.*?)<\/td>/)[1];
        values[j] = (x === '') ? undefined : x * 1;  
      }
    }
    // Remove undefined cells at the end of each row and column.
    for (var row = this.data.length - 1; row >= 0; row--) {
      var r = this.data[row];
      for (var col = r.length - 1; col >= 0; col--) {
        if(r[col] === undefined) {
          this.data[row].pop();
        }
        else {
          continue;
        }
      }
      if (r.length === 0) {
        this.data.pop();
      }
    }

    var tiledata = { format: this.tilemapFormat, data: this.data };
    this.cache.add(this.key, tiledata);
    this.pendingDestroy(tiledata);
  }
}


Phaser.Loader.FileTypesManager.register('googleSheet', function (key, url, xhrSettings)
{
  if (Array.isArray(key))
  {
    for (var i = 0; i < key.length; i++)
    {
      //  If it's an array it has to be an array of Objects, so we get everything out of the 'key' object
      this.addFile(new GoogleSheet(this, key[i]));
    }
  }
  else
  {
    this.addFile(new GoogleSheet(this, key, url, xhrSettings));
  }

  return this;
});

