# Blindfolded Rubik's Cube Solving Stuff

Some things I use to prepare to prepare for blindfolded solving

## Developing

Front-end:

1. `npm install`
2. `npm run dev -- --open`

Back-end:

1. copy `./server/user-data/users.sample.json` to `./server/user-data/users.json`
2. Go something

Credentials are:
- Username: `username`
- Password: `password`

## Building/Deploying

The GitHub action will build the front-end and put it on the `gh-pages` branch. You should configure GitHub Pages to build that branch. Choose the "/ (root)" folder.

```bash
npm run build
```

## Notes

### Current Time

html:
```html
<iframe class="myframe" src="https://bld.pux.one/clock"/>
<iframe class="myframe" src="https://bld.pux.one/clock?quartermarkers=true"/>
<iframe class="myframe" src="https://bld.pux.one/clock?unit=minutes" />
```

css:
```css
.myframe {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border: none;
}
```

## ToDos

- edges, mainly for commutators

### ToDo Comments

- server/database/database.go:111: @todo: check filename and use appropriate version of rowToFlashCard
- server/database/database.go:309: @todo(nick-ng): handle new lines?
- server/database/database.go:390: @todo(nick-ng): make sure owner doesn't have a colon (doesn't matter?)
- server/routes/images.go:17: @todo(nick-ng): pre-signed urls for retrieving images?
- server/utils/password.go:37: @todo(nick-ng): does this actually help?
- src/lib/stores/options.ts:6: @todo(nick-ng): change filter criteria "direction"
- src/lib/utils.ts:328: @todo(nick-ng): make a "bag" with all items in itemSet and shuffle
- src/lib/utils.ts:329: @todo(nick-ng): remove items from bag and put into subsets
- src/lib/utils.ts:330: @todo(nick-ng): when you have constructed the nth subset, return that subset
- src/lib/utils.ts:331: @todo(nick-ng): if there are not enough items in the bag to construct the nth subset, make a new bag
- src/routes/flash-cards/edit/letter-pair-editor.svelte:119: @todo(nick-ng): you can just do `new FormData(event.currentTarget)`?
- src/routes/quiz/quiz-home.svelte:21: @todo(nick-ng): move these to the options store
- static/cstimer-violentmonkey.js:415: @todo: make size adjustable
