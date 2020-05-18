(function(window, containerId, canvasId) {
  var container = document.getElementById(containerId);
  var canvas = document.getElementById(canvasId);
  var context = canvas.getContext("2d");

  var xCoord = 1, yCoord = 0, theta = 0;
  var origin = { x: canvas.width / 2, y: canvas.height / 2 };
  var radius = origin.y * 0.75;       // circle radius

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
    context.strokeStyle = "#ECECEC";
    context.stroke();

    // Clamped line from origin
    var x = xCoord - origin.x;
    var y = yCoord - origin.y;
    var length = Math.sqrt((x * x) + (y * y));
    x = origin.x + ((x / length) * radius);
    y = origin.y + ((y / length) * radius);
    context.beginPath();
    context.moveTo(origin.x, origin.y);
    context.lineTo(x, y);
    context.lineWidth = 0.75;
    context.strokeStyle = "#FF0000";
    context.stroke();

    // Circle edge
    context.beginPath();
    context.arc(origin.x, origin.y, radius, 0, 2 * Math.PI);
    context.lineWidth = 2;
    context.strokeStyle = "#000000";
    context.stroke();

    // Circle origin
    context.beginPath();
    context.arc(origin.x, origin.y, 2, 0, 2 * Math.PI);
    context.fillStyle = "#000000";
    context.fill();

    // Update display
    var x = xCoord - origin.x; var y = yCoord - origin.y;
    context.font = "10pt sans-serif";
    context.fillStyle = "#333333";
    context.fillText("x = " + Math.floor(x), 5, 15);
    context.fillText("y = " + Math.floor(y), 5, 30);
    context.fillText("theta = " + Math.floor(theta)+"°", 5, 47);

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

  render();
})(window, "atan2-demo-container", "atan2-demo");
