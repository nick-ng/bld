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
- server/routes/images.go:27: @todo(nick-ng): pre-signed urls for retrieving images?
- server/routes/images.go:28: @todo(nick-ng): use cookies?
- server/routes/images.go:49: @todo(nick-ng): clean up unused images
- server/utils/password.go:38: @todo(nick-ng): does this actually help?
- src/lib/stores/letter-pairs.ts:9: @todo(nick-ng): use storage events to keep different tabs synced https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
- src/lib/stores/letter-pairs.ts:27: @todo(nick-ng): should these load methods take unknown input and do the schema parsing?
- src/lib/stores/letter-pairs.ts:91: @todo(nick-ng): put data into session storage
- src/lib/stores/letter-pairs.ts:129: @todo(nick-ng): put data into session storage
- src/lib/stores/letter-pairs.ts:223: @todo(nick-ng): put data into session storage
- src/lib/stores/letter-pairs.ts:292: @todo(nick-ng): put data into session storage
- src/lib/stores/options.ts:9: @todo(nick-ng): store options on server
- src/lib/stores/options.ts:48: @todo(nick-ng): remove migration code later
- src/lib/utils.ts:15: @todo(nick-ng): functions need to be clear whether they are operating with speffz letters or locations
- src/lib/utils.ts:319: @todo(nick-ng): handle other piece types (x centre, + centre, wing)
- src/lib/utils.ts:468: @todo(nick-ng): handle cube rotations (x y z)
- src/lib/utils.ts:631: @todo(nick-ng): is the loop necessary?
- src/routes/drill/+page.svelte:13: @todo(nick-ng): make drill aware of flash card type
- src/routes/drill/+page.svelte:15: @todo(nick-ng): save these to local storage
- src/routes/flash-cards/edit/letter-pair-editor.svelte:127: @todo(nick-ng): you can just do `new FormData(event.currentTarget)`?
- src/routes/letter-pair/edit/alg-editor.svelte:31: @todo(nick-ng): use 2 argument bind:value style?
- src/routes/letter-pair/edit/image-editor.svelte:63: @todo(nick-ng): use 2 argument bind:value style?
- src/routes/letter-pair/edit/main-editor.svelte:80: @todo(nick-ng): handle error saving changes
- src/routes/letter-pair/edit/main-editor.svelte:87: @todo(nick-ng): handle error saving changes
- src/routes/mbld/analyse/mbld-cube.svelte:26: @todo(nick-ng): auto-complete scrambles
- src/routes/mbld/scramble/+page.svelte:19: @todo(nick-ng): figure out a way to put this file locally
- static/cstimer-violentmonkey.js:415: @todo: make size adjustable
