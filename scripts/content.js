'use strict';

const host = location.host;
const numberAccesses = 3;

function injectMessage(callback) {
	const style = document.createElement('link');

	style.rel = 'stylesheet';
	style.href = chrome.extension.getURL('styles/inject.css');
	(document.head || document.documentElement).appendChild(style);

	const script = document.createElement('script');

	script.src = chrome.extension.getURL('scripts/inject.js');
	script.onload = function() {
		this.remove();

		const msg = document.getElementById('msg9898');
		callback(msg);
	};
	(document.head || document.documentElement).appendChild(script);
}

function addToIgnoreList(ignoreList) {
	ignoreList.push(host);
	chrome.storage.local.set({ignoreList: ignoreList});
}

function updateSessionAccess(sessionAccess) {
	sessionAccess[host]++;
	chrome.storage.local.set({sessionAccess: sessionAccess});
}

function showMessage(username, ignoreList, sessionAccess, data) {
	data.some( object => {
		const domain = object.domain;

		if (host.search(domain) !== -1) {
			let message = object.message;
			message = message.replace(/%username%/gi, username);

			injectMessage((msg) => {
				msg.appendChild(document.createTextNode(message));

				const close = document.getElementById('msg9898__close');
				close.addEventListener('click', function() {
					this.parentNode.style.display = 'none';

					addToIgnoreList(ignoreList);
				});
			});

			updateSessionAccess(sessionAccess);

			return true;
		}
		return false;
	});
}

function getPromised(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, result => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else {
				resolve(result);
			}
		});
	});
}

const username = getPromised('username')
.then( username => username.username );

const ignoreList = getPromised('ignoreList')
.then( ignoreList => ignoreList.ignoreList );

const sessionAccess = getPromised('sessionAccess')
.then( sessionAccess => sessionAccess.sessionAccess );

const data = getPromised('data')
.then( data => data.data );

Promise.all([username, ignoreList, sessionAccess, data])
.then( ([username, ignoreList, sessionAccess, data]) => {
	sessionAccess[host] = (sessionAccess[host] === undefined) ? 0 : sessionAccess[host];
	!ignoreList.includes(host) &&
	sessionAccess[host] < numberAccesses
	?	showMessage(username, ignoreList, sessionAccess, data)
	: false;
});
