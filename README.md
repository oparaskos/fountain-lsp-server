

# <img src="https://raw.githubusercontent.com/oparaskos/vscode-fountain/main/assets/fountain-logo-monochrome%401x.png" alt="icon" width="36" style="display: inline; margin-bottom: -10px"/> Fountain Language Server

This is a Language Server for [fountain](https://fountain.io/) files, a simple markup syntax for writing, editing, and sharing screenplays in plain, human-readable text.

The language server is built on [vscode-languageserver](https://www.npmjs.com/package/vscode-languageserver) but should be flexible to use with other IDEs.

## Features

 - [x] Code Completions for Title Page attributes, scene headings, etc.
 - [x] CodeLens support for characters, scenes and locations.
 - [x] Statistics to be consumed by a webview, by character, location and scene; and more granularly by character gender and race.

## Additional information

The project introduces the concept of a `.fountainrc` file to specify additional details about characters, the schema for which is in the root of this project.

The extension will also attempt to guess gender of characters based on name, this only supports `en` and `it` locales and makes incorrect assumptions often (e.g. `Sam` is always regarded as a male name, even though it can be a shortened form of `Samantha`), but provides a reasonable basis as a default to be overriden.

## IDE Extensions

If you build an IDE Extension based on this language server implementation, please feel free to [share it](https://github.com/oparaskos/fountain-lsp-server/discussions) and I'll include it in this list.

* **Visual Studio Code**, **VSCodium**
  * [![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/oparaskos/vscode-fountain/build.yml?branch=main)](https://github.com/oparaskos/vscode-fountain)
[![CodeFactor](https://www.codefactor.io/repository/github/oparaskos/vscode-fountain/badge)](https://www.codefactor.io/repository/github/oparaskos/vscode-fountain)
  * [**Visual Studio Marketplace**](https://marketplace.visualstudio.com/items?itemName=OliverParaskos.fountain-lsp)
  * [**OpenVSX**](https://open-vsx.org/extension/oliverparaskos/fountain-lsp)
