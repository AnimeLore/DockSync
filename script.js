const ADDON_NAME = "DockSync";

const settingsStore = window.pulsesyncApi?.getSettings?.(ADDON_NAME);
let currentSettings = settingsStore?.getCurrent?.() ?? {};

function getWebSocketPort() {
    return currentSettings?.websocket?.port?.value ?? currentSettings?.websocket?.port ?? "";
}

let socket;
let reconnectTimer = null;
let reconnectDelay = 1000;
let currentWebSocketPort = null;

const RECONNECT_MAX_DELAY = 30000;

function closeSocket() {
    if (
        socket &&
        socket.readyState !== WebSocket.CLOSED &&
        socket.readyState !== WebSocket.CLOSING
    ) {
        socket.close();
    }
}

function connectSocket() {
    if (
        socket &&
        (
            socket.readyState === WebSocket.OPEN ||
            socket.readyState === WebSocket.CONNECTING
        )
    ) {
        return;
    }

    const port = String(getWebSocketPort());

    if (!port) {
        console.error("Не найден websocket.port в настройках DockSync");
        scheduleReconnect();
        return;
    }

    currentWebSocketPort = port;
    socket = new WebSocket(`ws://localhost:${port}`);

    socket.addEventListener("open", () => {
        console.log("Подключено к серверу");

        reconnectDelay = 1000;

        const activeIcon = setInterval(async () => {
			let getIcon = document.getElementById("docksync_status");
			if (getIcon.className == "") {
				getIcon.className = "active";
			} else  {
				clearInterval(activeIcon);
			}
		}, 1000);
    });

    socket.addEventListener("message", (event) => {
        try {
            const message = JSON.parse(event.data);
            handleSocketCommand(message.request, message, socket);
        } catch (error) {
            console.error("Ошибка обработки сообщения WebSocket:", error);
        }
    });

    socket.addEventListener("error", (error) => {
        console.error("Ошибка WebSocket:", error);
        closeSocket();
    });

    socket.addEventListener("close", () => {
        console.warn("WebSocket отключён");

        socket = null;

        const element = document.getElementById("docksync_status");
        element.classList.remove("active");

        scheduleReconnect();
    });
}
function scheduleReconnect() {
    if (reconnectTimer) {
        return;
    }

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectSocket();
    }, reconnectDelay);

    reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
}


// Функции самого плагина
function globalVibeInteraction() {
	try {
		let tm_t = 100;
		if(!document.querySelector('.cpeagBA1_PblpJn8Xgtv[data-test-id="MY_VIBE_PLAY_BUTTON"]') && !document.querySelector('.cpeagBA1_PblpJn8Xgtv[data-test-id="MY_VIBE_PAUSE_BUTTON"]')) {
			document.querySelector('a.buOTZq_TKQOVyjMLrXvB:has(span[title="Главная"])').click();
			tm_t = 2000;
		}
		setTimeout(() => {
			if(document.querySelector('.cpeagBA1_PblpJn8Xgtv[data-test-id="MY_VIBE_PLAY_BUTTON"]')) {
				document.querySelector('.cpeagBA1_PblpJn8Xgtv[data-test-id="MY_VIBE_PLAY_BUTTON"]').click()
			} else {
				document.querySelector('.cpeagBA1_PblpJn8Xgtv[data-test-id="MY_VIBE_PAUSE_BUTTON"]').click()
			}
			}, tm_t);
	} catch(e) {
		return false
	}
	return true;
}

function trackVibeInteraction() {
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .cpeagBA1_PblpJn8Xgtv[data-test-id="PLAYERBAR_DESKTOP_CONTEXT_MENU_BUTTON"]').click()
		setTimeout( () => {document.querySelector('.cpeagBA1_PblpJn8Xgtv[data-test-id="CONTEXT_MENU_VIBE_BUTTON"]').click()}, 1000)
	} catch(err) {
		console.log(err);
			return false;
	}
	return true;
}
function muteInteraction() {
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .cpeagBA1_PblpJn8Xgtv[data-test-id="CHANGE_VOLUME_BUTTON"]').click()
	} catch(err) {
			return false;
	}
	return true;
}
function favouriteInteraction() {
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .cpeagBA1_PblpJn8Xgtv[data-test-id="LIKE_BUTTON"]').click()
	} catch(err) {
			return false;
	}
	return true;
}
function unfavouriteInteraction() {
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .cpeagBA1_PblpJn8Xgtv[data-test-id="DISLIKE_BUTTON"]').click()
	} catch(err) {
			return false;
	}
	return true;
}

function changeVolumeByStep(step, how) {
	const encodeNormalVolumeToAbstract = (e => {
                    let t = Math.pow(.01, 1 - e);
                    return t > .01 ? t : 0
                });
	let normalVolume;
	switch (how) {
		case 1: // turn it up
			if(window.sonataState.playerState.exponentVolume.value == 1) return true;
			normalVolume = window.sonataState.playerState.exponentVolume.value;
			normalVolume += step;
			if(normalVolume > 1) {
				normalVolume = 1
			}
			pulsesyncApi.setVolume(normalVolume);
			return true;
			
		break;
		case 2: // turn it down
			if(window.sonataState.playerState.exponentVolume.value == 0) return true;
			normalVolume = window.sonataState.playerState.exponentVolume.value;
			normalVolume -= step;
			if(normalVolume < 0) {
				normalVolume = 0
			}
			pulsesyncApi.setVolume(normalVolume);
			return true;
		break;
		default: 
			return false;
		break;
	}
}

function moveBackward() {
	window.pulsesyncApi.previous();
	return true;
}

function moveForward() {
	window.pulsesyncApi.next();
	return true;
}

function playingInteraction() {
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="PAUSE_BUTTON"]').click()
	} catch(e) {
		try {
			document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="PLAY_BUTTON"]').click()
		} catch(e) {
			return false;
		}
	}
	return true;
}

function shuffleInteraction() {
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="SHUFFLE_BUTTON_ON"]').click()
	} catch(e) {
		try {
			document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="SHUFFLE_BUTTON"]').click()
		} catch(e) {
				return false;
		}
	}
	return true;
}
function repeatInteraction() {
	switch(isPlayerRepeatedStatus()) {
		case 0:
			window.pulsesyncApi.setRepeatMode("context");
			break;
		case 1:
			window.pulsesyncApi.setRepeatMode("one");
			break;
		case 2:
			window.pulsesyncApi.setRepeatMode("none");
			break;
		default:
			return false;
	}
	return true;
}
function timeInteraction(amount, how) {
		window.pulsesyncApi.setProgress(window.pulsesyncApi.getProgress().position + [-amount, amount][how]);
		return true;
}
function isPlayerVibeStatus() {
		if(window.sonataState?.queueState.currentEntity.value?.entity.entityData.type == "vibeTrack") {
			return 1
		} else {
			return 0
		}
}
function isPlayerShuffledStatus() {
	return +window.pulsesyncApi.isShuffle();
}

function isPlayerRepeatedStatus() {
	switch(window.pulsesyncApi.getRepeatMode()) {
		case "none":
			return 0;
		case "context":
			return 1;
		case "one":
			return 2
	}
}
function getCurrentTime() {
	return Math.round(window.pulsesyncApi?.getProgress()?.position || 0);
}
function getEndTime() {
	return Math.round(window.pulsesyncApi?.getProgress()?.duration || 0);
}
function getCoverImageSrc() {
	return (document.querySelector(".PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN img[data-test-id=ENTITY_COVER_IMAGE]")?.src || "").replace("https", "http");
}
function getCurrentVolumeLevel() {
	return Math.round(window.sonataState.playerState.exponentVolume.value*100)/100;
}

function isFavouriteStatus() {
	return window.pulsesyncApi.isTrackLiked();
	
}
function isPlayerPausedStatus() {
	return + !window.pulsesyncApi.isPlaying();
}

function handleSocketCommand(message, data, socket) {
	switch(message) {
		case "device":
			console.log('Плагин успешно подключился к доку!');
			break;
		case "currentTime":
			socket.send(JSON.stringify({response: getCurrentTime(), request: "currentTime"}));
		break;
		case "endTime":
			socket.send(JSON.stringify({response: getEndTime(), request: "endTime"}));
		break;
		case "coverImage":
			socket.send(JSON.stringify({response: getCoverImageSrc(), request: "coverImage"}));
		break;
		case "vibeState":
			socket.send(JSON.stringify({response: isPlayerVibeStatus(), request: "vibeState"}));
		break;
		case "repeatState":
			socket.send(JSON.stringify({response: isPlayerRepeatedStatus(), request: "repeatState"}));
		break;
		case "shuffleState":
			socket.send(JSON.stringify({response: isPlayerShuffledStatus(), request: "shuffleState"}));
		break;
		case "likeState":
			socket.send(JSON.stringify({response: isFavouriteStatus(), request: "likeState"}));
		break;
		case "playingState":
			socket.send(JSON.stringify({response: isPlayerPausedStatus(), request: "playingState"}));
		break;
		case "dislikeInteraction":
			console.log('dislikeInteraction запрошена устройством;');
			unfavouriteInteraction();
		break;
		case "likeInteraction":
			console.log('likeInteraction запрошена устройством;');
			favouriteInteraction();
		break;
		case "playerInteraction":
			console.log('playerInteraction запрошена устройством;');
			playingInteraction();
			break;
		case "trackVibeInteraction":
			console.log('trackVibeInteraction запрошена устройством;');
			trackVibeInteraction();
			break;
		case "globalVibeInteraction":
			console.log('globalVibeInteraction запрошена устройством;');
			globalVibeInteraction();
			break;
		case "muteInteraction":
			console.log('muteInteraction запрошена устройством;');
			muteInteraction();
			break;
		case "shuffleInteraction":
			console.log('shuffleInteraction запрошена устройством;');
			shuffleInteraction();
			break;
		case "repeatInteraction":
			console.log('repeatInteraction запрошена устройством;');
			repeatInteraction();
			break;
		case "time":
			console.log('time запрошена устройством;');
			timeInteraction(data.message, data.how);
		break;
		case "volume":
			console.log('volume запрошена устройством;');
			changeVolumeByStep(data.message, data.how);
			break;
		case "track":
			console.log('track запрошена устройством;');
			if(data.message === -1 ) {
				console.log('направление: назад;');
				moveBackward();
			} else if(data.message === 1) {
				console.log('направление: вперёд;');
				moveForward();
			}
			break;
		default: 
			console.error('Запрошено неизвестное действие! Возможно вы обновили только плагин для устройства?');
			break
	}
}
const addIcon = setInterval(async () => {
	let getTitleBar = document.getElementsByClassName("TitleBar_root__QjdOZ");
	if (getTitleBar.length >= 1 && !(document.getElementById("docksync_status"))) {
		getTitleBar[0].insertAdjacentHTML("afterbegin", "<div id='docksync_status'></div>");
	} else if (document.getElementById("docksync_status")) {
		clearInterval(addIcon);
	}
}, 1000);

connectSocket()