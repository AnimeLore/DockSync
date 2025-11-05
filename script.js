async function getSettings(name) {
    try {
        const response = await fetch(`http://localhost:2007/get_handle?name=${name}`);
        if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);
  
        const { data } = await response.json();
        if (!data?.sections) {
            console.warn("Структура данных не соответствует ожидаемой");
            return null;
        }

        return transformJSON(data);
    } catch (error) {
        console.error(error);
        return null;
    }
}

// "Трансформирование" полученных настроек для более удобного использования
function transformJSON(data) {
    const result = {};

    try {
        data.sections.forEach(section => {
            section.items.forEach(item => {
                if (item.type === "text" && item.buttons) {
                    result[item.id] = {};
                    item.buttons.forEach(button => {
                        result[item.id][button.id] = {
                            value: button.text,
                            default: button.defaultParameter
                        };
                    });
                } else {
                    result[item.id] = {
                        value: item.bool || item.input || item.selected || item.value || item.filePath,
                        default: item.defaultParameter
                    };
                }
            });
        });
    } finally {
        return result;
    }
}

let socket;
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
			window.sonataState.playerState.volume.value = encodeNormalVolumeToAbstract(normalVolume);
			return true;
			
		break;
		case 2: // turn it down
			if(window.sonataState.playerState.exponentVolume.value == 0) return true;
			normalVolume = window.sonataState.playerState.exponentVolume.value;
			normalVolume -= step;
			if(normalVolume < 0) {
				normalVolume = 0
			}
			window.sonataState.playerState.volume.value = encodeNormalVolumeToAbstract(normalVolume);
			return true;
		break;
		default: 
			return false;
		break;
	}
}

function moveBackward() {
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="PREVIOUS_TRACK_BUTTON"]').click()
	} catch (e) {
		return false;
	}
	return true;
}

function moveForward() {
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="NEXT_TRACK_BUTTON"]').click()
	} catch (e) {
		return false;
	}
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
	try {
		document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="REPEAT_BUTTON_NO_REPEAT"]').click()
	} catch(e) {
		try {
			document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="REPEAT_BUTTON_REPEAT_CONTEXT"]').click()
		} catch(e) {
			try {
				document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="REPEAT_BUTTON_REPEAT_ONE"]').click()
			} catch(e) {
				return false;
			}
		}
	}
	return true;
}

function isPlayerShuffledStatus() {
	if(document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="SHUFFLE_BUTTON_ON"]')) {
		return 1;
	} else if (document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="SHUFFLE_BUTTON"]')) {
		return 0;
	}
}

function isPlayerRepeatedStatus() {
	if(document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="REPEAT_BUTTON_NO_REPEAT"]')) {
		return 0;
	} else if (document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="REPEAT_BUTTON_REPEAT_CONTEXT"]')) {
		return 1;
	} else if (document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="REPEAT_BUTTON_REPEAT_ONE"]')) {
		return 2;
	}
}

function getCurrentVolumeLevel() {
	return Math.round(window.sonataState.playerState.exponentVolume.value*100)/100;
}

function isFavouriteStatus() {
	const id = window.sonataState.queueState.currentEntity.value?.entity.entityData.meta.id;
	if (window.sonataState.queueState.currentEntity.value.entity.likeStore.isTrackLiked(id)) {
		return 1;
	}
	return 0;
	
}
function isPlayerPausedStatus() {
	if(document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="PAUSE_BUTTON"]')) {
		return 0;
	} else if (document.querySelector('.PlayerBarDesktopWithBackgroundProgressBar_root__bpmwN .BaseSonataControlsDesktop_sonataButton__GbwFt[data-test-id="PLAY_BUTTON"]')) {
		return 1;
	}
}

function handleSocketCommand(message, data, socket) {
	switch(message) {
		case "device":
			console.log('Плагин успешно подключился к доку!');
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
	

setInterval(async () => {
	let setting = await getSettings('DockSync');
	console.log(setting);

if (socket?.readyState === WebSocket.OPEN) return
socket = new WebSocket(`ws://localhost:${setting.websocket.port.value}`);

socket.addEventListener('open', () => {
	console.log('Подключено к серверу');
});
	socket.addEventListener('error', (error) => {
	console.error('Ошибка:', error);
});
socket.addEventListener('message', (event) => {
	//console.log(`Получено от сервера: ${event.data}`); // логирование
	
	const message = JSON.parse(event.data);
	
	handleSocketCommand(message.request, message, socket);
});

}, 10000);