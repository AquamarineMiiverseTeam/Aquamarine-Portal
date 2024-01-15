var pjax = new Pjax({
    selectors: [".wrapper", "body"]
});

var isHistoryBackDisabled = false;
var scrollPosition = 0;

console.log("init aqua");

document.addEventListener("DOMContentLoaded", function () {
    wiiuBrowser.endStartUp();
    aquamarine.init();
    aquamarine.initSounds();
    aquamarine.initEmpathy();
    aquamarine.initSpoilers();
    aquamarine.initNavBar();
    aquamarine.updateNavBar();
    aquamarine.backButtonUpdate();
});

document.addEventListener("pjax:send", function () {
    wiiuBrowser.lockUserOperation(true);
});

document.addEventListener("pjax:complete", function () {
    aquamarine.initSounds();
    aquamarine.initEmpathy();
    aquamarine.initSpoilers();
    aquamarine.initNavBar();
    aquamarine.updateNavBar();
    aquamarine.backButtonUpdate();
    wiiuBrowser.lockUserOperation(false);
});

var aquamarine = {
    init: function () {
        wiiuSound.playSoundByName("BGM_OLV_MAIN", 3);

        wiiuBrowser.endStartUp();
        wiiuBrowser.endStartUp();
        wiiuBrowser.endStartUp();

        setTimeout(function () {
            wiiuSound.playSoundByName("BGM_OLV_MAIN_LOOP_NOWAIT", 3);
        }, 90000);
    },
    initSounds: function () {
        var els = document.querySelectorAll("[data-sound]");
        if (!els) return;
        for (var i = 0; i < els.length; i++) {
            els[i].addEventListener("click", function (e) {
                wiiuSound.playSoundByName(e.currentTarget.getAttribute('data-sound'), 3);
            });
        }
    },
    initNavBar: function () {
        var els = document.querySelectorAll("#menu-bar > li");
        if (!els) return;
    
        for (var i = 0; i < els.length; i++) {
            els[i].addEventListener("click", function (e) {
                var el = e.currentTarget;
                var isExcluded = el.id === "menu-bar-back" || el.id === "menu-bar-exit";
    
                for (var i = 0; i < els.length; i++) {
                    if (!isExcluded && els[i].classList.contains('selected')) {
                        els[i].classList.remove('selected');
                    }
                }
                el.classList.add("selected");
            });
        }
    
        var path = window.location.pathname;
        if (path.indexOf("/communities") !== -1 || path.indexOf("/titles/show") !== -1) {
            document.querySelector("#menu-bar #menu-bar-community").classList.add("selected");
        }
    },     
    updateNavBar: function () {
        var els = document.querySelector("#menu-bar");
        if (!els) return;
        var path = window.location.pathname;
        console.log(path)
        if (path === "communities" || path === "titles/show"){
        document.querySelector("#menu-bar #menu-bar-community").classList.add("selected");
        }
    },
    initEmpathy: function () {
        var els = document.querySelectorAll("button[data-post-id].miitoo-button");
        if (!els) return;
        for (var i = 0; i < els.length; i++) {
            els[i].removeEventListener('click', yeah);
            els[i].addEventListener("click", yeah);
        }
        function yeah(e) {
            var el = e.currentTarget;
            var id = el.getAttribute("data-post-id");
            console.log(id)

            var parent = document.getElementById("post-" + id);
            var count = parent.querySelector(".feeling");
            el.disabled = true;

            if (count.classList.contains('added')) {
                wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
            }
            else {
                wiiuSound.playSoundByName('SE_OLV_MII_ADD', 1);
            }

            var xml = new XMLHttpRequest();
            xml.open("POST", "https://api.olv.nonamegiven.xyz/v1/posts/" + id + "/empathies");
            xml.send();

            xml.onreadystatechange = function () {
                if (xml.readyState === 4) {
                    if (xml.status === 200) {
                        if (count.classList.contains('added')) {
                            count.classList.remove('added');
                            el.innerHTML = 'Yeah!';
                            if (count) count.innerText -= 1;

                        }
                        else {
                            count.classList.add('added');
                            el.innerHTML = 'Unyeah!';
                            if (count) count.innerText = ++count.innerText;
                        }
                        el.disabled = false;
                    }
                    else {
                        wiiuErrorViewer.openByCode(1155927);
                        el.disabled = false;
                    }
                }
            }
        }
    },
    initSpoilers: function () {
        var els = document.querySelectorAll("a.hidden-content-button");
        if (!els) return;
        for (var i = 0; i < els.length; i++) {
            els[i].addEventListener("click", function (e) {
                e.preventDefault();
                var el = e.currentTarget;
                var postToShow = el.parentElement.parentElement.parentElement.parentElement.parentElement;
                postToShow.classList.remove("hidden");
                el.innerHTML = "";
                el.parentElement.parentElement.innerHTML = "";
            });
        }
    },
    exitApplet: function () {
        setTimeout(function () {
            wiiuBrowser.closeApplication();
        }, 0);
    },
    toggleFavorite: function () {
        var favoriteBtn = document.querySelector(".favorite-button.button");
        favoriteBtn.disabled = true;

        var id = document.querySelector(".wrapper-content").getAttribute("data-community-id");
        var xml = new XMLHttpRequest();
        xml.open("POST", "https://api.olv.nonamegiven.xyz/v1/communities/" + id + "/favorite");
        xml.send();
        xml.onreadystatechange = function () {
            if (xml.readyState === 4) {
                if (xml.status === 200) {
                    if (favoriteBtn.classList.contains("checked")) {
                        favoriteBtn.disabled = false;
                        favoriteBtn.classList.remove("checked");
                    } else {
                        favoriteBtn.disabled = false;
                        favoriteBtn.classList.add("checked");
                    }

                    if (!favoriteBtn.classList.contains("checked")) {
                        wiiuSound.playSoundByName("SE_OLV_MII_CANCEL", 3);
                    } else {
                        wiiuSound.playSoundByName("SE_OLV_MII_ADD", 3);
                    }
                }
                else {
                    wiiuErrorViewer.openByCodeAndMessage(155299, 'There was an error favoriting this community.')
                    favoriteBtn.disabled = false;
                }
            }
        }
    },
    back: function back() {
        history.back();
    },
    toggleFeelingModal: function () {
        document.querySelector('.feeling-selector.expression').classList.toggle('none');
    },
    openPostModal: function () {
        isHistoryBackDisabled = true;
        scrollPosition = window.scrollY;
        document.getElementById("menu-bar").classList.add("none");
        document.querySelector(".wrapper-content").classList.add("none");
        document.getElementById("add-new-post-modal").classList.remove("none");
        var communityTitle = document.querySelector(".wrapper-content").getAttribute("data-community-title-name");
        document.querySelector("#add-new-post-modal .window-title").innerText = "Post to " + communityTitle + (communityTitle === "Activity Feed" ? "" : " Community");


        var feelingInputs = document.querySelectorAll(".feeling-selector.expression .buttons li");
        var userMii = document.querySelector('.mii-icon-container');
        var spoilerLabel = document.querySelector('.spoiler-button');
        var postTypeLi = document.querySelectorAll('.textarea-menu li label');
        var postButton = document.querySelector('.ok-confirm-post-button');

        document.querySelector('.textarea-menu-text-input').oninput = function () {
            syncTextAreas(this.value);
        };

        document.querySelector('.textarea-text').oninput = function () {
            syncTextAreas(this.value);
        };

        function syncTextAreas(value) {
            document.querySelector('.textarea-text').value = value;
            document.querySelector('.textarea-menu-text-input').value = value;
        }

        function addClassType(label) {
            for (var i = 0; i < postTypeLi.length; i++) {
                var ty = postTypeLi[i];
                if (ty !== label) {
                    ty.classList.remove("checked");
                }
            }
            label.classList.add("checked");
        }

        function addClassFeeling(li) {
            for (var i = 0; i < feelingInputs.length; i++) {
                var feelingLi = feelingInputs[i];
                if (feelingLi !== li) {
                    feelingLi.classList.remove("checked");
                }
            }
            li.classList.add("checked");
            var feelingUrl = li.querySelector('input[type="radio"]').getAttribute("data-mii-face-url");
            changeImageSource(feelingUrl);
        }

        function changeImageSource(feelingUrl) {
            var userMiiImg = userMii.querySelector('.icon');
            userMiiImg.src = feelingUrl;
        }

        function changePostType(li) {
            if (li.id == 'text') {
                document.querySelector('.textarea-text').disabled = false;
                document.querySelector('.textarea-memo-value').disabled = true;
                document.querySelector('.textarea-memo').classList.add('none');
                document.querySelector('.textarea-text').classList.remove('none');
            } else if (li.id == 'memo') {
                document.querySelector('.textarea-text').disabled = true;
                document.querySelector('.textarea-memo-value').disabled = false;
                document.querySelector('.textarea-text').classList.add('none');
                document.querySelector('.textarea-memo').classList.remove('none');
                document.querySelector('.textarea-memo-trigger').onclick = makeMemo;
                makeMemo();
                function makeMemo() {
                    wiiuMemo.open(false);
                    document.querySelector('.textarea-memo-preview').style.backgroundImage = 'url(data:image/png;base64,' + wiiuMemo.getImage(false) + ')';
                    document.querySelector('.textarea-memo-value').value = wiiuMemo.getImage(true);
                }
            }
        }

        function toggleSpoilerClass() {
            var label = event.currentTarget;
            var input = label.querySelector('input[type="checkbox"]');
            if (input.checked) {
                wiiuSound.playSoundByName('SE_OLV_CHECKBOX_CHECK', 3);
                label.classList.add('checked');
            } else {
                wiiuSound.playSoundByName('SE_OLV_CHECKBOX_UNCHECK', 3);
                label.classList.remove('checked');
            }
        }

        function feelingClick() {
            addClassFeeling(this);
            document.querySelector('.feeling-selector.expression').classList.add('none');
            wiiuSound.playSoundByName('SE_OLV_BALLOON_CLOSE', 3);
        }

        function liClick() {
            addClassType(event.currentTarget);
            changePostType(event.currentTarget);
        }

        spoilerLabel.onclick = toggleSpoilerClass;

        for (var i = 0; i < feelingInputs.length; i++) {
            var fe = feelingInputs[i];
            fe.onclick = feelingClick;
        }

        for (var i = 0; i < postTypeLi.length; i++) {
            var li = postTypeLi[i];
            li.onclick = liClick;
        }

        postButton.onclick = makeNewPost;


        function makeNewPost() {
            wiiuBrowser.lockHomeButtonMenu(true);
            var type_radios = document.getElementsByName("_post_type");
            var type_of_post;

            for (var i = 0; i < type_radios.length; i++) {
                if (type_radios[i].checked) {
                    type_of_post = type_radios[i].value;
                }
            }

            if (type_of_post == 'body' && !document.querySelector('.textarea-text').value) {
                wiiuDialog.alert('Please input text in your post.', 'OK');
                return;
            }

            postButton.classList.add('disabled');
            postButton.onclick = null;
            var aquaForm = new FormData();
            var feeling_radios = document.getElementsByName("feeling_id");
            var checked_feeling;

            for (var i = 0; i < feeling_radios.length; i++) {
                if (feeling_radios[i].checked) {
                    checked_feeling = feeling_radios[i].value;
                }
            }
            aquaForm.append('feeling_id', checked_feeling);
            aquaForm.append('community_id', document.querySelector(".wrapper-content").getAttribute("data-community-id"));

            var spoilerStatus = document.querySelector('.spoiler_input');
            var spoilerVal;
            if (spoilerStatus.checked) {
                spoilerVal = 1;
            } else {
                spoilerVal = 0;
            }

            var titleIDhexAttribute = document.querySelector(".wrapper-content").getAttribute("data-community-title-id-hex");

            if (titleIDhexAttribute) {
                var titleIDs = titleIDhexAttribute.split(',');
                var isOwned = 0;

                for (var i = 0; i < titleIDs.length; i++) {
                    var currentTitleID = titleIDs[i].trim();

                    if (wiiuDevice.existsTitle(currentTitleID)) {
                        isOwned = 1;
                        break;
                    }
                }
            }

            aquaForm.append('owns_title', isOwned);
            aquaForm.append('is_spoiler', spoilerVal);

            aquaForm.append("language_id", 254);
            aquaForm.append("is_autopost", 0);
            aquaForm.append("is_app_jumpable", 0);

            if (type_of_post == 'body') {
                aquaForm.append('body', document.querySelector('.textarea-text').value);
            } else if (type_of_post == 'painting') {
                aquaForm.append('painting', document.querySelector('.textarea-memo-value').value);
            }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.olv.nonamegiven.xyz/v1/posts');
            xhr.send(aquaForm);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        postButton.classList.remove('disabled');
                        aquamarine.closePostModal();
                        postButton.onclick = makeNewPost;
                        wiiuBrowser.lockHomeButtonMenu(false);

                        pjax.loadUrl(window.location.pathname)
                    }
                    else {
                        wiiuErrorViewer.openByCodeAndMessage(155289, 'There was an error making a new post, Please try again later.')
                        postButton.classList.remove('disabled');
                        postButton.onclick = makeNewPost;
                        wiiuBrowser.lockHomeButtonMenu(false);
                    }
                }
            }

        }
    },
    closePostModal: function () {
        isHistoryBackDisabled = false;
        wiiuMemo.reset();
        document.querySelector('.textarea-memo-preview').style.backgroundImage = 'url(data:image/png;base64,' + wiiuMemo.getImage(false) + ')';
        document.getElementById("menu-bar").classList.remove("none");
        document.querySelector(".wrapper-content").classList.remove("none");
        document.getElementById("add-new-post-modal").classList.add("none");
        window.scrollTo(0, scrollPosition);
    },
    openComSettingsModal: function () {
        isHistoryBackDisabled = true;
        scrollPosition = window.scrollY;
        document.getElementById("menu-bar").classList.add("none");
        document.querySelector(".wrapper-content").classList.add("none");
        document.getElementById("change-settings-modal").classList.remove("none");
        document.querySelector(".community-settings-drop").addEventListener('change', aquamarine.postComViewingSetting);
    },
    postComViewingSetting: function () {
        var e = document.querySelector(".community-settings-drop");
        var text = e.options[e.selectedIndex].value;
        var community = document.querySelector(".wrapper-content").getAttribute("data-community-title-id");
        var subCommunity = document.querySelector(".wrapper-content").getAttribute("data-community-id");
        wiiuBrowser.lockHomeButtonMenu(true);
        var settingForm = new FormData();
        settingForm.append('view_setting', text);
        var xhr = new XMLHttpRequest();
        if (subCommunity != '0') {
            xhr.open('POST', 'https://api.olv.nonamegiven.xyz/v1/communities/' + community + '/' + subCommunity + '/settings');
        } else {
            xhr.open('POST', 'https://api.olv.nonamegiven.xyz/v1/communities/' + community + '/settings');
        }
        xhr.send(settingForm);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    wiiuBrowser.lockHomeButtonMenu(false);
                }
                else {
                    wiiuErrorViewer.openByCodeAndMessage(155279, 'There was an error changing the community setting, Please try again later.')
                    wiiuBrowser.lockHomeButtonMenu(false);
                }
            }
        }
    },
    closeComSettingsModal: function () {
        isHistoryBackDisabled = false;
        document.querySelector(".community-settings-drop").removeEventListener('change', aquamarine.postComViewingSetting);
        document.getElementById("menu-bar").classList.remove("none");
        document.querySelector(".wrapper-content").classList.remove("none");
        document.getElementById("change-settings-modal").classList.add("none");
        window.scrollTo(0, scrollPosition);
    },
    backButtonUpdate: function () {
        var backBtn = document.getElementById("menu-bar-back");
        var exitBtn = document.getElementById("menu-bar-exit");

        if (wiiuBrowser.canHistoryBack()) {
            backBtn.classList.remove('selected');
            backBtn.classList.remove('none');
            exitBtn.classList.add('none');
        }
        else {
            backBtn.classList.remove('selected');
            backBtn.classList.add('none');
            exitBtn.classList.remove('none');
        }
    }
}


setInterval(function () {
    wiiu.gamepad.update();
    if (wiiu.gamepad.hold === 16384) {
        if (wiiuBrowser.canHistoryBack() && !isHistoryBackDisabled) {
            wiiuSound.playSoundByName("SE_OLV_MII_CANCEL", 3);
            aquamarine.back();
        }
    }

    if (wiiu.gamepad.hold === 8) {
        pjax.reload();
    }
}, 100);