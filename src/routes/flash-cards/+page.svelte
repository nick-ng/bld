<script lang="ts">
	import { onMount } from 'svelte';
	import { joinUrl } from '$lib/utils';

	let serverUrl = '';
	let formData = new FormData();

	onMount(() => {
		serverUrl = import.meta.env.VITE_SERVER_URL;
	});
</script>

<div class="max-w-[130ch] mx-auto">
	<h1>Flash Cards</h1>
	<p>{serverUrl}</p>
	<p>{joinUrl(serverUrl, 'pants')}</p>
	<form
		action={joinUrl(serverUrl, 'flash-cards')}
		method="post"
		on:submit={async (event) => {
			event.preventDefault();

			const children = [...event.currentTarget];

			const formData = new FormData();

			for (let i = 0; i < children.length; i++) {
				const formInput = children[i];

				if (formInput instanceof HTMLInputElement) {
					const formInputName = formInput.getAttribute('name');
					const formInputType = formInput.getAttribute('type');

					if (!formInputName || !formInputType) {
						continue;
					}

					switch (formInput.getAttribute('type')) {
						case 'file': {
							const fileList = formInput.files;
							if (!fileList) {
								break;
							}

							const file = fileList[fileList.length - 1];

							if (!file) {
								break;
							}

							formData.set(formInputName, file);
							break;
						}
						default: {
							formData.set(formInputName, formInput.value);
						}
					}
				}
			}

			const response = await fetch(joinUrl(serverUrl, 'flash-cards'), {
				method: 'POST',
				body: formData
			});

			console.log('response', response);
		}}
	>
		<table>
			<tbody>
				<tr>
					<td>Pants</td>
					<td>
						<input name="pants" type="text" />
					</td>
				</tr>
				<tr>
					<td>Image</td>
					<td>
						<input
							name="image"
							alt="Choose Image"
							type="file"
							accept="image/*"
							on:change={(event) => {
								const fileList = event.currentTarget.files;
								if (!fileList) {
									return;
								}

								const file = fileList[fileList.length - 1];

								if (!file) {
									return;
								}

								formData.set('image', file);
							}}
						/>
					</td>
				</tr>
			</tbody>
		</table>
		<button>Submit</button>
	</form>
</div>
