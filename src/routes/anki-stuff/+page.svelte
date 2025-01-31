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
						onclick={() => {
							navigator.clipboard.writeText(
								`front:c* OR front:_c* OR front:j* OR front:_j* OR front:m* OR front:_m*`
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
						onclick={() => {
							navigator.clipboard.writeText(
								`-front:c* -front:_c* -front:j* -front:_j* -front:m* -front:_m*`
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
						onclick={() => {
							navigator.clipboard.writeText(
								`front:a* OR front:_a* OR front:e* OR front:_e* OR front:r* OR front:_r*`
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
						onclick={() => {
							navigator.clipboard.writeText(
								`-front:a* -front:_a* -front:e* -front:_e* -front:r* -front:_r*`
							);
						}}>Clipboard</button
					></td
				>
			</tr>
		</tbody>
	</table>
</div>
