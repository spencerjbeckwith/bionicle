
- NPM script `build` will watch the source directory and compile/rollup your Typescript.

- NPM script `host` will host a local webserver, serving your game files, and will open your browser to the page.

- NPM script `watch` will watch the images asset folder and will recompile your atlas (via the `atlas` script) automatically when a change is detected. If you've also run `build` this change will then trigger that as well.

Running all three of these together ensures a smooth development process. When saving an image or Typescript, the only thing you must do to run the game is refresh your browser page.