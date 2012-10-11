// Copyright 2012 Google Inc. All Rights Reserved.

/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Global Variables
var _gaq = _gaq || [];
var DEBUG = true;


function loadGA() {

  var gaURL = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js'; 
  timeJsLoad("GA", gaURL, "google-analytics.com", true);

  /**
   * Below is a traditional way of loading Google Analytics. However, here we
   * are timing loading GA library and recording results in GA
   * 
   * var ga = document.createElement('script'); 
   * ga.type = 'text/javascript';
   * ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js'; 
   * ga.async = true; 
   * var s = document.getElementsByTagName('script')[0]; 
   * s.parentNode.insertBefore(ga, s);
   */
}

function initGA() {
  _gaq.push([ '_setAccount', 'UA-35290821-1' ]);
  _gaq.push([ '_setSampleRate', 99 ]);
  _gaq.push([ '_setSiteSpeedSampleRate', 100 ]);
  _gaq.push([ '_trackPageview' ]);
  /*
   * _gaq.push([ '_trackEvent', 'loadtime', location.href, , parseInt(new Date() -
   * loadtimer) ]); _gaq.push([ '_trackEvent', 'time-to-render', location.href, ,
   * parseInt(rendertimer - loadtimer) ]); _gaq.push([ '_setCustomVar', 1,
   * 'loadtime', parseInt(new Date() - loadtimer), 3 ]); _gaq.push([
   * '_setCustomVar', 2, 'rendertime', parseInt(rendertimer - loadtimer), 3 ]);
   */
}


/**
 * Asynchronously loads a JavaScript resources by creating a DOM Script element
 * and appending it to the page. The time it takes to load the script is
 * tracking using a TrackTiming object. Just before the script element is added
 * to the page, the TrackTiming timer is started. The entire TrackTiming object
 * is then set as a property on the script object. And finally the script
 * element is added to the DOM to force the browser to load the script resource.
 * The time it takes to load the script is tracked and reported to GA.
 * 
 * @param {String}
 *          name The name of a JavaScript resource to load (i.e. jQuery,
 *          jolokia, etc.)
 * @param {String}
 *          url The URL of a JavaScript resource to load.
 * @param {String}
 *          location a short description of where this library is being loaded
 *          (i.e. "Google CDN", etc.)
 * @param {Boolean}
 *          async a flag indicating whether the library should be loaded
 *          asynchronously
 */
function timeJsLoad(name, url, location, async) {

  var category = "JavaScript Library Loading";
//  loadJs(url, loadJsLibCallback, trackTiming, async);
  
  var js = document.createElement('script');
  js.type = 'text/javascript';
  js.src = url;
  js.async = async;
  js.onload = jsLoadCallback;
  var firstScriptTag = document.getElementsByTagName('script')[0];

  var trackTiming = new TrackTiming(category, name, location).debug();
  js.time = trackTiming.startTime();

  firstScriptTag.parentNode.insertBefore(js, firstScriptTag);

}

function jsLoadCallback(event) {
  var e = event || window.event;
  var target = e.target ? e.target : e.srcElement;

  target.time.endTime().send();

  // Resource has loaded. Print out console log message
  log("Loaded JS resource: " + target.time.category + "::" + target.time.variable + "::" + target.time.label
      + "::" + target.time.elapsedTime);
  log("Loaded JS resource", target.time);

}

/**
 * Makes a GET request to the URL using the XMLHttpRequest object. A TrackTiming
 * object is used to capture the start time right before the request is made.
 * The trackTime object is set as a property of the XMLHttpRequest object so
 * that it can be retrieved inside the callback. Finally this method assumes
 * that the callback will end the timer and send data to Google Analytics.
 * 
 * @param {String}
 *          url The URL to make make a GET request.
 * @param {Function}
 *          callback The callback function that will be executed everytime the
 *          readyState property of the XMLHttpRequest object changes.
 */
function timeXMLHttpRequest(name, url, location, callback) {
  
  var category = "XMLHttpRequest";
  var request = getXMLHttpRequest();
  if (request) {
    request.open('GET', url, true);
    request.callback = callback;
    request.onreadystatechange = xmlHttpRequestCallback;

    var trackTiming = new TrackTiming(category, name, location).debug();
    request.time = trackTiming.startTime();

    request.send();
  }
}

/**
 * Simple cross browser helper method to get the right XMLHttpRequst object for
 * older IE browsers. Since IE makes us jump through hoops, might as well use
 * Microsoft's example:
 * http://msdn.microsoft.com/en-us/library/ie/ms535874(v=vs.85).aspx
 */
function getXMLHttpRequest() {
  if (window.XMLHttpRequest) {
    return new window.XMLHttpRequest;
  } else {
    try {
      return new ActiveXObject("MSXML2.XMLHTTP.3.0");
    } catch (e) {
      return null;
    }
  }
}

function xmlHttpRequestCallback() {
  
  var e = event || window.event;
  var target = e.target ? e.target : e.srcElement;

  if (target.readyState == 4 && target.status == 200) {

      target.time.endTime().send();

      // Resource has loaded. Print out console log message
      log("Loaded JS resource: " + target.time.category + "::" + target.time.variable + "::" + target.time.label
          + "::" + target.time.elapsedTime);
      log("Executed XML HTTP Request", target.time);
  
      target.callback(target.responseText);
  }
}


/**
 * Utility function to add a random number as a query parameter to the url. This
 * assumes the URL doesn't have any existing query parameters or anchor tags.
 * 
 * @param {String}
 *          url The url to add cache busting to.
 */
function cacheBust(url) {
  return url + '?t=' + Math.round(Math.random() * 100000);
}

/**
 * Simple class to encapsulate all logic dealing witt tracking time in Google
 * Analytics. This constructor accepts all the time tracking string values.
 * Calling startTime begins the timer. Calling endTime ends the period of time
 * being tracked. Callin sendTime sends the data to Google Analytics.
 * 
 * @param {String}
 *          category The _trackTiming category.
 * @param {String}
 *          variable The _trackTiming variable.
 * @param {?String}
 *          label The optional _trackTiming label. If not set with a real value,
 *          the value of undefined is used.
 * @return {Object} This TrackTiming instance. Useful for chaining.
 * @constructor.
 */
function TrackTiming(category, variable, opt_label) {

  /**
   * Maximum time that can elapse for the tracker to send data to Google
   * Analytics. Set to 10 minutes in milliseconds.
   * 
   * @type {Number}
   */
  this.MAX_TIME = 10 * 60 * 1000;

  this.category = category;
  this.variable = variable;
  this.label = opt_label ? opt_label : undefined;
  this.startTime;
  this.elapsedTime;
  this.isDebug = false;
  return this;
}

/**
 * Starts the timer.
 * 
 * @return {Object} This TrackTiming instance. Useful for chaining.
 */
TrackTiming.prototype.startTime = function() {
  this.startTime = new Date().getTime();
  return this;
};

/**
 * Ends the timer and sets the elapsed time.
 * 
 * @return {Object} This TrackTiming instance. Useful for chaining.
 */
TrackTiming.prototype.endTime = function() {
  this.elapsedTime = new Date().getTime() - this.startTime;
  return this;
};

/**
 * Enables or disables the debug option. When set, this will override the
 * default sample rate to 100% and output each request to the console. When set
 * to false, will send the default sample rate configured by calling the
 * _setSampleRate tracking method.
 * 
 * @param {?Boolean}
 *          opt_enable Enables or disables debug mode. If not present, debug
 *          mode will be enabled.
 * @return {Object} This TrackTiming instance. Useful for chaining.
 */
TrackTiming.prototype.debug = function(opt_enable) {
  this.isDebug = opt_enable == undefined ? true : opt_enable;
  return this;
};

/**
 * Send data to Google Analytics witt the configured variable, action, elapsed
 * time and label. This function performs a check to ensure that the elapsed
 * time is greater than 0 and less than MAX_TIME. This check ensures no bad data
 * is sent if the browser client time is off. If debug has been enebled, then
 * the sample rate is overridden to 100% and all the tracking parameters are
 * outputted to the console.
 * 
 * @return {Object} This TrackTiming instance. Useful for chaining.
 */
TrackTiming.prototype.send = function() {
  if (0 < this.elapsedTime && this.elapsedTime < this.MAX_TIME) {

    var command = [ '_trackTiming', this.category, this.variable, this.elapsedTime, this.label ];

    if (this.isDebug) {
      // Override sample rate if debug is enabled.
      command.push(100);

      log(command);
    }

    window._gaq.push(command);
  }
  return this;
};


function logPageStats() {
  var pt = window.performance.timing;
  log("Redirection Time", pt.redirectEnd - pt.redirectStart);
  log("Domain Lookup Time", pt.domainLookupEnd - pt.domainLookupStart);
  log("Server Connection Time", pt.connectEnd - pt.connectStart);
  log("Server Response Time", pt.responseStart - pt.requestStart);
  log("Page Download Time", pt.responseEnd - pt.responseStart);
  log("Browser Time", pt.loadEventEnd - pt.responseEnd);
  log("Page Load Time", pt.loadEventEnd - pt.navigationStart);
}

function log(msg, value) {
  
  if (DEBUG && window.console && window.console.log) {
    console.log("" + msg + (value ? " : " + JSON.stringify(value) : ""));
  }
}
