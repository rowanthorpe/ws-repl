/*
 ws-repl
  (c) 2017 Rowan Thorpe

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function wsrepl(customArgs) {

var defArgs = {
    widgetName: 'repl',
    serverName: '127.0.0.1',
    socketPrefix: '/ws-repl',
    socketProto: 'ws',
    bufferLines: 2000,
    replElName: 'output',
    inputElName: 'msg',
    replSendColour: 'black',
    replReplyColour: 'darkred',
    replOpenBgColour: '#9c9',
    replClosedBgColour: '#933',
    replCursor: '&#02502;',
    replMargin: '0.4em auto 0.4em 0.4em',
    replPadding: '0.4em',
    replHeight: 'calc(100vh / 4)',
    replWidth: '25%',
    replBorderWidth: '0.1em',
    replBorderColour: '#000',
    replBorderStyle: 'solid',
    replTextAlign: 'left',
    replOverflow: 'auto',
    inputMargin: '0px auto auto 0.4em',
    inputPadding: '0.2em',
    inputWidth: '25%',
    inputHeight: '2em'
};

var arg = Object.assign({}, defArgs, customArgs);

// constants

var splitBuf = [''];
var mainEl  = document.getElementById(arg.widgetName);
var hiddenEl = document.createElement('textarea');
var replEl = document.createElement('pre');
replEl.setAttribute('id', arg.replElName);
var inputEl = document.createElement('input');
inputEl.setAttribute('id', arg.inputElName);
inputEl.setAttribute('type', 'text');
inputEl.setAttribute('autofocus', 'autofocus');
inputEl.setAttribute('tabindex', '1');
var sty = document.createElement('style');
sty.setAttribute('rel', 'stylesheet');
sty.setAttribute('type', 'text/css');

// functions

function htmlEncode(str) {
    hiddenEl.innerHTML = str;
    return hiddenEl.innerHTML;
}

function htmlDecode(str) {
    hiddenEl.innerHTML = str;
    return hiddenEl.childNodes.length === 0 ? '' : hiddenEl.childNodes[0].nodeValue;
}

function nonGraphicalToPage(e) {
    if (e.keyCode === 8) { // backspace
        var len = splitBuf.length;
        splitBuf[len - 1] = htmlEncode(htmlDecode(splitBuf[len - 1]).slice(0, -1));
        replEl.innerHTML = splitBuf.join('\n') + arg.replCursor;
        replEl.scrollTop = 999999;
    }
}

function typeToPage(e) {
    if (e.keyCode === 13) { // enter
        splitBuf[splitBuf.length] = '';
        send();
        replEl.innerHTML = splitBuf.join('\n') + arg.replCursor;
        replEl.scrollTop = 999999;
        return false;
    } else {
        var len = splitBuf.length;
        splitBuf[len - 1] = htmlEncode(splitBuf[len - 1] + String.fromCharCode(e.keyCode));
        replEl.innerHTML = splitBuf.join('\n') + arg.replCursor;
    }
    replEl.scrollTop = 999999;
}

function replyToPage(str) {
    var len = splitBuf.length;
    splitBuf[len - 1] = '<span style="color:' + arg.replReplyColour + '">' + htmlEncode(str) + '</span>';
    splitBuf[len] = '';
    replEl.innerHTML = splitBuf.join('\n') + arg.replCursor;
    replEl.scrollTop = 999999;
}

function send() {
    ws.send(inputEl.value);
    inputEl.value = '';
    inputEl.focus();
}

// main

sty.innerHTML = '#' + arg.replElName + ' {\n margin: ' + arg.replMargin + ';\n padding: ' + arg.replPadding + ';\n height: ' + arg.replHeight + ';\n width: ' + arg.replWidth + ';\n color: ' + arg.replSendColour + ';\n background-color: ' + arg.replClosedBgColour + ';\n border-width: ' + arg.replBorderWidth + ';\n border-color: ' + arg.replBorderColour + ';\n border-style: ' + arg.replBorderStyle + ';\n text-align: ' + arg.replTextAlign + ';\n overflow: ' + arg.replOverflow + ';\n}\n#' + arg.inputElName + ' {\n margin: ' + arg.inputMargin + ';\n padding: ' + arg.inputPadding + ';\n width: ' + arg.inputWidth + ';\n height: ' + arg.inputHeight + ';\n}';
document.getElementsByTagName('head')[0].appendChild(sty);

var ws = new WebSocket(arg.socketProto + '://' + arg.serverName + arg.socketPrefix);
ws.addEventListener('open', function (event) { replEl.style.backgroundColor = arg.replOpenBgColour; });
ws.addEventListener('message', function (event) { replyToPage(event.data, true); });
ws.addEventListener('close', function (event) { replEl.style.backgroundColor = arg.replClosedBgColour; });
replEl.innerHTML = arg.replCursor;
inputEl.addEventListener('keypress', function (event) { typeToPage(event); });
inputEl.addEventListener('keydown', function (event) { nonGraphicalToPage(event); });

mainEl.appendChild(replEl);
mainEl.appendChild(inputEl);

}
