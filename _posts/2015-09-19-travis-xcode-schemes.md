---
layout: post
heading: How to configure travis to generate your Xcode schemes
date: "2015-09-19 22:34 -0700"
categories: 
  - news
published: true
title: "Travis, Xcode & Schemes"
---


Have you ever wanted to generate your Xcode schemes for travis builds? Tired of checking in useless files that are generated for you by Xcode when run? Good. Me too.

On the [flair][flair] project I use [premake][premake] to generate my project files. As a part of my build process I run a script that executes premake to generate the Xcode project then hand it off to xctool to complete the build.

[xctool][xctool] and xcodebuild will refuse to build your project if your Xcode schemes are missing. The internet recomended that you check in your schemes so that travis will build your projects. The internet does not have a good enough solution. I do.

We are going to use the [xcodeproj][xcodeproj] ruby gem to generate our schemes as a part of our build process. The magic lies in a bit of configuration and a little helper script.

First, the configuration, in your `before_install:` collection of the `.travis.yml` file setup rvm, and install the xcodeproj gem:
{% highlight yml %}
before_install:
  - rvm use 2.1.2
  - gem install xcodeproj
{% endhighlight %}

Next, the script:
{% highlight bash %}
echo "
 require 'xcodeproj'
 project = Xcodeproj::Project.open '../flair.xcodeproj'
 project.recreate_user_schemes
 project.save
 project = Xcodeproj::Project.open '../tests.xcodeproj'
 project.recreate_user_schemes
 project.save
" | ruby
{% endhighlight %}

Add the above script and modify it to open each project you need to generate schemes for. In the [flair][flair] project I include this code snippet in the bash build script that is run from the `install:` scalar in the `.travis.yml` file.

[flair]: http://libflair.com
[premake]: https://premake.github.io/
[xctool]: https://github.com/facebook/xctool
[xcodeproj]: https://rubygems.org/gems/xcodeproj
