<script lang="ts">
	import { onMount } from 'svelte';
	import { joinUrl } from '$lib/utils';

	let serverUrl = '';

	let letterPair = '';
	let fileInputEl: HTMLInputElement | null = null;

	let imageFilename = '2r5xdh26x4yljepuua6exy36xab9ttr.png';

	const resetForm = () => {
		if (fileInputEl) {
			fileInputEl.value = '';
		}
		letterPair = '';
	};

	onMount(() => {
		serverUrl = import.meta.env.VITE_SERVER_URL;
	});
</script>

<div class="max-w-[130ch] mx-auto">
	<h1>Flash Cards</h1>
	<p>{serverUrl}</p>
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

			if (response.ok) {
				resetForm();
			}
		}}
	>
		<table>
			<tbody>
				<tr>
					<td>Letter Pair</td>
					<td>
						<input name="letterPair" type="text" bind:value={letterPair} />
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
							bind:this={fileInputEl}
						/>
					</td>
				</tr>
			</tbody>
		</table>
		<button>Submit</button>
	</form>
	<div>
		<input type="text" bind:value={imageFilename} />
		<img
			crossorigin="anonymous"
			src={joinUrl(serverUrl, 'images', imageFilename)}
			alt={imageFilename}
		/>
	</div>
</div>
