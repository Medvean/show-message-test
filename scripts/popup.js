'use strict';

chrome.storage.local.get({data: {}}, result => {
	const domains = result.data;
	const domainList = document.getElementById('domainList');

	function showDomains(domains) {
		domains.forEach( ($domain) => {
			const li = domainList.appendChild(document.createElement('li'));
			li.innerHTML = `<a href="http://${$domain.domain}" target="_blank">${$domain.domain}</a>`;
		});
	}

	showDomains(domains);
});