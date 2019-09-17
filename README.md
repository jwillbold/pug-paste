# pug-paste

An Atom IDE plugin that automatically transforms HTML code to PUG code, when pasting into a PUG file.
The plugin first checks whether the pasting target is a pug file. Afterwards, it is checked whether the pasted
text is HTML. If this is the case, the pasted text gets converted.

The HTML to PUG conversion is done via the node.js package 'html2pug'.
https://www.npmjs.com/package/html2pug

## Usage
Enable the auto-conversion through "pug-paste:enable-clipboard-transform".

1. Press ``Ctrl + Shift + P``
2. Type ``pug-paste``
3. Select ``enable/disable/toggle-clipboard-transform``

## Install

``apm install pug-paste``

Or search ``pug-paste`` in the packages section of Atom.

## Configuration
Both, the detection whether the current file is a PUG file and whether the current code is HTML code are checked
with regexes. Both can be modified.
