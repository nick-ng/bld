<script lang="ts">
	import { page } from '$app/stores';
	import { joinUrl } from '$lib/utils';

	const serverUrl = import.meta.env.VITE_SERVER_URL;

	let files: FileList;
	let fileInputEl: HTMLInputElement | null = null;

	$: letterPair = $page.params.slug;

	const getImageUrl = (f: FileList | null) => {
		if (f && f.length > 0) {
			return window.URL.createObjectURL(f[0]);
		}

		return '';
	};

	const resetForm = () => {
		if (fileInputEl) {
			fileInputEl.value = '';
		}
	};
</script>

<div class="max-w-prose mx-auto">
	<a href="/flash-cards/edit">Back</a>
	<h2 class="uppercase text-center">{letterPair}</h2>
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

			const response = await fetch(joinUrl(serverUrl, 'flash-cards', letterPair), {
				method: 'PUT',
				body: formData
			});

			console.log('response', response);
		}}
	>
		<table class="flash-card-editor border-separate border-spacing-x-4">
			<tbody>
				<tr>
					<td>Memo</td>
					<td><input class="w-full" type="text" name="memo" /></td>
				</tr>
				<tr>
					<td>Commutator</td>
					<td><input class="w-full" type="text" name="memo" /></td>
				</tr>
				<tr>
					<td>Image</td>
					<td>
						<input
							class="w-full"
							type="file"
							id={`${letterPair}-image`}
							name="image"
							alt="Choose Image"
							accept="image/*"
							bind:this={fileInputEl}
							bind:files
						/>
						<label for={`${letterPair}-image`} class="block h-64 w-64 border border-gray-500">
							{#if getImageUrl(files)}
								<img
									class="object-contain"
									src={getImageUrl(files)}
									alt={`${letterPair.toUpperCase()} visualisation`}
								/>
							{:else}
								<div class="h-full w-full flex items-center justify-center text-3xl">No Image</div>
							{/if}
						</label>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="w-full flex flex-row justify-between">
			<button type="button">Reset</button>
			<button class="button-default">Submit</button>
		</div>
	</form>
</div>

<style>
	table.flash-card-editor td {
		vertical-align: top;
	}
</style>
