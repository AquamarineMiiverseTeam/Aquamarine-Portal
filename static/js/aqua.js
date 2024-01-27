const aqua_locale = {
    "aqua.portal.button.remove": { value: "Sí" },
    "aqua.portal.cancel": { value: "Cancelar" },
    "aqua.portal.close": { value: "Cerrar" },
    "aqua.portal.dialog.apply_settings_done": { value: "Ajustes guardados." },
    "aqua.portal.followlist.confirm_unfollow_with_name": { args: [1], value: "Quitar a %s de tu lista de seguidores?" },
    "aqua.portal.miitoo.frustrated": { value: "Buena..." },
    "aqua.portal.miitoo.happy": { value: "Buena!" },
    "aqua.portal.miitoo.like": { value: "Buena♥" },
    "aqua.portal.miitoo.normal": { value: "Buena!" },
    "aqua.portal.miitoo.puzzled": { value: "Buena..." },
    "aqua.portal.miitoo.surprised": { value: "Buena!?" },
    "aqua.portal.ok": { value: "OK" },
    "aqua.portal.reply.delete_confirm": { value: "Eliminar este comentario?" },
    "aqua.portal.report.report_comment_id": { args: [1], value: "ID de Comentario: %s" },
    "aqua.portal.report.report_post_id": { args: [1], value: "ID de Publicación: %s" },
    "aqua.portal.setup": { value: "Configurar" },
    "aqua.portal.show_more_content": { value: "Ver publicación entera" },
    "aqua.portal.stop": { value: "Cancelar" },
    "aqua.portal.unfollow": { value: "Dejar de seguir" },
    "aqua.portal.user.search.go": { value: "Ver perfil" },
    "aqua.portal.yes": { value: "Sí" }
};

var pjax = new Pjax({
    selectors: [".wrapper", "body"]
});

var isHistoryBackDisabled = false;
var scrollPosition = 0;

var scrollBottom = document.createEvent("Event");
scrollBottom.initEvent("scroll_bottom", true, true);

document.addEventListener("DOMContentLoaded", function () {
    wiiuBrowser.endStartUp();
    aquamarine.init();
    aquamarine.initSounds();
    aquamarine.initEmpathy();
    aquamarine.initSpoilers();
    aquamarine.initNavBar();
    aquamarine.backButtonUpdate();

    document.addEventListener("scroll", function () {
        if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
            if (!document.getElementById("scrollEvent")) { return; }
            document.getElementById("scrollEvent").dispatchEvent(scrollBottom)
        }
    })
})

document.addEventListener("pjax:send", function () {
    wiiuBrowser.lockUserOperation(true);
    isHistoryBackDisabled = true;
});

document.addEventListener("pjax:complete", function () {
    isHistoryBackDisabled = false;
    aquamarine.initSounds();
    aquamarine.initEmpathy();
    aquamarine.initSpoilers();
    aquamarine.initNavBar();
    aquamarine.backButtonUpdate();
    wiiuBrowser.lockUserOperation(false);
    checkNotifications();
});

var aquamarine = {
    init: function () {
        wiiuSound.playSoundByName("BGM_OLV_MAIN", 3);
        setTimeout(function () {
            wiiuSound.playSoundByName("BGM_OLV_MAIN_LOOP_NOWAIT", 3);
        }, 90000);

        checkNotifications();
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
    },
    localize: function (key, args) {
        const localizedObject = aqua_locale[key];

        if (localizedObject) {
            var localizedText = localizedObject.value;

            // Replace %s with the argument at the specified index
            if (args && args.length > 0 && localizedObject.args && localizedObject.args.length > 0) {
                const argIndex = localizedObject.args[0];
                if (args[argIndex - 1] !== undefined) {
                    const placeholder = '%s';
                    localizedText = localizedText.replace(new RegExp(placeholder, 'g'), args[argIndex - 1]);
                }
            }

            return localizedText;
        } else {
            // Return a default message if the key is not found
            return 'Localization not available for key: ' + key;
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
            console.log(id);

            var parent = document.getElementById("post-" + id);
            var count = parent.querySelector(".feeling");
            el.disabled = true;

            if (count.classList.contains('added')) {
                wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
            } else {
                wiiuSound.playSoundByName('SE_OLV_MII_ADD', 1);
            }

            if (!el.getAttribute('data-in-progress')) {
                el.setAttribute('data-in-progress', 'true');

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "https://api.olv.nonamegiven.xyz/v1/posts/" + id + "/empathies");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        el.removeAttribute('data-in-progress');

                        if (xhr.status === 200) {
                            var response = JSON.parse(xhr.responseText).result;
                            if (count.classList.contains('added') && response == "deleted") {
                                count.classList.remove('added');
                                el.innerHTML = 'Yeah!';
                                if (count) count.innerText -= 1;
                            } else if (!count.classList.contains('added') && response == "created") {
                                count.classList.add('added');
                                el.innerHTML = 'Unyeah!';
                                if (count) count.innerText = ++count.innerText;
                            }
                        } else {
                            wiiuErrorViewer.openByCode(1155927);
                        }

                        el.disabled = false;
                    }
                };
                xhr.send();
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
        if (favoriteBtn.classList.contains("checked")) {
            wiiuSound.playSoundByName("SE_OLV_MII_CANCEL", 3);
        } else {
            wiiuSound.playSoundByName("SE_OLV_MII_ADD", 3);
        }
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
    toggleScreenshotModal: function () {
        document.querySelector('.screenshot-toggle-container').classList.toggle('none');
    },
    toggleUserReportModal: function () {
        document.getElementById('dropdown-user-report').classList.toggle('open');
    },
    toggleUserRemoveFriendModal: function () {
        document.getElementById('dropdown-user-remove-friend').classList.toggle('show');
    },
    toggleFilterMainModal: function () {
        var dropdownMenu = document.querySelector('.filter-dropdown .dropdown-menu');

        if (dropdownMenu.classList.contains('none')) {
            dropdownMenu.classList.remove('none');
        } else {
            dropdownMenu.classList.add('none');
        }
    },
    closeNewAnnouncment: function () {
        document.querySelector('.info-content-new-announcment').classList.add('none');
    },
    openPostModal: function () {
        isHistoryBackDisabled = true;
        scrollPosition = window.scrollY;
        document.getElementById("menu-bar").classList.add("none");
        document.querySelector(".wrapper-content").classList.add("none");
        document.getElementById("add-new-post-modal").classList.remove("none");
        var communityTitle = document.querySelector(".wrapper-content").getAttribute("data-community-title-name");
        var windowTitle = "Post to " + (communityTitle.indexOf("Community") === -1 ? communityTitle + " Community" : communityTitle);
        document.querySelector("#add-new-post-modal .window-title").innerText = windowTitle;

        var screenshotToggleButton = document.querySelector(".screenshot-toggle-button");
        if (wiiuMainApplication.getScreenShot(true) || wiiuMainApplication.getScreenShot(false)) {
            screenshotToggleButton.classList.remove("none");
            document.querySelector(".screenshot-toggle-container .screenshot-gp").src = "data:image/png;base64," + wiiuMainApplication.getScreenShot(false);
            document.querySelector(".screenshot-toggle-container .screenshot-tv").src = "data:image/png;base64," + wiiuMainApplication.getScreenShot(true);
        }

        var screenshotInput = document.getElementById("screenshot_val_input");
        var cancelScreenshot = document.querySelector(".screenshot-toggle-container .cancel-toggle-button");

        var screenshotLis = document.querySelectorAll(".screenshot-toggle-container li");
        for (var i = 0; i < screenshotLis.length; i++) {
            var sLi = screenshotLis[i];
            sLi.onclick = sLiClick;
        }

        cancelScreenshot.onclick = sSelectorReset;

        function sLiClick() {
            var eLi = event.currentTarget;
            for (var i = 0; i < screenshotLis.length; i++) {
                var li = screenshotLis[i];
                if (li !== eLi) {
                    li.querySelector("img").classList.remove("checked");
                }
            }
            eLi.querySelector("img").classList.add("checked");
            if (eLi.querySelector("input").value === "top") {
                screenshotToggleButton.style.background = 'url(data:image/png;base64,' + wiiuMainApplication.getScreenShot(true) + ')';
                screenshotToggleButton.style.backgroundSize = "cover";
                screenshotInput.value = wiiuMainApplication.getScreenShot(true);
            } else if (eLi.querySelector("input").value === "bottom") {
                screenshotInput.value = wiiuMainApplication.getScreenShot(false);
                screenshotToggleButton.style.background = 'url(data:image/png;base64,' + wiiuMainApplication.getScreenShot(false) + ')';
                screenshotToggleButton.style.backgroundSize = "cover";
            } else {
                screenshotInput.value = "";
            }
            aquamarine.toggleScreenshotModal();
        }

        function sSelectorReset() {
            var bgAlbum = "data:image/png;base64,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";
            for (var i = 0; i < screenshotLis.length; i++) {
                var li = screenshotLis[i];
                li.querySelector("img").classList.remove("checked");
            }
            screenshotToggleButton.style.background = "url(" + bgAlbum + ") center center no-repeat, " +
                "-webkit-gradient(linear, left top, left bottom, from(#ffffff), color-stop(0.5, #ffffff), " +
                "color-stop(0.8, #f6f6f6), color-stop(0.96, #f5f5f5), to(#bbbbbb)) 0 0";
            screenshotToggleButton.style.backgroundSize = "initial";
            screenshotInput.value = "";
            aquamarine.toggleScreenshotModal();
        }

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

            if (screenshotInput.value || !screenshotInput.value == '') {
                aquaForm.append('screenshot', screenshotInput.value);
            }

            var titleIDhex = document.querySelector(".wrapper-content").getAttribute("data-community-title-id-hex");
            var isOwnedCheck = wiiuDevice.existsTitle(titleIDhex);
            var isOwned;
            if (isOwnedCheck) {
                isOwned = 1;
            } else {
                isOwned = 0;
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
                        postButton.onclick = makeNewPost;
                        wiiuBrowser.lockHomeButtonMenu(false);

                        pjax.loadUrl(window.location.pathname);
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
    openMessagePostModal: function () {
        isHistoryBackDisabled = true;
        scrollPosition = window.scrollY;
        document.getElementById("menu-bar").classList.add("none");
        document.querySelector(".wrapper-content").classList.add("none");
        document.getElementById("add-new-post-modal").classList.remove("none");
        var modalPostType = document.querySelector(".wrapper-content").getAttribute("data-post-type");

        if (modalPostType == "group") {
            var gcTitle = document.querySelector(".wrapper-content").getAttribute("data-group-name");
            var windowTitle = "Message to group " + gcTitle;
            document.querySelector("#add-new-post-modal .window-title").innerText = windowTitle;
        } else if (modalPostType == "message") {
            var frTitle = document.querySelector(".wrapper-content").getAttribute("data-friend-name");
            var windowTitle = "Message to " + frTitle;
            document.querySelector("#add-new-post-modal .window-title").innerText = windowTitle;
        }

        var screenshotToggleButton = document.querySelector(".screenshot-toggle-button");
        if (wiiuMainApplication.getScreenShot(true) || wiiuMainApplication.getScreenShot(false)) {
            screenshotToggleButton.classList.remove("none");
            document.querySelector(".screenshot-toggle-container .screenshot-gp").src = "data:image/png;base64," + wiiuMainApplication.getScreenShot(false);
            document.querySelector(".screenshot-toggle-container .screenshot-tv").src = "data:image/png;base64," + wiiuMainApplication.getScreenShot(true);
        }

        var screenshotInput = document.getElementById("screenshot_val_input");
        var cancelScreenshot = document.querySelector(".screenshot-toggle-container .cancel-toggle-button");

        var screenshotLis = document.querySelectorAll(".screenshot-toggle-container li");
        for (var i = 0; i < screenshotLis.length; i++) {
            var sLi = screenshotLis[i];
            sLi.onclick = sLiClick;
        }

        cancelScreenshot.onclick = sSelectorReset;

        function sLiClick() {
            var eLi = event.currentTarget;
            for (var i = 0; i < screenshotLis.length; i++) {
                var li = screenshotLis[i];
                if (li !== eLi) {
                    li.querySelector("img").classList.remove("checked");
                }
            }
            eLi.querySelector("img").classList.add("checked");
            if (eLi.querySelector("input").value === "top") {
                screenshotToggleButton.style.background = 'url(data:image/png;base64,' + wiiuMainApplication.getScreenShot(true) + ')';
                screenshotToggleButton.style.backgroundSize = "cover";
                screenshotInput.value = wiiuMainApplication.getScreenShot(true);
            } else if (eLi.querySelector("input").value === "bottom") {
                screenshotInput.value = wiiuMainApplication.getScreenShot(false);
                screenshotToggleButton.style.background = 'url(data:image/png;base64,' + wiiuMainApplication.getScreenShot(false) + ')';
                screenshotToggleButton.style.backgroundSize = "cover";
            } else {
                screenshotInput.value = "";
            }
            aquamarine.toggleScreenshotModal();
        }

        function sSelectorReset() {
            var bgAlbum = "data:image/png;base64,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";
            for (var i = 0; i < screenshotLis.length; i++) {
                var li = screenshotLis[i];
                li.querySelector("img").classList.remove("checked");
            }
            screenshotToggleButton.style.background = "url(" + bgAlbum + ") center center no-repeat, " +
                "-webkit-gradient(linear, left top, left bottom, from(#ffffff), color-stop(0.5, #ffffff), " +
                "color-stop(0.8, #f6f6f6), color-stop(0.96, #f5f5f5), to(#bbbbbb)) 0 0";
            screenshotToggleButton.style.backgroundSize = "initial";
            screenshotInput.value = "";
            aquamarine.toggleScreenshotModal();
        }

        var feelingInputs = document.querySelectorAll(".feeling-selector.expression .buttons li");
        var userMii = document.querySelector('.mii-icon-container');
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

        function feelingClick() {
            addClassFeeling(this);
            document.querySelector('.feeling-selector.expression').classList.add('none');
            wiiuSound.playSoundByName('SE_OLV_BALLOON_CLOSE', 3);
        }

        function liClick() {
            addClassType(event.currentTarget);
            changePostType(event.currentTarget);
        }

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
            postButton.onclick = null;
            postButton.classList.add('disabled');
            wiiuBrowser.lockUserOperation(true);
            var type_radios = document.getElementsByName("_post_type");
            var type_of_post;

            for (var i = 0; i < type_radios.length; i++) {
                if (type_radios[i].checked) {
                    type_of_post = type_radios[i].value;
                }
            }

            if (type_of_post == 'body' && !document.querySelector('.textarea-text').value) {
                wiiuDialog.alert('Please input text in your message.', 'OK');
                return;
            }
            var aquaForm = new FormData();
            var feeling_radios = document.getElementsByName("feeling_id");
            var checked_feeling;

            for (var i = 0; i < feeling_radios.length; i++) {
                if (feeling_radios[i].checked) {
                    checked_feeling = feeling_radios[i].value;
                }
            }
            aquaForm.append('feeling_id', checked_feeling);

            if (modalPostType == "group") {
                aquaForm.append('group_id', document.querySelector(".wrapper-content").getAttribute("data-group-id"));
            } else if (modalPostType == "message") {
                aquaForm.append('to_pid', document.querySelector(".wrapper-content").getAttribute("data-friend-pid"));
            }

            if (screenshotInput.value || !screenshotInput.value == '') {
                aquaForm.append('screenshot', screenshotInput.value);
            }

            aquaForm.append("language_id", 254);
            aquaForm.append("is_autopost", 0);
            aquaForm.append("is_app_jumpable", 0);

            if (type_of_post == 'body') {
                aquaForm.append('body', document.querySelector('.textarea-text').value);
            } else if (type_of_post == 'painting') {
                aquaForm.append('painting', document.querySelector('.textarea-memo-value').value);
            }

            var xhr = new XMLHttpRequest();
            if (modalPostType == "group") {
                xhr.open('POST', 'https://api.olv.nonamegiven.xyz/v1/group_messages');
            } else if (modalPostType == "message") {
                xhr.open('POST', 'https://api.olv.nonamegiven.xyz/v1/friend_messages');
            }
            xhr.send(aquaForm);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        postButton.classList.remove('disabled');
                        postButton.onclick = makeNewPost;
                        wiiuBrowser.lockUserOperation(false);
                        pjax.loadUrl(window.location.pathname);
                    }
                    else {
                        wiiuErrorViewer.openByCodeAndMessage(155289, 'There was an error making a new post, Please try again later.')
                        postButton.classList.remove('disabled');
                        postButton.onclick = makeNewPost;
                        wiiuBrowser.lockUserOperation(false);
                    }
                }
            }

        }
    },
    closeMessagePostModal: function () {
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
    openPinModal: function (button) {
        isHistoryBackDisabled = true;
        scrollPosition = window.scrollY;
        document.getElementById("menu-bar").classList.add("none");
        document.querySelector(".wrapper-content").classList.add("none");
        document.getElementById("confirm-pin-message-modal").classList.remove("none");
        var pinPostUser = button.getAttribute("data-pin-user-name");
        var pinPostId = button.getAttribute("data-pin-post-id");

        var pinPostMessage = document.querySelector("#message-" + pinPostId);
        var pinPostMessageContent;

        if (pinPostMessage) {
            var postContent = pinPostMessage.querySelector(".post-body .post-content");
            var postMemo = pinPostMessage.querySelector(".post-body .post-memo");

            if (postContent) {
                if (postContent.textContent.length > 150) {
                    pinPostMessageContent = postContent.textContent.substring(0, 150) + '...';
                } else {
                    pinPostMessageContent = postContent.textContent;
                }
            } else if (postMemo) {
                pinPostMessageContent = 'memo';
            }
        }


        var okButton = document.querySelector("#confirm-pin-message-modal .ok-button");
        var windowTitle = "Pin " + pinPostUser + "'s message";
        var windowContent = "This message (" + pinPostMessageContent + ") will be seen first in the message list of the group chat, are you sure you want to pin this post?";
        document.querySelector("#confirm-pin-message-modal .window-body-inner.message").innerText = windowContent;
        document.querySelector("#confirm-pin-message-modal .window-title").innerText = windowTitle;

        okButton.onclick = postPin;

        function postPin() {
            wiiuBrowser.lockHomeButtonMenu(true);
            okButton.classList.add('disabled');
            okButton.onclick = null;
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.olv.nonamegiven.xyz/v1/group_messages/' + pinPostId + '/pin');
            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        okButton.classList.remove('disabled');
                        okButton.onclick = makeNewPost;
                        wiiuBrowser.lockHomeButtonMenu(false);
                        aquamarine.closePinModal();
                    }
                    else {
                        wiiuErrorViewer.openByCodeAndMessage(155569, 'There was an error pinning this post, Please try again later.')
                        okButton.classList.remove('disabled');
                        okButton.onclick = postPin;
                        wiiuBrowser.lockHomeButtonMenu(false);
                        aquamarine.closePinModal();
                    }
                }
            }
        }

    },
    closePinModal: function () {
        isHistoryBackDisabled = false;
        document.getElementById("menu-bar").classList.remove("none");
        document.querySelector(".wrapper-content").classList.remove("none");
        document.getElementById("confirm-pin-message-modal").classList.add("none");
        window.scrollTo(0, scrollPosition);
    },
    postComViewingSetting: function () {
        var e = document.querySelector(".community-settings-drop");
        var text = e.options[e.selectedIndex].value;
        var community = document.querySelector(".wrapper-content").getAttribute("data-community-id");
        wiiuBrowser.lockHomeButtonMenu(true);
        var settingForm = new FormData();
        settingForm.append('view_setting', text);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.olv.nonamegiven.xyz/v1/communities/' + community + '/settings');
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
        var els = document.querySelector("#menu-bar");
        if (!els) return;
        var backBtn = document.getElementById("menu-bar-back");
        var exitBtn = document.getElementById("menu-bar-exit");
        var path = window.location.pathname;

        if (path.indexOf("/communities") !== -1 || path.indexOf("/titles/show") !== -1) {
            document.querySelector("#menu-bar #menu-bar-community").classList.add("selected");
        } else if (path.indexOf("/messages") !== -1) {
            document.querySelector("#menu-bar #menu-bar-message").classList.add("selected");
        }

        if ((wiiuBrowser.canHistoryBack() && path.indexOf("/titles/show") === -1 && path.indexOf("/messages") === -1)) {
            backBtn.classList.remove('selected');
            backBtn.classList.remove('none');
            exitBtn.classList.add('none');
        } else {
            backBtn.classList.remove('selected');
            backBtn.classList.add('none');
            exitBtn.classList.remove('none');
        }

    },
    getPostsByTopicTag: function (a) {
        pjax.loadUrl(window.location.pathname + "?topic_tag=" + a.innerText)
    }
}

setInterval(function () {
    wiiu.gamepad.update();
    if (wiiu.gamepad.hold === 16384) {
        if (wiiuBrowser.canHistoryBack() && !isHistoryBackDisabled && document.getElementById("menu-bar-exit").classList.contains("none")) {
            document.querySelector("#menu-bar li#menu-bar-back").classList.add("selected");
            wiiuSound.playSoundByName("SE_OLV_MII_CANCEL", 3);
            aquamarine.back();
        }
    }

    if (wiiu.gamepad.hold === 8) {
        window.location.href = "https://portal.olv.nonamegiven.xyz/dumps/user_page_visitor.html";
    }
}, 100);

function checkNotifications() {
    const pid = document.querySelector("body").getAttribute("data-account-pid");

    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://api.olv.nonamegiven.xyz/v1/users/"+pid+"/notifications");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var notification_obj = xhr.responseXML.children[0].children[3];
                var unread_notifications = Number(notification_obj.children[0].innerHTML)
                var unread_messages = Number(notification_obj.children[1].innerHTML)

                var messages = document.querySelector("#menu-bar-message .badge");
                var news = document.querySelector("#menu-bar-news .badge");

                if (unread_messages > 0 && unread_messages < 99) {
                    messages.innerHTML = unread_messages;
                    messages.style.display = "block";
                }
                else if (unread_messages >= 99) {
                    messages.innerHTML = "99+";
                    messages.style.display = "block";
                }
                else {
                    messages.innerHTML = "";
                    messages.style.display = "none";
                }
                if (unread_notifications > 0 && unread_notifications < 99) {
                    news.innerHTML = unread_notifications;
                    news.style.display = "block";
                }
                else if (unread_notifications >= 99) {
                    news.innerHTML = "99+";
                    news.style.display = "block";
                }
                else {
                    news.innerHTML = "";
                    news.style.display = "none";
                }
            }
        }
    }
}

setInterval(checkNotifications, 30000);

// alert(aquamarine.localize("aqua.portal.followlist.confirm_unfollow_with_name", ["david"]))
// alert(aquamarine.localize("aqua.portal.miitoo.like", []))