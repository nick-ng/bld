# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Clock

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

- use basic auth
- use environment variables to specify server url
- post pictures to server
- store letter pair information
  - letter pair
  - user id
  - text answer
  - filename/uri

### ToDo Comments

- server/database/database.go:33: @todo(nick-ng): update snapshot file size
- server/database/database.go:146: @todo(nick-ng): convert log to snapshot
- server/database/database.go:277: @todo(nick-ng): make sure owner doesn't have a colon (doesn't matter?)
- server/routes/flash-cards.go:71: @todo(nick-ng): authenticate request
- server/routes/images.go:23: @todo(nick-ng): pre-signed urls for retrieving images?
- static/cstimer-violentmonkey.js:415: @todo: make size adjustable
