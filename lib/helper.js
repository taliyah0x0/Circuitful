// ===== FOUNDATION PHASER HELPER FUNCTIONS v1.0.7=====
/*
modified:  6/3/2020 -lyoung
  -drag and drop.
modified:  5/29/2020 -lyoung
  -Re-did platform controls.
modified:  5/29/2020 -lyoung
  -Re-did platform controls.
modified:  5/25/2020 -lyoung
  -added the addHtml function
modified:  5/23/2020 -lyoung
  Standardizing all checks to be checkFunction(object)
    deprecate object.wasClicked(), key.isDown, 
    all checks are down on the object
modified:  5/22/2020 -lyoung
  -added timer that does not use event handling
  -whenClicked is deprecated in favor of enableClick and wasClicked to avoid event handlers
  drawGrid added to show students the coordinate system
modified:  5/20/2020 -lyoung
  -fixed intersects to return false in objects are inactive
  -add removeObject helper and clean() to remove obj from arrays
*/
function Clone(object) {
  let scene = object.scene;
  let clone = Phaser.Utils.Objects.Clone(object);
  scene.sys.displayList.add(clone);
  if (clone.preUpdate)
  {
    scene.sys.updateList.add(clone);
  }
  return clone;
    //return this.add.sprite(0, 0, object);
};
// combine how sprite sheets and tile sheets work


function log(value) {
	console.log(typeof value + ": " + value);
}

function camelize(str) {
	str = str.split(/\s+/);
	str.forEach((s, i) => str[i] = (i == 0)? s.toLowerCase() : capitalize(s))
	return str.join('');
}

// capitalize the first letter
function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hasQuotes(s) {
  if (typeof s !== 'string') return false;
  if (!s.startsWith("\"") && !s.startsWith("\"")) {
    if (!s.startsWith("\'") && !s.startsWith("\'")) {
      return false;
    }
  }
  return true;
}

//Remove whiteSpaces in s1 and s2 then compares
function cleanCompare(s1, s2) {
  if (typeof s1 !== 'string') return false;
  if (typeof s2 !== 'string') return false;
  return s1.replace(/\s/g, '') == s2.replace(/\s/g, '');
}

//Remove whiteSpaces in s1 and s2 then compares
function cleanContains(s1, s2) {
  if (typeof s1 !== 'string') return false;
  if (typeof s2 !== 'string') return false;
  return s1.replace(/\s/g, '').includes(s2.replace(/\s/g, ''));
}
//=========================================
//             COLOR FUNCTIONS
//=========================================


function editStyle(name, value, text) {
  return `<span style="${name}: ${value};">${text}</span>`;
}

function getHexColor(pre, number) {
  var hex = pre + ('000000' + ((number) >>> 0).toString(16)).slice(-6).toUpperCase();
  return hex;
}

function componentToHex(c) {
  var hex = c.toString(16).toUpperCase();
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(str, r, g, b) {
  return str + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

//=========================================
//             MATH FUNCTIONS
//=========================================
function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function map(value1, min1, max1, min2, max2) {
  return (value1 - min1) * (max2 - min2) / (max1 - min1) + min2;
}

function shuffle(array) {
  return Phaser.Utils.Array.Shuffle(array);
};

function sin(degrees) {
  return Math.sin(degrees * Math.PI / 180);
};

function cos(degrees) {
  return Math.cos(degrees * Math.PI / 180);
};

function round1(value) {
  return Math.round(value * 10) / 10;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function round3(value) {
  return Math.round(value * 1000) / 1000;
}


//=========================================
//        COLLISION FUNCTIONS
//=========================================
//checks if two Phaser objects intersect


function intersects(obj, otherObj, ratio) {
  if (!obj || !otherObj) {
    return false;
  }
  if (!ratio) {
    ratio = 1;
  }
  if (ratio < 0.001 || !obj.active || (!otherObj.active && !otherObj.tilemap)) {
    return false;
  }
  // if (!obj.bbox) {
  //   obj.bbox = obj.scene.add.rectangle(0, 0, 40, 40);
  //   obj.bbox.depth = 1000;
  // }
  // if (!otherObj.bbox) {
  //   otherObj.bbox = obj.scene.add.rectangle(0, 0, 40, 40);
  //   otherObj.bbox.depth = 1000;
  // }

  let a = obj.getBounds();
  let b = otherObj.getBounds();
  if (ratio != 1) {
    a.width *= ratio;
    a.height *= ratio;
    a.centerX = obj.x;
    a.centerY = obj.y;
    // obj.bbox.setPosition(obj.x, obj.y).setDisplaySize(a.width, a.height);
    // obj.bbox.setStrokeStyle(3, 0xFF00FF ,1);

    b.width *= ratio;
    b.height *= ratio;
    b.centerX = otherObj.x;
    b.centerY = otherObj.y;
    // otherObj.bbox.setPosition(otherObj.x, otherObj.y).setDisplaySize(b.width, b.height);
    // otherObj.bbox.setStrokeStyle(3, 0x00FF00 ,1);
  }
  return Phaser.Geom.Intersects.RectangleToRectangle(a, b);
};



function removeObject(object, array) {
  for (var i = array.length - 1; i >= 0; --i) {
    if (array[i] === object) {
      array.splice(i, 1);
    }
  }
};

function clean(array) {
  for (var i = array.length - 1; i >= 0; --i) {
    if (!array[i] || array[i].active === false) {
      array.splice(i, 1);
    }
  }
  return array;
};

function getCollision(obj, array, ratio) {
  if (!obj || !array) {
    return null;
  }
  for (let i = 0; i < array.length; i++) {
    let otherObj = array[i];

    if (otherObj) {
      if (intersects(obj, otherObj, ratio)) {
        return otherObj;
      }
    }
  }
  return null;
}

//=========================================
//        CONTROL FUNCTIONS
//=========================================

// RETURNS TRUE IF X OR Y ARE OUT OF BOUNDS
function checkBounds(obj, bounds) {
  let outside = false;
  if (obj.x <= bounds.xMin) {
    obj.x = bounds.xMin;
    outside = true;
  }
  else if (obj.x >= bounds.xMax) {
    obj.x = bounds.xMax;
    outside = true;
  }
  if (obj.y <= bounds.yMin) {
    obj.y = bounds.yMin;
    outside = true;
  }
  else if (obj.y >= bounds.yMax) {
    obj.y = bounds.yMax;
    outside = true;
  }
  return outside;
}


function setXYSpeed(obj) {
  obj.xSpeed = obj.speed * cos(obj.angle);
  obj.ySpeed = obj.speed * sin(obj.angle);
};



function enablePlatformControls(obj, speed, power, gravity) {
  obj.jumpPower = power;
  obj.gravity = gravity;
  obj.ySpeed = 0;
  obj.xSpeed = speed;
  obj.landed = false;

  obj.jump = function () {
    if (obj.ySpeed == 0 && obj.landed == true) {
      obj.ySpeed = obj.jumpPower;
      obj.y -= obj.ySpeed;
      obj.landed = false;
    }
  };

  obj.fall = function () {
    obj.y -= obj.ySpeed;
    obj.ySpeed -= obj.gravity;
  };

  obj.land = function (platform) {

    if (obj.ySpeed <= 0) {            //LANDING OBJECT (Falling)
      var offset = platform.height * (platform.originY) + obj.height * (1 - obj.originY);
      obj.y = platform.y - offset;    //PUSH ABOVE PLATFORM
      obj.ySpeed = 0;
      obj.landed = true;
    }
  };

  obj.moveLeft = function () {
    obj.prevX = obj.x;
    obj.prevY = obj.y;
    obj.x -= obj.xSpeed;

  }
  obj.moveRight = function () {
    obj.prevX = obj.x;
    obj.prevY = obj.y;
    obj.x += obj.xSpeed;
  }
}


function checkPlatformCollisions(obj, platforms) {
  obj.fall();

  var platform = null;
  if (obj.ySpeed > 0) {
    checkBottomBumpers(obj, platforms);
  }
  checkLRBumpers(obj, platforms);

  platform = getCollision(obj, platforms);

  if (platform) {
    obj.land(platform);
  }
  return platform;
}

function checkBottomBumpers(obj, platforms) {
  for (var i = 0; i < platforms.length; i++) {
    var p = platforms[i];
    //if this platform does not have bumpers then create them
    if (!p.bottom) {
      var buffer = obj.xSpeed * 2;
      var y = p.y + p.height * (1 - p.originY);
      var x = p.x + buffer * (0.5 - p.originX)
      p.bottom = p.scene.add.rectangle(x, y, p.width - buffer, 1, 0x0000ff);
      p.bottom.setOrigin(p.originX, p.originY);
      p.bottom.visible = false;
    }
    if (intersects(obj, p.bottom)) {
      console.log("bottom");
      var offset = p.height * (1 - p.originY) + obj.height * (obj.originY);
      obj.y = p.y + offset + 0.1; //PUSH BELOW PLATFORM
      obj.ySpeed *= -0.2;
    }
  }
}

function checkLRBumpers(obj, platforms) {
  for (var i = 0; i < platforms.length; i++) {
    var p = platforms[i];
    //if this platform does not have bumpers then create them
    if (!p.left || !p.right) {

      //RIGHT BUMPER
      var x = p.x - p.width * p.originX;
      var y = p.y + 2 * (0.5 - p.originY);
      p.left = p.scene.add.rectangle(x, y, 1, p.height - 2, 0x00ff00);
      p.left.setOrigin(p.originX, p.originY);
      p.left.visible = false;

      //RIGHT BUMPER
      x = p.x + p.width * (1 - p.originX);
      p.right = p.scene.add.rectangle(x, y, 1, p.height - 2, 0xff0000);
      p.right.setOrigin(p.originX, p.originY);
      p.right.visible = false;
    }
    if (intersects(obj, p.left)) {
      obj.moveLeft();
    }
    if (intersects(obj, p.right)) {
      obj.moveRight();
    }
  }
}





