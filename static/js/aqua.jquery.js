var aqua = {
    modifed_posts: [],
    modifed_communities: [],
    scrollPosition: 0,
    initSnd: function () {
        var e = $("[data-sound]");
        if (!e) { return; }

        function playSnd(event) {
            wiiuSound.playSoundByName($(event.currentTarget).attr("data-sound"), 3);
        }

        e.off("click").on("click", playSnd);
    },
    initButton: function () {
        setInterval(inputButton, 0);
        function inputButton() {
            wiiu.gamepad.update();

            if (wiiu.gamepad.hold == 128 || wiiu.gamepad.hold == 64) {
                var scrollSpeed = 0;
                var accY = wiiu.gamepad.accY;
                scrollSpeed = Math.round(accY * 40);
                window.scrollBy(0, scrollSpeed);
            }


            if (wiiu.gamepad.isDataValid === 0) {
                pressedButton = null;
                return;
            }

            switch (wiiu.gamepad.hold) {
                case 16384:
                    if (pressedButton !== 16384) {
                        pressedButton = 16384;
                        wiiuSound.playSoundByName("SE_WAVE_BACK", 3);
                        var path = location.pathname;
                        var viewer = $(".screenshot-viewer-screenshot");
                        if (viewer && viewer.length != 0 && !viewer.hasClass("none")) {
                            viewer.addClass("none");
                            $("#menu-bar").removeClass("none");
                            $(".header").removeClass("none");
                            $(".header-banner-container").removeClass("none");
                            $(".community-info").removeClass("none");
                            $(".community-type").removeClass("none");
                            $(".community-post-list").removeClass("none");
                            $(".post-permalink").removeClass("none");
                            window.scrollTo(0, aqua.scrollPosition)
                            return;
                        }

                        if (wiiuBrowser.canHistoryBack() && path.indexOf("/titles/show") === -1 && path.indexOf("/messages") === -1 && path.indexOf("/notifications") === -1 && path.indexOf("/notifications/friend_requests") === -1 && path.indexOf("/users/@me") === -1) {
                            history.back();
                        }
                    }
                    break;
                case 262144:
                    if (pressedButton !== 262144) {
                        pressedButton = 262144;
                        window.scrollTo(0, 0);
                    }
                    break;
                case 131072:
                    if (pressedButton !== 131072) {
                        pressedButton = 131072;
                        window.scrollTo(0, 0);
                    }
                    break;
                case 4096:
                    if (pressedButton !== 4096) {
                        pressedButton = 4096;
                        wiiuSound.playSoundByName("SE_WAVE_BALLOON_OPEN", 3);
                        window.location.reload();
                    }
                    break;
                default:
                    pressedButton = null;
                    break;
            }
        }
    },
    initNav: function () {
        var el = $("#menu-bar > li")
        var menu = $("#menu-bar")
        var back = $("#menu-bar-back")
        var fin = $("#menu-bar-exit")
        var community = $("#menu-bar #menu-bar-community")
        var message = $("#menu-bar #menu-bar-message")
        var mymenu = $("#menu-bar #menu-bar-mymenu")
        var news = $("#menu-bar #menu-bar-news")

        var path = location.pathname;

        for (var i = 0; i < el.length; i++) {
            $(el[i]).on("click", function (e) {
                var elm = e.currentTarget
                var isExcluded = elm.id === "menu-bar-back" || elm.id === "menu-bar-exit";

                for (var i = 0; i < el.length; i++) {
                    if (!isExcluded && el[i].classList.contains('selected')) {
                        $(el[i]).removeClass("selected")
                    }
                }
                $(elm).addClass("selected")
            })
        }

        if (path.indexOf("/communities") !== -1 || path.indexOf("/titles/show") !== -1) {

            for (var i = 0; i < el.length; i++) {
                $(el[i]).removeClass("selected")
            }
            community.addClass("selected");
        } else if (path.indexOf("/messages") !== -1) {
            for (var i = 0; i < el.length; i++) {
                $(el[i]).removeClass("selected")
            }
            message.addClass("selected");
        } else if (path.indexOf("/users/@me") !== -1) {
            for (var i = 0; i < el.length; i++) {
                $(el[i]).removeClass("selected")
            }
            mymenu.addClass("selected");
        } else if (path.indexOf("/notifications") !== -1) {
            for (var i = 0; i < el.length; i++) {
                $(el[i]).removeClass("selected")
            }
            news.addClass("selected");
        } else if (path.indexOf("/notifications/friend_requests") !== -1) {
            for (var i = 0; i < el.length; i++) {
                $(el[i]).removeClass("selected")
            }
            news.addClass("selected");
        } else {
            for (var i = 0; i < el.length; i++) {
                $(el[i]).removeClass("selected")
            }
        }

        if (wiiuBrowser.canHistoryBack() &&
            path.indexOf("/titles/show") === -1 &&
            path.indexOf("/messages") === -1 &&
            path.indexOf("/notifications") === -1 &&
            path.indexOf("/notifications/friend_requests") === -1 &&
            path.indexOf("/users/@me") === -1) {
            back.removeClass('none');
            fin.addClass('none');
        } else {
            back.addClass('none');
            fin.removeClass('none');
        }

    },
    initPjx: function () {
        $.pjax.defaults.timeout = 10000

        $(document).pjax("a[data-pjax]", {
            container: ".wrapper", // Specify the container for PJAX response
            fragment: ".wrapper" // Specify the fragment inside the response to replace
        });

        $(document).pjax("a[data-tab-query]", {
            container: ".community-post-list", // Specify the container for PJAX response
            fragment: ".community-post-list", // Specify the fragment inside the response to replace
            push: false
        });

        $(document).pjax("a[data-news]", {
            container: ".wrapper", // Specify the container for PJAX response
            fragment: ".wrapper", // Specify the fragment inside the response to replace
            push: false
        });
    },
    initTbs: function () {
        $("a[data-tab-query]").off("click")
        $("a[data-tab-query]").on("click", changeTbs)

        function changeTbs(a) {
            $("a[data-tab-query]").removeClass("selected")
            $(a.currentTarget).addClass("selected")

            wiiuSound.playSoundByName("SE_WAVE_SELECT_TAB", 3)
        }
    },
    initScrl: function () {
        $(document).off("scroll");
        $(document).off("aqua:scroll-end")

        function checkScroll() {
            if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
                $(document).trigger("aqua:scroll-end")
            }
        }

        if (!$("[data-scroll-event]").length >= 1) {
            $(document).off("scroll");
            $(document).off("aqua:scroll-end")
            return;
        } else {
            $(document).on("aqua:scroll-end", download)
            $(document).on("scroll", checkScroll);
        }

        var currently_downloading = false;
        function download() {
            var viewer = $(".screenshot-viewer-screenshot")
            if (currently_downloading || viewer.length && !viewer.hasClass("none")) { return; }
            var url = $("[data-scroll-url]").attr("data-scroll-url")
            var cont = $("[data-scroll-container]").attr("data-scroll-container")
            var query = "";
            if ($("[data-scroll-tab]").length >= 1) {
                query = "&type=" + $("[data-tab-query].selected").attr("data-tab-query")
            }
            var xhttp = new XMLHttpRequest()
            xhttp.open("GET", url += ("?offset=" + $(cont)[0].children.length) + query)
            xhttp.setRequestHeader("x-embedded-dom", true)
            xhttp.send()
            currently_downloading = true;

            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4) {
                    switch (xhttp.status) {
                        case 200:
                            var appendedContent = $(xhttp.responseText).css('display', 'none');
                            $(cont).append(appendedContent);

                            var totalImages = appendedContent.find('img').length;
                            var imagesLoadedCount = 0;

                            function handleDisplay() {
                                imagesLoadedCount++;
                                if (imagesLoadedCount >= totalImages) {
                                    appendedContent.css('display', 'block');
                                    imagesLoadedCount = 0;
                                }
                            }
                            appendedContent.find('img').on('load', handleDisplay);

                            aqua.initSnd();
                            aqua.initEmp();
                            aqua.initPopstate();
                            currently_downloading = false;
                            break;
                        case 204:
                            $("#loading").css("visibility", "hidden")
                            currently_downloading = false;
                            break;
                        default:
                            $("#loading").css("visibility", "hidden")
                            currently_downloading = false;
                            break;
                    }
                } else {
                    $("#loading").css("visibility", "visible")
                }
            }
        }
    },
    initEmp: function () {
        var els = $("button[data-post-id].miitoo-button");

        if (!els.length) return;

        els.off('click').on("click", yeah);

        function yeah(e) {
            wiiuSound.playSoundByName('', 1);
            wiiuBrowser.lockUserOperation(true);
            var el = $(e.currentTarget);
            var id = el.attr("data-post-id");
            var emc = +el.attr("data-empathy-count");
            var rec = +el.attr("data-reply-count");
            //post viewer miitoo
            if (el.hasClass("post-viewer-miitoo-button")) {
                var miisContainer = $(".post-content-miis");
                var postContent = $(".post-content:not(.memo)");
                var userCount = miisContainer.find(".user-count");
                var miis = miisContainer.find(".user-icon-container");
                var miiVisitor = miisContainer.find(".user-icon-container.visitor");
                el.prop('disabled', true);

                if (!el.attr('data-in-progress')) {
                    el.attr('data-in-progress', 'true');

                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", "https://api.olv.nonamegiven.xyz/v1/posts/" + id + "/empathies");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            el.removeAttr('data-in-progress');

                            if (xhr.status === 200) {
                                var response = JSON.parse(xhr.responseText).result;
                                if (el.hasClass('added') && response == "deleted") {
                                    emc -= 1;
                                    el.attr("data-empathy-count", emc);
                                    wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
                                    var existingIndex = -1;
                                    for (var i = 0; i < aqua.modifed_posts.length; i++) {
                                        if (aqua.modifed_posts[i].id === id) {
                                            existingIndex = i;
                                            break;
                                        }
                                    }
                                    if (existingIndex !== -1) {
                                        aqua.modifed_posts[existingIndex].count = emc;
                                        aqua.modifed_posts[existingIndex].state = response;
                                        aqua.modifed_posts[existingIndex].changed = true;
                                    } else {
                                        aqua.modifed_posts.push({ id: id, count: emc, state: response, changed: true });
                                    }
                                    wiiuBrowser.lockUserOperation(false);
                                    el.removeClass('added');
                                    el.text("Yeah!");
                                    if (miis.length == 1) {
                                        postContent.addClass("no-empathy");
                                        miiVisitor.css("display", "none")
                                        miisContainer.addClass("none");
                                    } else {
                                        $(".count-added").addClass("none")
                                        $(".count").removeClass("none")
                                        miiVisitor.css("display", "none");
                                    }
                                } else if (!el.hasClass('added') && response == "created") {
                                    emc += 1;
                                    el.attr("data-empathy-count", emc);
                                    console.log(emc)
                                    wiiuSound.playSoundByName('SE_OLV_MII_ADD', 1);
                                    var existingIndex = -1;
                                    for (var i = 0; i < aqua.modifed_posts.length; i++) {
                                        if (aqua.modifed_posts[i].id === id) {
                                            existingIndex = i;
                                            break;
                                        }
                                    }
                                    if (existingIndex !== -1) {
                                        aqua.modifed_posts[existingIndex].count = emc;
                                        aqua.modifed_posts[existingIndex].state = response;
                                        aqua.modifed_posts[existingIndex].changed = true;
                                    } else {
                                        aqua.modifed_posts.push({ id: id, count: emc, state: response, changed: true });
                                    }
                                    wiiuBrowser.lockUserOperation(false);
                                    el.addClass('added');
                                    el.text("Unyeah!");
                                    if (miis.length == 1) {
                                        if (postContent.hasClass("no-empathy")) {
                                            postContent.removeClass("no-empathy");
                                        }
                                        $(".count-added").removeClass("none")
                                        $(".count").addClass("none")
                                        miiVisitor.css("display", "inline-block");
                                        miisContainer.removeClass("none");
                                    } else {
                                        $(".count-added").removeClass("none")
                                        $(".count").addClass("none")
                                        miiVisitor.css("display", "inline-block");
                                    }
                                }
                            } else {
                                wiiuBrowser.lockUserOperation(false);
                                wiiuErrorViewer.openByCode(1155927);
                            }

                            el.prop('disabled', false);
                        }
                    };
                    xhr.send();
                }
                return;
            } //post preview miitoo
            else {
                var parent = $("#post-" + id);
                var count = parent.find(".feeling");
                el.prop('disabled', true);

                if (!el.attr('data-in-progress')) {
                    el.attr('data-in-progress', 'true');

                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", "https://api.olv.nonamegiven.xyz/v1/posts/" + id + "/empathies");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            el.removeAttr('data-in-progress');

                            if (xhr.status === 200) {
                                var response = JSON.parse(xhr.responseText).result;
                                if (count.hasClass('added') && response == "deleted") {
                                    emc -= 1;
                                    el.attr("data-empathy-count", emc);
                                    wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
                                    var existingIndex = -1;
                                    for (var i = 0; i < aqua.modifed_posts.length; i++) {
                                        if (aqua.modifed_posts[i].id === id) {
                                            existingIndex = i;
                                            break;
                                        }
                                    }
                                    if (existingIndex !== -1) {
                                        aqua.modifed_posts[existingIndex].count = emc;
                                        aqua.modifed_posts[existingIndex].state = response;
                                        aqua.modifed_posts[existingIndex].changed = true;
                                    } else {
                                        aqua.modifed_posts.push({ id: id, count: emc, state: response, changed: true });
                                    }
                                    wiiuBrowser.lockUserOperation(false);
                                    count.removeClass('added');
                                    el.text("Yeah!");
                                    if (count) {
                                        var countText = parseInt(count.text());
                                        count.text(countText - 1);
                                    }
                                } else if (!count.hasClass('added') && response == "created") {
                                    emc += 1;
                                    el.attr("data-empathy-count", emc);
                                    wiiuSound.playSoundByName('SE_OLV_MII_ADD', 1);
                                    var existingIndex = -1;
                                    for (var i = 0; i < aqua.modifed_posts.length; i++) {
                                        if (aqua.modifed_posts[i].id === id) {
                                            existingIndex = i;
                                            break;
                                        }
                                    }
                                    if (existingIndex !== -1) {
                                        aqua.modifed_posts[existingIndex].count = emc;
                                        aqua.modifed_posts[existingIndex].state = response;
                                        aqua.modifed_posts[existingIndex].changed = true;
                                    } else {
                                        aqua.modifed_posts.push({ id: id, count: emc, state: response, changed: true });
                                    }
                                    wiiuBrowser.lockUserOperation(false);
                                    count.addClass('added');
                                    el.text("Unyeah!");
                                    if (count) {
                                        var countText = parseInt(count.text());
                                        count.text(++countText);
                                    }
                                }
                            } else {
                                wiiuBrowser.lockUserOperation(false);
                                wiiuErrorViewer.openByCode(1155927);
                            }

                            el.prop('disabled', false);
                        }
                    };
                    xhr.send();
                }
            }
        }

    },
    initPopstate: function () {
        if ($("#post_list").length != 0) {
            for (var i = 0; i < aqua.modifed_posts.length; i++) {
                if (aqua.modifed_posts[i].state == "created" && aqua.modifed_posts[i].changed) {
                    $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta button").text("Unyeah!")
                    $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta a .feeling").addClass("added")
                    $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta a .feeling").text(aqua.modifed_posts[i].count);
                    aqua.modifed_posts[i].changed = false;
                    aqua.modifed_posts.splice(i, 1);
                } else if (aqua.modifed_posts[i].state == "deleted" && aqua.modifed_posts[i].changed) {
                    $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta button").text("Yeah!")
                    $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta a .feeling").removeClass("added")
                    $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta a .feeling").text(aqua.modifed_posts[i].count);
                    aqua.modifed_posts[i].changed = false;
                    aqua.modifed_posts.splice(i, 1);
                }
            }
        } else if ($(".communities-listing").length != 0) {
            for (var i = 0; i < aqua.modifed_communities.length; i++) {
                if (aqua.modifed_communities[i].state == "created" && aqua.modifed_communities[i].changed) {
                    $("li#community-" + aqua.modifed_communities[i].id + " .favorited").removeClass("none")
                    aqua.modifed_communities[i].changed = false;
                    aqua.modifed_communities.splice(i, 1);
                } else if (aqua.modifed_communities[i].state == "deleted" && aqua.modifed_communities[i].changed) {
                    $("li#community-" + aqua.modifed_communities[i].id + " .favorited").addClass("none")
                    aqua.modifed_communities[i].changed = false;
                    aqua.modifed_communities.splice(i, 1);
                }
            }
        }
    },
    initToggle: function () {
        var elt = $("[data-toggle]");
        if (!elt.length) return;
        elt.off("click").on("click", function () {
            var target = $(elt.attr("data-toggle"));
            if (target.hasClass("none")) {
                wiiuSound.playSoundByName('', 3);
                wiiuSound.playSoundByName('SE_OLV_BALLOON_OPEN', 3);
                target.removeClass("none");
            } else {
                wiiuSound.playSoundByName('', 3);
                wiiuSound.playSoundByName('SE_OLV_BALLOON_CLOSE', 3);
                target.addClass("none");
            }
        })
    },
    initSpoiler: function () {
        var els = $("a.hidden-content-button");
        if (!els) return;
        els.off("click").on("click", function (e) {
            e.preventDefault();
            wiiuSound.playSoundByName("SE_WAVE_OK_SUB", 3)
            var el = $(e.currentTarget);
            var postToShow = el.parent().parent().parent().parent().parent();
            postToShow.removeClass("hidden");
            el.html("");
            el.parent().parent().html("");
        });
    },
    openCaptureModal: function (capture) {
        var viewer = $(".screenshot-viewer-screenshot, .screenshot-img-wrapper, .screenshot-img-wrapper div");
        var picture = $(".screenshot-viewer-screenshot div div img");
        if (viewer.hasClass("none")) {
            aqua.scrollPosition = window.scrollY;
            $("div:not(.screenshot-viewer-screenshot, body, #body), #menu-bar, header").addClass("none");
            viewer.removeClass("none");
            picture.attr("src", $(capture).children(":first-child").attr("src"));
        } else {
            $("div:not(.screenshot-viewer-screenshot, body, #body), #menu-bar, header").removeClass("none")
            viewer.addClass("none");
            window.scrollTo(0, aqua.scrollPosition)
        }
    },
    favoriteCommunity: function () {
        var favoriteBtn = $(".favorite-button.button");
        favoriteBtn.prop("disabled", true);
        wiiuBrowser.lockUserOperation(true);
        var id = $("header.header.with-data").attr("data-community-id");
        var xml = new XMLHttpRequest();
        xml.open("POST", "https://api.olv.nonamegiven.xyz/v1/communities/" + id + "/favorite");
        xml.send();
        xml.onreadystatechange = function () {
            if (xml.readyState === 4) {
                if (xml.status === 200) {
                    var response = JSON.parse(xml.responseText).result;
                    if (favoriteBtn.hasClass("checked")) {
                        var existingIndex = -1;
                        for (var i = 0; i < aqua.modifed_communities.length; i++) {
                            if (aqua.modifed_communities[i].id === id) {
                                existingIndex = i;
                                break;
                            }
                        }
                        if (existingIndex !== -1) {
                            aqua.modifed_communities[existingIndex].state = response;
                            aqua.modifed_communities[existingIndex].changed = true;
                        } else {
                            aqua.modifed_communities.push({ id: id, state: response, changed: true });
                        }
                        wiiuBrowser.lockUserOperation(false);
                        wiiuSound.playSoundByName("SE_OLV_MII_CANCEL", 3);
                        favoriteBtn.prop("disabled", false);
                        favoriteBtn.removeClass("checked");
                    } else {
                        var existingIndex = -1;
                        for (var i = 0; i < aqua.modifed_communities.length; i++) {
                            if (aqua.modifed_communities[i].id === id) {
                                existingIndex = i;
                                break;
                            }
                        }
                        if (existingIndex !== -1) {
                            aqua.modifed_communities[existingIndex].state = response;
                            aqua.modifed_communities[existingIndex].changed = true;
                        } else {
                            aqua.modifed_communities.push({ id: id, state: response, changed: true });
                        }
                        wiiuBrowser.lockUserOperation(false);
                        wiiuSound.playSoundByName("SE_OLV_MII_ADD", 3);
                        favoriteBtn.prop("disabled", false);
                        favoriteBtn.addClass("checked");
                    }
                }
                else {
                    wiiuBrowser.lockUserOperation(false);
                    wiiuErrorViewer.openByCodeAndMessage(155299, 'There was an error favoriting this community.')
                    favoriteBtn.prop("disabled", false);
                }
            }
        }
    },
    initPostModal: function () {
        if (!$("#add-new-post-modal").length && !$(".add-post-button").length) return;

        var screenshotToggleButton = $(".screenshot-toggle-button");
        if (wiiuMainApplication.getScreenShot(true) || wiiuMainApplication.getScreenShot(false)) {
            screenshotToggleButton.removeClass("none");
            $(".screenshot-toggle-container .screenshot-gp").attr("src", "data:image/png;base64," + wiiuMainApplication.getScreenShot(false));
            $(".screenshot-toggle-container .screenshot-tv").attr("src", "data:image/png;base64," + wiiuMainApplication.getScreenShot(true));
        }

        $(".screenshot-toggle-button").on("click", function () {
            $(".screenshot-toggle-container").toggleClass("none")
        })

        var screenshotInput = $("#screenshot_val_input");
        var cancelScreenshot = $(".screenshot-toggle-container .cancel-toggle-button");

        var screenshotLis = $(".screenshot-toggle-container li");
        screenshotLis.on("click", sLiClick);

        cancelScreenshot.on("click", sSelectorReset);

        function sLiClick(event) {
            var eLi = $(event.currentTarget);
            $.each(screenshotLis, function (index, li) {
                if (li !== eLi) {
                    $(li).find("img").removeClass("checked");
                }
            });
            eLi.find("img").addClass("checked");
            if (eLi.find("input").val() === "top") {
                $(screenshotToggleButton).css({
                    'background': 'url(data:image/png;base64,' + wiiuMainApplication.getScreenShot(true) + ')',
                    'background-size': 'cover'
                });
                screenshotInput.val(wiiuMainApplication.getScreenShot(true));
            } else if (eLi.find("input").val() === "bottom") {
                screenshotInput.val(wiiuMainApplication.getScreenShot(false));
                $(screenshotToggleButton).css({
                    'background': 'url(data:image/png;base64,' + wiiuMainApplication.getScreenShot(false) + ')',
                    'background-size': 'cover'
                });
            } else {
                screenshotInput.val("");
            }
            $(".screenshot-toggle-container").toggleClass("none")
        }

        function sSelectorReset() {
            var bgAlbum = "data:image/png;base64,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";
            $.each(screenshotLis, function (index, li) {
                $(li).find("img").removeClass("checked");
            });
            screenshotToggleButton.css({
                'background': 'url(' + bgAlbum + ') center center no-repeat, ' +
                    '-webkit-gradient(linear, left top, left bottom, from(#ffffff), color-stop(0.5, #ffffff), ' +
                    'color-stop(0.8, #f6f6f6), color-stop(0.96, #f5f5f5), to(#bbbbbb)) 0 0',
                'background-size': 'initial'
            });
            screenshotInput.val("");
            $(".screenshot-toggle-container").toggleClass("none")
        }

        var feelingInputs = $(".feeling-selector.expression .buttons li");
        var userMii = $('.mii-icon-container');
        var spoilerLabel = $('.spoiler-button');
        var postTypeLi = $('.textarea-menu li label');
        var postButton = $('.ok-confirm-post-button');

        $('.textarea-menu-text-input').on('input', function () {
            syncTextAreas($(this).val());
        });

        $('.textarea-text').on('input', function () {
            syncTextAreas($(this).val());
        });

        function syncTextAreas(value) {
            $('.textarea-text').val(value);
            $('.textarea-menu-text-input').val(value);
        }

        function addClassType(label) {
            $(postTypeLi).each(function (index, ty) {
                if (!$(ty).is(label)) {
                    $(ty).removeClass("checked");
                }
            });
            $(label).addClass("checked");
        }

        function addClassFeeling(li) {
            $.each(feelingInputs, function (index, feelingLi) {
                if (!$(feelingLi).is(li)) {
                    $(feelingLi).removeClass("checked");
                }
            });
            $(li).addClass("checked");
            var feelingUrl = $(li).find('input[type="radio"]').data("mii-face-url");
            changeImageSource(feelingUrl);
        }

        function changeImageSource(feelingUrl) {
            var userMiiImg = userMii.find('.icon');
            $(userMiiImg).attr("src", feelingUrl);
        }

        function changePostType(li) {
            if (li.id == 'text') {
                $('.textarea-text').prop('disabled', false);
                $('.textarea-memo-value').prop('disabled', true);
                $('.textarea-memo').addClass('none');
                $('.textarea-text').removeClass('none');
            } else if (li.id == 'memo') {
                $('.textarea-text').prop('disabled', true);
                $('.textarea-memo-value').prop('disabled', false);
                $('.textarea-text').addClass('none');
                $('.textarea-memo').removeClass('none');
                $('.textarea-memo-trigger').on('click', makeMemo);
                makeMemo();
                function makeMemo() {
                    wiiuMemo.open(false);
                    $('.textarea-memo-preview').css('background-image', 'url(data:image/png;base64,' + wiiuMemo.getImage(false) + ')');
                    $('.textarea-memo-value').val(wiiuMemo.getImage(true));
                }
            }
        }

        function toggleSpoilerClass(event) {
            var label = $(event.currentTarget);
            var input = label.find('input[type="checkbox"]');
            if (input.prop('checked')) {
                wiiuSound.playSoundByName('SE_OLV_CHECKBOX_CHECK', 3);
                label.addClass('checked');
            } else {
                wiiuSound.playSoundByName('SE_OLV_CHECKBOX_UNCHECK', 3);
                label.removeClass('checked');
            }
        }

        function feelingClick() {
            addClassFeeling(this);
            $('.feeling-selector.expression').toggleClass('none');
            wiiuSound.playSoundByName('SE_OLV_BALLOON_CLOSE', 3);
        }

        function liClick(event) {
            addClassType(event.currentTarget);
            changePostType(event.currentTarget);
        }

        $(spoilerLabel).on('click', toggleSpoilerClass);

        $.each(feelingInputs, function (index, fe) {
            $(fe).on('click', feelingClick);
        });

        $.each(postTypeLi, function (index, li) {
            $(li).on('click', liClick);
        });

        $(".mii-icon-container").on('click', function () {
            $(".feeling-selector").toggleClass("none")
        });

        $(postButton).on('click', makeNewPost);

        function makeNewPost() {
            wiiuBrowser.lockUserOperation(true);
            wiiuBrowser.lockHomeButtonMenu(true);
            var type_radios = $('input[name="_post_type"]');
            var type_of_post;

            type_radios.each(function () {
                if ($(this).prop('checked')) {
                    type_of_post = $(this).val();
                }
            });

            if (type_of_post == 'body' && !$('.textarea-text').val()) {
                wiiuDialog.alert('Please input text in your post.', 'OK');
                wiiuBrowser.lockUserOperation(false);
                wiiuBrowser.lockHomeButtonMenu(false);
                return;
            }

            postButton.addClass('disabled');
            postButton.off("click", makeNewPost);
            var aquaForm = new FormData();
            var feeling_radios = $('input[name="feeling_id"]');
            var checked_feeling;

            feeling_radios.each(function () {
                if ($(this).prop('checked')) {
                    checked_feeling = $(this).val();
                }
            });

            aquaForm.append('feeling_id', checked_feeling);
            aquaForm.append('community_id', $("header.header").data('community-id'));

            var spoilerStatus = $('.spoiler_input');
            var spoilerVal;
            if (spoilerStatus.prop('checked')) {
                spoilerVal = 1;
            } else {
                spoilerVal = 0;
            }

            if (screenshotInput.val() || screenshotInput.val() !== '') {
                aquaForm.append('screenshot', screenshotInput.val());
            }

            var titleIDhex = $("header.header").data("community-title-id-hex");
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
                aquaForm.append('body', $('.textarea-text').val());
            } else if (type_of_post == 'painting') {
                aquaForm.append('painting', $('.textarea-memo-value').val());
            }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.olv.nonamegiven.xyz/v1/posts');
            xhr.send(aquaForm);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        postButton.removeClass('disabled');
                        postButton.on("click", makeNewPost);
                        wiiuBrowser.lockUserOperation(false);
                        wiiuBrowser.lockHomeButtonMenu(false);
                        window.location.reload()
                    }
                    else {
                        wiiuErrorViewer.openByCodeAndMessage(155289, 'There was an error making a new post, Please try again later.')
                        postButton.removeClass('disabled');
                        postButton.on("click", makeNewPost);
                        wiiuBrowser.lockUserOperation(false);
                        wiiuBrowser.lockHomeButtonMenu(false);
                    }
                }
            }

        }

    },
    openPostModal: function () {
        aqua.scrollPosition = window.scrollY;
        $("#menu-bar").addClass("none");
        $(".header").addClass("none");
        $(".header-banner-container").addClass("none");
        $(".community-info").addClass("none");
        $(".community-type").addClass("none");
        $(".community-post-list").addClass("none");
        $(".post-permalink").addClass("none");
        $("#add-new-post-modal").removeClass("none")
    },
    closePostModal: function () {
        $("#add-new-post-modal").addClass("none")
        $("#menu-bar").removeClass("none");
        $(".header").removeClass("none");
        $(".header-banner-container").removeClass("none");
        $(".community-info").removeClass("none");
        $(".community-type").removeClass("none");
        $(".community-post-list").removeClass("none");
        $(".post-permalink").removeClass("none");
        window.scrollTo(0, aqua.scrollPosition)
    },
    prepareBOSS: function () {
        var isBOSSEnabled = wiiuLocalStorage.getItem("boss_state");
        if (isBOSSEnabled == "true") {
            if (!wiiuBOSS.isRegisteredDirectMessageTask().isRegistered) {
                aqua.setBOSS(true);
            }
        }
    },
    setBOSS: function (set) {
        if (set) {
            wiiuLocalStorage.setItem("boss_state", "true");
            console.log("boss is set")
            wiiuBOSS.registerDirectMessageTaskEx(720, 2);
        } else {
            wiiuLocalStorage.removeItem("boss_state");
            console.log("boss is unset")
            wiiuBOSS.unregisterDirectMessageTask();
        }
    },
}

$(document).on("DOMContentLoaded", function () {
    wiiuBrowser.endStartUp();
    wiiuBrowser.lockUserOperation(true);
    aqua.prepareBOSS();
    aqua.initSnd();
    aqua.initPjx();
    aqua.initTbs();
    aqua.initNav();
    aqua.initScrl();
    aqua.initEmp();
    aqua.initSpoiler();
    aqua.initToggle();
    aqua.initButton();
    aqua.initPostModal();
    wiiuSound.playSoundByName("BGM_OLV_MAIN", 3);
    setTimeout(function () {
        wiiuSound.playSoundByName("BGM_OLV_MAIN_LOOP_NOWAIT", 3);
    }, 90000);
    wiiuBrowser.lockUserOperation(false);
})

$(document).on("pjax:click", function () {
    wiiuBrowser.lockUserOperation(true);
})

$(document).on("pjax:error", function () {
    wiiuBrowser.lockUserOperation(false);
    wiiuErrorViewer.openByCodeAndMessage(115000, "There was an error loading content.");
})

$(document).on("pjax:end", function () {
    wiiuBrowser.lockUserOperation(false);
})

$(document).on("pjax:end", function () {
    aqua.initTbs();
    aqua.initSnd();
    aqua.initNav();
    aqua.initScrl();
    aqua.initEmp();
    aqua.initPopstate();
    aqua.initSpoiler();
    aqua.initToggle();
    aqua.initButton();
    aqua.initPostModal();
})