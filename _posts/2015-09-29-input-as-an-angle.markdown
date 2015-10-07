---
layout: post
title: "Input as an Angle"
heading: "How four-quadrant inverse tangents become your new bestie"
date: "2015-09-29"
categories: maths
tags: draft
---
Hey. You. Developer who wants to make some kind of circular menu thing. I offer you a warning; don't you dare use a dot product to implement your menu.

I ran across an extremely buggy circular menu not too long ago and was tasked with fixing it. I knew immediately when I rotated my analog joystick around in a circle and watched the menu give up on life that I must be dealing with code who knows nothing about circles. I knew in my heart of hearts that this code used a dot product to get an angle then did all kinds of weird `if` checks to make that broken angle work. I knew that this code was not best friends with [atan2][atan2].

This code, however, is down.

<div class="flex-row">
<div id="atan2-demo-container" class="flex-box-half" style="position: relative;">
<canvas id="atan2-demo" width="300" height="300" style="display: inline-block;"></canvas>
<script src="/scripts/2015-09-29-input-as-an-angle/atan2-demo.js"></script>
</div>
<div class="flex-box-half">
{% highlight javascript %}
function angleFromInput(x, y) {
  var a = 0.0;
  a = Math.atan2(-y, x);    // Flip the y-axis (+y is down)
  a = a * (180 / Math.PI);  // Convert to degrees
  a = (a + 720) % 360;      // Shift degree range (0 - 360)
  return a;    
}
{% endhighlight %}
</div>
</div>

So simple it hurts. All you have to do is take a relative input coordinate pair and hand it over to your new best friend atan2. You can then convert the radian output of atan2 to degrees, and make happy little circular menus. Let's break down the [interactive demo graph above][atan2-demo.js].

{% highlight javascript %}
canvas.addEventListener('mousemove', function(evt) {
  var rect = canvas.getBoundingClientRect();
  var x = (evt.clientX - rect.left);
  var y = (evt.clientY - rect.top);
  setInputCoords(x, y);
});
{% endhighlight %}

This bit of code has nothing to do with atan2. The snippet grabs the `x, y` location of the mouse and converts it to local space, then hands it off to the workhorse of the demo.

{% highlight javascript %}
function setInputCoords(x, y) {
  var xLocal = x - origin.x;
  var yLocal = y - origin.y;

  theta = Math.atan2(-yLocal, xLocal);
  theta = theta * (180 / Math.PI);
  theta = (theta + 720) % 360;

  xCoord = x; yCoord = y;
}
{% endhighlight %}

Here is where all the math of our new friend atan2 goes down. First we take the coordinates and subtract the origin in order to shift our input to having an origin of `0, 0`. Next up, we pass the coordinates to atan2 as well as flip the y axis. Atan2 expects our up axis to be positive y, and our canvas coordinates we are given have positive y being down. Finally, we convert the output of atan2 from radians to degrees, and ensure our output degree is between 0 and 360. Atan2 is going to give us back an angle that is between -180 and 180 degrees, so the last bit of code shifts that range.

You are now an expert at using atan2 to turn input into degrees. However, even experts need more examples, so lets do what we set out to do from the start and turn this knowledge into [a circular menu][circular-menu.js].

<div id="circular-menu-container" class="flex-box-half" style="position: relative;">
<canvas id="circular-menu" width="300" height="300" style="display: inline-block;"></canvas>
<script src="/scripts/2015-09-29-input-as-an-angle/circular-menu.js"></script>
</div>


[atan2]: https://en.wikipedia.org/wiki/Atan2
[atan2-demo.js]: /scripts/2015-09-29-input-as-an-angle/atan2-demo.js
[circular-menu.js]: /scripts/2015-09-29-input-as-an-angle/circular-menu.js
