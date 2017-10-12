'use strict';

function getData() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://www.softomate.net/ext/employees/list.json', true);

	xhr.onreadystatechange = function() {
		if (this.readyState != 4) return;

		if (this.status != 200) {
			console.log(xhr.status + ': ' + xhr.statusText);
		} else {
			try {
				var data = JSON.parse(xhr.responseText);
				chrome.storage.local.set({data: data});

			} catch (e) {
				console.log(e.message);
			}
		}
	};

	xhr.send(null);
}

const interval = 1000*60*60;

chrome.runtime.onInstalled.addListener(function () {

	/*First request. Interval сount*/
	getData();
	setInterval(() => {getData();}, interval);
	localStorage.setItem('start', Date.now());

	chrome.storage.local.set({ignoreList: []});
	chrome.storage.local.set({sessionAccess: {}});

});

chrome.runtime.onStartup.addListener(function() {
	/*Clear session list*/
	chrome.storage.local.set({sessionAccess: {}});

	const started = localStorage.getItem('start');
	const diff = Date.now() - started;

	if (diff >= interval) {
		/*One hour has passed. Making a new request.*/
		getData();
		setInterval(() => {getData();}, interval);
		localStorage.setItem('start', Date.now());
	} else {
		/*Delay a new request*/
		setTimeout(() => {
			getData();
			setInterval(() => {getData();}, interval);
		}, diff);
	}

});

chrome.tabs.onUpdated.addListener(function() {

	chrome.identity.getProfileUserInfo(function(userInfo) {
		const email = userInfo.email;

		let username = email.split("@")[0];
		username = username ? username : 'Guest';

		chrome.storage.local.get({username: {}}, result => {
			const prevUsername = result.username;

			if (prevUsername && (prevUsername === username)) {
				return false;
			} else {
				chrome.storage.local.set({username: username});
			}

		});
	});
});