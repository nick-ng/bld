<div class="markdown w-prose mx-auto">
	<h1>Anki Stuff</h1>
	<h2>Searches</h2>
	<h3>UFR-Corner Search (3-style buffer)</h3>
	<p>Speffz letters: C, J, M</p>
	<table>
		<tbody>
			<tr>
				<td>Letter Pairs with C, J, or M</td>
				<td
					><button
						class="opaque"
						on:click={() => {
							navigator.clipboard.writeText(
								`front:c* OR front:*c OR front:j* OR front:*j OR front:m* OR front:*m`
							);
						}}>Clipboard</button
					></td
				>
			</tr>
			<tr>
				<td>Letter Pairs without C, J, or M</td>
				<td
					><button
						class="opaque"
						on:click={() => {
							navigator.clipboard.writeText(
								`-front:c* AND -front:*c AND -front:j* AND -front:*j AND -front:m* AND -front:*m`
							);
						}}>Clipboard</button
					></td
				>
			</tr>
		</tbody>
	</table>
	<h3>UBL-Corner Search (Old-Pochman buffer)</h3>
	<p>Speffz letters: A, E, R</p>
	<table>
		<tbody>
			<tr>
				<td>Letter Pairs with A, E, or R</td>
				<td
					><button
						class="opaque"
						on:click={() => {
							navigator.clipboard.writeText(
								`front:a* OR front:*a OR front:e* OR front:*e OR front:r* OR front:*r`
							);
						}}>Clipboard</button
					></td
				>
			</tr>
			<tr>
				<td>Letter Pairs without A, E, or R</td>
				<td
					><button
						class="opaque"
						on:click={() => {
							navigator.clipboard.writeText(
								`-front:a* AND -front:*a AND -front:e* AND -front:*e AND -front:r* AND -front:*r`
							);
						}}>Clipboard</button
					></td
				>
			</tr>
		</tbody>
	</table>
</div>
