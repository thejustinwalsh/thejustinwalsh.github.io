(function(window, containerId, canvasId) {
  var container = document.getElementById(containerId);
  var canvas = document.getElementById(canvasId);
  var context = canvas.getContext("2d");

  var xCoord = 1, yCoord = 0, theta = 0;
  var origin = { x: canvas.width / 2, y: canvas.height / 2 };
  var radius = origin.y * 0.75;       // circle radius

  // Create our menu items
  var menuItemCount = 12;
  var menuItems = {};
  for (var i = 0; i < menuItemCount; ++i) {
    var angle = ((2 * Math.PI) / menuItemCount);
    menuItems[i] = {
      angle: angle * i,
      title: "Item " + i,
      color: hsvToRgb((360 / menuItemCount) * i, 33, 70),
      pivot: (angle * i) + (angle / 2)
    };
  }

  function render() {
    canvas.width = container.offsetWidth;
    origin.x = canvas.width/2;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    var stride = 30;
    var lineWidth = 1;
    var halfLineWidth = lineWidth / 2;
    var padding = origin.x % stride;
    for (var x = stride; x <= canvas.width - padding - stride; x += stride) {
        context.moveTo(padding + x - halfLineWidth, 0);
        context.lineTo(padding + x - halfLineWidth, canvas.height);
    }
    for (var y = stride; y <= canvas.height - stride; y += stride) {
        context.moveTo(padding + 0, y - halfLineWidth);
        context.lineTo(canvas.width - padding, y - halfLineWidth);
    }
    context.lineWidth = lineWidth;
    context.strokeStyle = "#2c2c30";
    context.stroke();

    // Menu Items
    var pivot = 0;
    var angle = ((2 * Math.PI) / menuItemCount);
    var angleDeg = (angle * (180 / Math.PI) + 720) % 360;
    var itemData = null;
    for (var i = 0; i < menuItemCount; ++i) {
      var item = menuItems[i];

      var x = origin.x + radius * Math.cos(item.pivot);
      var y = origin.y + radius * Math.sin(item.pivot);

      padding = (angle / 2);
      padding = padding * (180 / Math.PI);
      padding = (padding + 720) % 360;
      padding = padding;

      pivot = item.pivot * (180 / Math.PI);
      pivot = 360 - (pivot + 720) % 360;

      var wave = 0;
      var waveMax = 15;
      if (theta >= pivot - padding && theta <= pivot + padding) {
        wave = Math.sin(-(pivot - padding - theta) / (angleDeg / Math.PI)) * waveMax;
        itemData = item;
      }
      context.beginPath();
      context.arc(x, y, 20 + wave, 0, 2 * Math.PI);
      context.fillStyle = item.color;
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = "#000000";
      context.stroke();
    }

    // Update display
    var x = xCoord - origin.x; var y = yCoord - origin.y;
    context.font = "10pt sans-serif";
    context.fillStyle = "#f2f0ec";
    context.fillText("x = " + Math.floor(x), 5, 15);
    context.fillText("y = " + Math.floor(y), 5, 30);
    context.fillText("theta = " + Math.floor(theta)+"°", 5, 47);
    context.fillText("item = " + itemData.title, 5, 62);
    context.fillText("gamepad = " + (gamepadInterval > 0 ? "true" : "false"), 5, 79);

    window.requestAnimationFrame(render);
  }

  function setInputCoords(x, y) {
    var xLocal = x - origin.x;
    var yLocal = y - origin.y;

    theta = Math.atan2(-yLocal, xLocal);
    theta = theta * (180 / Math.PI);
    theta = (theta + 720) % 360;

    xCoord = x; yCoord = y;
  }

  // Get theta from the mouse
  canvas.addEventListener('mousemove', function(evt) {
    var rect = canvas.getBoundingClientRect();
    var x = (evt.clientX - rect.left);
    var y = (evt.clientY - rect.top);

    setInputCoords(x, y);
  });

  // Get theta from the touch
  canvas.addEventListener('touchmove', function(evt) {
    if (event.touches.length == 0) return;

    var touch = event.targetTouches[0];
    var rect = canvas.getBoundingClientRect();
    var x = (touch.clientX - rect.left);
    var y = (touch.clientY - rect.top);

    setInputCoords(x, y);
    evt.preventDefault();
  });

  // Gamepad
  var gamepadInterval = -1;
  window.addEventListener("gamepadconnected", function(event) {
    gamepadInterval = window.setInterval(function() {
      var gamepads = navigator.getGamepads();
      if (gamepads) {
        for (i = 0; i < gamepads.length; ++i) {
          if (gamepads[i] && gamepads[i].connected) {
            if (gamepads[i].axes.length > 1) {
              var x = gamepads[i].axes[0];
              var y = gamepads[i].axes[1];
              if (x * x + y * y > Math.pow(0.1, 2)) {
                setInputCoords(x + origin.x, y + origin.y);
                break;
              }
            }
          }
        }
      }
    }, 33);
  });

  window.addEventListener("gamepaddisconnected", function(event) {
    var gamepads = navigator.getGamepads();

    var stillConnected = false;
    if (gamepads) {
      for (i = 0; i < gamepads.length; ++i) {
        if (gamepads[i] && gamepads[i].connected) {
          stillConnected = true;
        }
      }
    }

    if (!stillConnected) {
      window.clearInterval(gamepadInterval);
      gamepadInterval = -1;
    }
  });


  // HSV to RGB modified from https://bgrins.github.io/TinyColor/docs/tinycolor.html
  function hsvToRgb(h, s, v) {
    h = h / 60;
    s = s / 100;
    v = v / 100;
    var i = Math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

        return "#" +
              ("0" + Math.round(r*255).toString(16)).slice(-2) +
              ("0" + Math.round(g*255).toString(16)).slice(-2) +
              ("0" + Math.round(b*255).toString(16)).slice(-2);
  }
  render();
})(window, "circular-menu-container", "circular-menu");
