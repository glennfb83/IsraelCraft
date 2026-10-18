# IsraelCraft Chess Club

Styled to reuse the site’s parchment, ink, blue accent, and Courier-style labels. All selectors are prefixed `ic-chess-`.

## Embed

```html
<div id="ic-chess-root"></div>
<script type="module" src="/IsraelCraft/games/chess/chess.js"></script>
```

Use `/games/chess/chess.js` if deployed at the domain root. Standalone page: `/IsraelCraft/games/chess/`.

## API

```js
ICChess.init({root:"#ic-chess-root",mode:"local"});
ICChess.on("gameEnd", result => console.log(result.pgn, result.fen));
ICChess.exportFEN(); ICChess.exportPGN(); ICChess.loadFEN(fen); ICChess.newGame(); ICChess.destroy();
```

The game uses chess.js 1.4.0 from jsDelivr; internet access is required for the rules engine. Local play and the client-side bot work without a game server. Casual bot selects random legal moves; Tactical bot prioritizes captures and promotions. This initial version does not yet include clocks or online mode. For fully offline deployment, vendor the chess.js distribution and change the import to a local path. For strong AI, add a local Stockfish WASM worker.
