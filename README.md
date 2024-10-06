# Blindfolded Rubik's Cube Solving Stuff

Some things I use to prepare to prepare for s

## Developing

Front-end:

1. `npm install`
2. `npm run dev -- --open`

Back-end:

Go something

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

- use ~~basic~~ some kind of auth
- use environment variables to specify server url

### ToDo Comments

- server/database/database.go:35: @todo(nick-ng): update snapshot file size as you make snapshots
- server/database/database.go:149: @todo(nick-ng): convert log to snapshot
- server/database/database.go:280: @todo(nick-ng): make sure owner doesn't have a colon (doesn't matter?)
- server/routes/images.go:17: @todo(nick-ng): pre-signed urls for retrieving images?
- server/utils/password.go:25: @todo(nick-ng): does this actually help?
- src/routes/flash-cards/edit/letter-pair-editor.svelte:78: @todo(nick-ng): you can just do `new FormData(event.currentTarget)`?
- static/cstimer-violentmonkey.js:415: @todo: make size adjustable
