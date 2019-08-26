// Copyright 2019 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

window.chrome = window.chrome || {};

/**
 * Mock Event.
 *
 * @constructor
 */
function MockEvent() {
  /**
   * @private {!Array<function(...*)>}
   * @const
   */
  this.listeners_ = [];
}

/** @param {function(...*)} listener */
MockEvent.prototype.addListener = function(listener) {
  this.listeners_.push(listener);
};

/**
 * Mock for chrome.terminalPrivate.
 * https://cs.chromium.org/chromium/src/chrome/common/extensions/api/terminal_private.json.
 *
 * @private
 * @constructor
 */
function MockTerminalPrivate() {
  /**
   * @private {!Object<string, !Array<function(...*)>>}
   * @const
   */
  this.observers_ = {};
  this.onProcessOutput = new MockEvent();
}

/**
 * Controls the currently installed MockTerminalPrivate.
 *
 * @private
 * @constructor
 */
MockTerminalPrivate.Controller = function() {
  /**
   * @private {*}
   * @const
   */
  this.origTerminalPrivate_ = chrome.terminalPrivate;
  chrome.terminalPrivate = this.instance_ = new MockTerminalPrivate();
};

/**
 * Callback will be invoked when chrome.terminalPrivate.<fnName> is called.
 *
 * @param {string} fnName Name of the function to observe.
 * @param {function(...*)} callback Invoked with arguments from function.
 */
MockTerminalPrivate.Controller.prototype.addObserver = function(
    fnName, callback) {
  this.instance_.observers_[fnName] = this.instance_.observers_[fnName] || [];
  this.instance_.observers_[fnName].push(callback);
};

/**
 * Stop the mock.
 */
MockTerminalPrivate.Controller.prototype.stop = function() {
  chrome.terminalPrivate = this.origTerminalPrivate_;
};

/**
 * Start the mock and install it at chrome.terminalPrivate.
 *
 * @return {!MockTerminalPrivate.Controller}
 */
MockTerminalPrivate.start = function() {
  return new MockTerminalPrivate.Controller();
};

/**
 * Notify all observers that a chrome.terminalPrivate function has been called.
 *
 * @param {string} fnName Name of the function called.
 * @param {!Object=} args arguments function was called with.
 * @private
 */
MockTerminalPrivate.prototype.notifyObservers_ = function(fnName, args) {
  for (const fn of this.observers_[fnName] || []) {
    fn.apply(null, args);
  }
};

/**
 * Starts new process.
 *
 * @param {string} processName Name of the process to open. May be 'crosh' or
 *     'vmshell'.
 * @param {!Array<string>} args Command line arguments to pass to the process.
 * @param {function(string)} callback Returns id of the launched process. If no
 *     process was launched returns -1.
 */
MockTerminalPrivate.prototype.openTerminalProcess = function(
    processName, args, callback) {
  this.notifyObservers_('openTerminalProcess', arguments);
  setTimeout(callback.bind(null, 'test-id'), 0);
};

/**
 * Closes previously opened process.
 *
 * @param {string} id Unique id of the process we want to close.
 * @param {function(boolean)} callback Function that gets called when close
 *     operation is started for the process. Returns success of the function.
 */
MockTerminalPrivate.prototype.closeTerminalProcess = function(id, callback) {
  this.notifyObservers_('closeTerminalProcess', arguments);
  setTimeout(callback.bind(null, true), 0);
};

/**
 * Sends input that will be routed to stdin of the process with the specified
 * id.
 *
 * @param {string} id The id of the process to which we want to send input.
 * @param {string} input Input we are sending to the process.
 * @param {function(boolean)} callback Callback that will be called when
 *     sendInput method ends. Returns success.
 */
MockTerminalPrivate.prototype.sendInput = function(id, input, callback) {
  this.notifyObservers_('sendInput', arguments);
  setTimeout(callback.bind(null, true), 0);
};

/**
 * Notify the process with the id id that terminal window size has changed.
 *
 * @param {string} id The id of the process.
 * @param {number} width New window width (as column count).
 * @param {number} height New window height (as row count).
 * @param {function(boolean)} callback Callback that will be called when
 *     onTerminalResize method ends. Returns success.
 */
MockTerminalPrivate.prototype.onTerminalResize = function(
    id, width, height, callback) {
  this.notifyObservers_('onTerminalResize', arguments);
  setTimeout(callback.bind(null, true), 0);
};

/**
 * Called from |onProcessOutput| when the event is dispatched to terminal
 * extension. Observing the terminal process output will be paused after
 * |onProcessOutput| is dispatched until this method is called.
 *
 * @param {number} tabId Tab ID from |onProcessOutput| event.
 * @param {string} id The id of the process to which |onProcessOutput| was
 *     dispatched.
 */
MockTerminalPrivate.prototype.ackOutput = function(tabId, id) {
  this.notifyObservers_('ackOutput', arguments);
};
