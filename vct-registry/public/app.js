// public/app.js

async function fetchJson(url) {
	const res = await fetch(url);
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`HTTP ${res.status}: ${text}`);
	}
	return res.json();
}

async function loadVctList() {
	const loading = document.getElementById('vct-loading');
	const controls = document.getElementById('vct-controls');
	const errorBox = document.getElementById('vct-error');
	const select = document.getElementById('vct-select');
	const metaBox = document.getElementById('vct-meta');
	const dataBox = document.getElementById('vct-data');
	const sourceBox = document.getElementById('vct-source');

	loading.hidden = false;
	controls.hidden = true;
	errorBox.hidden = true;
	errorBox.textContent = '';
	select.innerHTML = '';
	metaBox.innerHTML = '';
	dataBox.textContent = '';
	sourceBox.textContent = '';

	try {
		const list = await fetchJson('/api/vct'); // [{ vct, name }]

		if (!Array.isArray(list) || list.length === 0) {
			loading.hidden = true;
			errorBox.hidden = false;
			errorBox.textContent = 'No VCT entries found.';
			return;
		}

		// "(All metadata)" first
		const allOpt = document.createElement('option');
		allOpt.value = '__all__';
		allOpt.textContent = '(All metadata)';
		select.appendChild(allOpt);

		// Add actual VCT entries
		for (const entry of list) {
			const opt = document.createElement('option');
			opt.value = entry.vct;
			opt.textContent = `${entry.name} (${entry.vct})`;
			select.appendChild(opt);
		}

		loading.hidden = true;

		// Default to showing ALL
		select.value = '__all__';
		await loadVctSelection(select.value);

		controls.hidden = false;

		// On change
		select.addEventListener('change', async () => {
			await loadVctSelection(select.value);
		});
	} catch (err) {
		console.error('Error loading VCT list:', err);
		loading.hidden = false;
		errorBox.hidden = false;
		errorBox.textContent = `Failed to load VCT list: ${err.message}`;
	}
}

async function loadVctSelection(value) {
	const errorBox = document.getElementById('vct-error');
	const metaBox = document.getElementById('vct-meta');
	const dataBox = document.getElementById('vct-data');
	const sourceBox = document.getElementById('vct-source');

	errorBox.hidden = true;
	metaBox.innerHTML = '';
	dataBox.textContent = 'Loading…';
	sourceBox.textContent = '';

	try {
		const origin = window.location.origin; // 👈 dynamic domain

		if (value === '__all__') {
			const url = '/type-metadata/all';
			const all = await fetchJson(url);

			const fullUrl = `${origin}${url}`; // http://localhost:5001/type-metadata/all
			sourceBox.textContent = `Source: GET ${fullUrl}`;

			metaBox.innerHTML = `
        <div><strong>Showing:</strong> All metadata entries</div>
        <div><strong>Total entries:</strong> ${all.length}</div>
      `;

			dataBox.textContent = JSON.stringify(all, null, 2);
			return;
		}

		const encoded = encodeURIComponent(value);
		const fetchUrl = `/type-metadata?vct=${encoded}`;

		// Display pretty full URL with domain + decoded VCT
		const displayUrl = `${origin}/type-metadata?vct=${value}`;
		sourceBox.textContent = `Source: GET ${displayUrl}`;

		const metadata = await fetchJson(fetchUrl);

		metaBox.innerHTML = `
      <div><strong>VCT:</strong> <code>${value}</code></div>
      <div><strong>Name:</strong> ${metadata.name}</div>
      ${metadata.description
				? `<div><strong>Description:</strong> ${metadata.description}</div>`
				: ''
			}
    `;

		dataBox.textContent = JSON.stringify(metadata, null, 2);
	} catch (err) {
		errorBox.hidden = false;
		errorBox.textContent = `Failed to load metadata: ${err.message}`;
		dataBox.textContent = '';
		sourceBox.textContent = '';
	}
}

window.addEventListener('DOMContentLoaded', loadVctList);
