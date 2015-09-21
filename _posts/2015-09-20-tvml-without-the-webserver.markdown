---
layout: post
title: "TVML Without the Web"
heading: "Load TVML directly from the Application Bundle"
date: "2015-09-20"
categories: objective-c tvml
---
[Like it or not][bpxl-craft], TVML is here. Apple has decided that in order to provide consistency across their new tvOS, they needed a new UI framework, one with templates, javascript, and XML. Apple also decided to document the whole thing to lead you to believe that you need a web server running in order to serve up your javascript and XML. You do not.

{% highlight objective-c %}
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
   // Initialize the window and create our application context
   self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
   TVApplicationControllerContext *tvAppContext = [[TVApplicationControllerContext alloc] init];

   // Set us up the main javascript file, and our root path
   tvAppContext.javaScriptApplicationURL = [[NSBundle mainBundle] URLForResource:@"application" withExtension:@"js" subdirectory:@"client"];
   self.rootURL = [tvAppContext.javaScriptApplicationURL URLByDeletingLastPathComponent];

   // Set up our options
   NSMutableDictionary *dict = [launchOptions mutableCopy];
   if (!dict) dict = [[NSMutableDictionary alloc] initWithCapacity:1];
   [dict setObject:[self.rootURL absoluteString] forKey:@"BASEURL"];
   tvAppContext.launchOptions = dict;

   // Initialize the application controller
   self.tvAppController = [[TVApplicationController alloc] initWithContext:tvAppContext window:self.window delegate:self];

   return YES;
}
{% endhighlight %}

In order to serve up local files we just need to modify our application delegate and hand a `file:///` url over to the `TVApplicationControllerContext`. Additionally, we set up the `launchOptions` with a `BASEURL` key that we can use in javascript to find the rest of our files that we need to load.

In this particular example I put all of my TVML files into a directory called client, and included it into the Xcode project by folder reference. Xcode then copies over my client folder into the final application bundle, and I can serve the files right up without an external web server.

To complete a prototype let us take a look at the javascript and TVML required to spin up a simple app.

{% highlight js %}
App.onLaunch = function(options) {
   evaluateScripts([`${options.BASEURL}templates/hello-world.xml.js`], function(success) {
      if (!success) { console.log('Error loading hello-world.xml.js'); return; }

      var resource = Template.call(this);
      var parser = new DOMParser();
      var doc = parser.parseFromString(resource, "application/xml");
      navigationDocument.pushDocument(doc);
   });
}

App.onExit = function() {
}
{% endhighlight %}

Here we use our `BASEURL` that was injected into the javascript context by our application delegate code above, to find our `hello-world.xml.js` template. When we start up our tvOS application the `App.onLaunch` callback fires and loads up the template asynchronously. Once, the code has loaded, our globals from the template are available and we call the `Template` function to get the TVML code out, parse it into a DOM object, and attach it to the TVML DOM.

The TVML template stored in `hello-world.xml.js` is based on the [alert template][alert-template] provided by Apple and looks like so.

{% highlight js %}
var Template = function() { return `<?xml version="1.0" encoding="UTF-8" ?>
   <document>
      <alertTemplate>
         <title>Hello World Example</title>
         <description>This is the Hello World description</description>
         <button>
            <text>Push It</text>
         </button>
         <text>Hint: Push it real good</text>
      </alertTemplate>
   </document>`
}
{% endhighlight %}

Nothing too fancy, just some XML shoved into a string, returned by a function. Perfect, now go build something interesting.

[alert-template]: https://developer.apple.com/library/prerelease/tvos/documentation/LanguagesUtilities/Conceptual/ATV_Template_Guide/TextboxTemplate.html#//apple_ref/doc/uid/TP40015064-CH2-SW8
[bpxl-craft]: https://medium.com/bpxl-craft/apple-tv-a-world-without-webkit-5c428a64a6dd
