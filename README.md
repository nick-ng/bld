# Blindfolded Rubik's Cube Solving Stuff

Some things I use to prepare to prepare for blindfolded solving

## Developing

Front-end:

1. `npm install`
2. `npm run dev -- --open`

Back-end:

1. copy `./server/user-data/users.sample.json` to
   `./server/user-data/users.json`
2. Go something

Credentials are:

- Username: `username`
- Password: `password`

## Building/Deploying

The GitHub action will build the front-end and put it on the `gh-pages` branch.
You should configure GitHub Pages to build that branch. Choose the "/ (root)"
folder.

```bash
npm run build
```

## Notes

### Current Time

html:

```html
<iframe class="myframe" src="https://bld.pux.one/clock" />
<iframe class="myframe" src="https://bld.pux.one/clock?quartermarkers=true" />
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

- server/repositories/flashcard.go:21: @todo(nick-ng): populate commutators map
- server/routes/flash-cards.go:29: @todo(nick-ng): wait some time before deleting unused images
- server/routes/flash-cards.go:82: @todo(nick-ng): only show default user's flash cards if no user provided
- server/routes/flash-cards.go:128: @todo(nick-ng): only show default user's flash cards if no user provided
- server/routes/flash-cards.go:404: @todo(nick-ng): handle cleaning up images
- server/routes/images.go:17: @todo(nick-ng): pre-signed urls for retrieving images?
- server/routes/letter-pairs.go:23: @todo(nick-ng): only show default user's letter pairs if no user provided
- server/routes/letter-pairs.go:71: @todo(nick-ng): figure out how and where to validate partialMnemonic
- server/utils/password.go:38: @todo(nick-ng): does this actually help?
- src/lib/stores/options.ts:9: @todo(nick-ng): store options on server
- src/lib/stores/options.ts:49: @todo(nick-ng): remove migration code later
- src/lib/utils.ts:15: @todo(nick-ng): functions need to be clear whether they are operating with speffz letters or locations
- src/lib/utils.ts:309: @todo(nick-ng): handle other piece types (x centre, + centre, wing)
- src/lib/utils.ts:450: @todo(nick-ng): handle cube rotations (x y z)
- src/lib/utils.ts:613: @todo(nick-ng): is the loop necessary?
- src/routes/drill/+page.svelte:13: @todo(nick-ng): make drill aware of flash card type
- src/routes/drill/+page.svelte:15: @todo(nick-ng): save these to local storage
- src/routes/flash-cards/edit/letter-pair-editor.svelte:127: @todo(nick-ng): you can just do `new FormData(event.currentTarget)`?
- src/routes/quiz/quiz-home.svelte:17: @todo(nick-ng): move these to the options store
- static/cstimer-violentmonkey.js:415: @todo: make size adjustable
