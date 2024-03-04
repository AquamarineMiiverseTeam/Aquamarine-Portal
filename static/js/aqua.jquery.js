var aqua = {
    modifed_posts: [],
    modifed_communities: [],
    scrollPosition: 0,
    modal_open: false,
    initSnd: function () {
        var e = $("[data-sound]");

        function playSnd(event) {
            wiiuSound.playSoundByName($(event.currentTarget).attr("data-sound"), 3);
        }

        e.off("click").on("click", playSnd);
    },
    initButton: function () {
        setInterval(inputButton, 50);
        function inputButton() {
            wiiu.gamepad.update();

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
            $("#menu-bar-messages a .badge").css("display", "none")
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
            $("#menu-bar-news a .badge").css("display", "none")
        } else if (path.indexOf("/notifications/friend_requests") !== -1) {
            for (var i = 0; i < el.length; i++) {
                $(el[i]).removeClass("selected")
            }
            news.addClass("selected");
            $("#menu-bar-news a .badge").css("display", "none")
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
                            $(cont).append(xhttp.responseText);

                            aqua.initSnd();
                            aqua.initEmp();
                            aqua.initPopstate();
                            aqua.initSpoiler();
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
                                    el.text($(el).attr("data-yeah-text"));
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
                                    el.text($(el).attr("data-unyeah-text"));
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
                                    el.text($(el).attr("data-yeah-text"));
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
                                    el.text($(el).attr("data-unyeah-text"));
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
        if (aqua.modal_open) {
            aqua.modal_open = false
            $("body div > div:not(.window-page, .window-page *, .screenshot-viewer-screenshot), header, #menu-bar").removeClass("none")
            viewer.addClass("none");
            window.scrollTo(0, aqua.scrollPosition)
        } else {
            aqua.scrollPosition = window.scrollY;
            $("body div > div:not(.window-page, .window-page *, .screenshot-viewer-screenshot), header, #menu-bar").addClass("none")
            viewer.removeClass("none");
            aqua.modal_open = true
            $(picture).attr("src", $(capture).find("img").attr("src"));
        }
    },
    favoriteCommunity: function () {
        var favoriteBtn = $(".favorite-button.button");
        favoriteBtn.prop("disabled", true)
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

        var top_screenshot = wiiuMainApplication.getScreenShot(true);
        var bottom_screenshot = wiiuMainApplication.getScreenShot(false);

        var screenshotToggleButton = $(".screenshot-toggle-button");
        if (wiiuMainApplication.getScreenShot(true) || wiiuMainApplication.getScreenShot(false)) {
            screenshotToggleButton.removeClass("none");
            $(".screenshot-toggle-container .screenshot-gp").attr("src", "data:image/png;base64," + bottom_screenshot);
            $(".screenshot-toggle-container .screenshot-tv").attr("src", "data:image/png;base64," + top_screenshot);
        }

        console.log($(".screenshot-toggle-button"))

        $(".screenshot-toggle-button").off("click").on("click", function () {
            $(".screenshot-toggle-container").toggleClass("none")
            console.log("Opening Screenshot Selection")
        })

        var screenshotInput = $("#screenshot_val_input");
        var cancelScreenshot = $(".screenshot-toggle-container .cancel-toggle-button");
        var screenshotLis = $(".screenshot-toggle-container li");

        screenshotLis.off("click").on("click", changeScreenshotSource);
        cancelScreenshot.off("click").on("click", sSelectorReset);

        function changeScreenshotSource(event) {
            console.log("Changing Screenshot Source")

            var currentScreenshotLi = $(event.currentTarget)
            $(".screenshot-toggle-container li img").removeClass("checked")
            currentScreenshotLi.find("img").addClass("checked")

            switch (currentScreenshotLi.find("input").val()) {
                case "top":
                    screenshotInput.val(top_screenshot);

                    $(screenshotToggleButton).css({
                             'background': 'url(data:image/png;base64,' + top_screenshot + ')',
                             'background-size': 'cover'
                    });

                    console.log("Saved TV Screenshot.")
                    break;
                case "bottom":
                    screenshotInput.val(bottom_screenshot);

                    $(screenshotToggleButton).css({
                        'background': 'url(data:image/png;base64,' + bottom_screenshot + ')',
                        'background-size': 'cover'
                    });

                    console.log("Saved DRC Screenshot.")
                    break;
                default:
                    screenshotInput.val("");
                    break;
            }

            $(".screenshot-toggle-container").toggleClass("none")
        }

        function sSelectorReset() {
            screenshotLis.find("img").removeClass("checked")

            screenshotToggleButton.css({
                'background': 'url("/img/sprsheet/screenshot_selector.png") center center no-repeat, ' +
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

        $('.textarea-menu-text-input').off("input")
        $('.textarea-menu-text-input').on('input', function () {
            syncTextAreas($(this).val());
        });

        $('.textarea-text').off("input")
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

                $('.textarea-memo-trigger').off('click', makeMemo);
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
            console.log("feeling")
            addClassFeeling(this);
            $('.feeling-selector.expression').toggleClass('none');
            wiiuSound.playSoundByName('SE_OLV_BALLOON_CLOSE', 3);
        }

        function liClick(event) {
            addClassType(event.currentTarget);
            changePostType(event.currentTarget);
        }

        $(spoilerLabel).off("click")
        $(spoilerLabel).on('click', toggleSpoilerClass);

        $.each(feelingInputs, function (index, fe) {
            $(fe).off("click", feelingClick)
            $(fe).on('click', feelingClick);
        });

        $.each(postTypeLi, function (index, li) {
            $(li).off('click', liClick);
            $(li).on('click', liClick);
        });

        $(".mii-icon-container").off("click")
        $(".mii-icon-container").on('click', function () {
            $(".feeling-selector").toggleClass("none")
        });
    },
    makePost: function makeNewPost() {
        var screenshotInput = $("#screenshot_val_input");
        var postButton = $('.ok-confirm-post-button');

        if (postButton.disabled == true) { return; }
        postButton.disabled = true;
        wiiuBrowser.lockUserOperation(true);
        wiiuBrowser.lockHomeButtonMenu(true);

        var type_of_post = $('label.checked input[name="_post_type"]').attr("value")

        if (type_of_post == 'body' && !$('.textarea-text').val()) {
            wiiuDialog.alert('Please input text in your post.', 'OK');
            wiiuBrowser.lockUserOperation(false);
            wiiuBrowser.lockHomeButtonMenu(false);
            return;
        }

        postButton.addClass('disabled');
        postButton.off("click");
        var aquaForm = new FormData();
        var checked_feeling = $('.buttons li.checked input[name="feeling_id"]').attr("value")

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
                    $.pjax.reload("#body", {
                        fragment: "#body",
                        container: "#body",
                    });
                    wiiuBrowser.lockUserOperation(false);
                    wiiuBrowser.lockHomeButtonMenu(false);

                    aqua.modal_open = false;
                }
                else {
                    wiiuErrorViewer.openByCodeAndMessage(155289, 'There was an error making a new post, Please try again later.')
                    wiiuBrowser.lockUserOperation(false);
                    wiiuBrowser.lockHomeButtonMenu(false);
                }
            }
        }

    },
    toggleCommunityPostModal: function () {
        if (aqua.modal_open) {
            window.scrollTo(0, aqua.scrollPosition)
            $("body div > div:not(.window-page, .window-page *, .screenshot-viewer-screenshot), header, #menu-bar").removeClass("none")
            $("#add-new-post-modal").addClass("none")
            aqua.modal_open = false
        } else {
            $("body div > div:not(.window-page, .window-page *, .screenshot-viewer-screenshot), header, #menu-bar").addClass("none")
            $("#add-new-post-modal").removeClass("none")
            aqua.scrollPosition = window.scrollY;
            aqua.modal_open = true
        }
    },
    toggleCommunityViewSettingsModal: function() {
        if (aqua.modal_open) {
            window.scrollTo(0, aqua.scrollPosition)
            $("body div > div:not(.window-page, .window-page *, .screenshot-viewer-screenshot), header, #menu-bar").toggleClass("none")
            $("#change-settings-modal").toggleClass("none")
            aqua.modal_open = false
        } else {
            $("body div > div:not(.window-page, .window-page *, .screenshot-viewer-screenshot), header, #menu-bar").toggleClass("none")
            $("#change-settings-modal").toggleClass("none")
            aqua.scrollPosition = window.scrollY;
            aqua.modal_open = true
        }
    },
    prepareBOSS: function () {
        wiiuBOSS.unregisterDirectMessageTask();
        if (!wiiuBOSS.isRegisteredDirectMessageTask().isRegistered) {
            wiiuBOSS.registerDirectMessageTaskEx(720, 2);
        }
    },
    setTutorialAsRead: function (tutorial) {
        var tutorialType = $(tutorial).attr("data-tutorial");
        var tutorialReqObj = {
            tutorial_id : tutorialType
        }

        var tutorialReq = new XMLHttpRequest();
        tutorialReq.open("POST", "https://api.olv.nonamegiven.xyz/v2/tutorials")
        tutorialReq.setRequestHeader("Content-Type", "application/json")
        tutorialReq.send(JSON.stringify(tutorialReqObj));
        $(".tutorial-window").addClass("none")
    },
    checkNotifications: function () {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "https://api.olv.nonamegiven.xyz/v2/notifications")
        xhttp.send()

        xhttp.onreadystatechange = function(e) {
            if (xhttp.readyState == xhttp.DONE) {
                switch (xhttp.status) {
                    case 200:
                        var responseObj = JSON.parse(xhttp.responseText)
                        
                        if (responseObj.notifications.notifications_length >= 1) {
                            if (responseObj.notifications.notifications_length > 99) {
                                $("#menu-bar-news a .badge").text("99+")
                            } else {
                                $("#menu-bar-news a .badge").text(String(responseObj.notifications.notifications_length))
                            }
                            
                            $("#menu-bar-news a .badge").css("display", "block")
                        }

                        if (responseObj.notifications.messages_length >= 1) {
                            if (responseObj.notifications.messages_length > 99) {
                                $("#menu-bar-news a .badge").text("99+")
                            } else {
                                $("#menu-bar-news a .badge").text(String(responseObj.notifications.messages_length))
                            }

                            $("#menu-bar-news a .badge").css("display", "block")
                        }
                        break;
                    case 204:
                    default:
                        $("a .badge").css("display", "none")
                        break;
                }
            }
        }
    }
}

$(document).on("DOMContentLoaded", function () {
    aqua.prepareBOSS();
    aqua.initSnd();
    aqua.initPjx();
    aqua.initTbs();
    aqua.initNav();
    aqua.initPostModal();
    aqua.initScrl();
    aqua.initEmp();
    aqua.initSpoiler();
    aqua.initToggle();
    aqua.initButton();
    wiiuSound.playSoundByName("BGM_OLV_MAIN", 3);
    setInterval(function () {
        wiiuSound.playSoundByName("BGM_OLV_MAIN_LOOP_NOWAIT", 3);
    }, 90000);
    setInterval(aqua.checkNotifications, 15000);
    wiiuBrowser.endStartUp();
})

$(document).on("pjax:click", function () {
    wiiuBrowser.lockUserOperation(true);
})

$(document).on("pjax:end", function () {
    if ($("[data-tab-query]").length) aqua.initTbs();
    if ($("[data-sound]").length) aqua.initSnd();
    aqua.initNav();
    aqua.initScrl();
    if ($("#add-new-post-modal").length && $(".add-post-button").length) aqua.initPostModal();
    if ($("button[data-post-id].miitoo-button").length) aqua.initEmp();
    if (aqua.modifed_communities.length || aqua.modifed_posts.length) aqua.initPopstate();
    if ($("a.hidden-content-button").length) aqua.initSpoiler();
    if ($("[data-toggle]").length) aqua.initToggle();
    wiiuBrowser.lockUserOperation(false);
})