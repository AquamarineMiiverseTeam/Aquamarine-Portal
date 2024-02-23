var aqua = {
    modifed_posts: [],
    modifed_communities: [],
    scrollPosition: 0,
    initSnd: function () {
        var e = $("[data-sound]");
        if (!e) { return; }

        function playSnd(event) {
            var soundName = $(event.currentTarget).attr("data-sound");
            wiiuSound.playSoundByName(soundName, 3);
        }

        e.off("click").on("click", playSnd);
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
                                    } else if (miis.length == 2) {
                                        $(".empathy_you").addClass("none")
                                        $(".empathy_and").addClass("none")
                                        $(".empathy_person").removeClass("none")
                                        $(".empathy_other_person").addClass("none")
                                        miiVisitor.css("display", "none");
                                    } else {
                                        $(".empathy_you").addClass("none")
                                        $(".empathy_and").addClass("none")
                                        $(".empathy_people").removeClass("none")
                                        $(".empathy_other_people").addClass("none")
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
                                        $(".empathy_number").addClass("none")
                                        $(".empathy_person").addClass("none")
                                        $(".empathy_you").removeClass("none")
                                        $(".empathy_gave").removeClass("none")
                                        miiVisitor.css("display", "inline-block");
                                        miisContainer.removeClass("none");
                                    } else if (miis.length == 2) {
                                        $(".empathy_you").removeClass("none")
                                        $(".empathy_and").removeClass("none")
                                        $(".empathy_person").addClass("none")
                                        $(".empathy_other_person").removeClass("none")
                                        miiVisitor.css("display", "inline-block");
                                    } else {
                                        $(".empathy_you").removeClass("none")
                                        $(".empathy_and").removeClass("none")
                                        $(".empathy_people").addClass("none")
                                        $(".empathy_other_people").removeClass("none")
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
        var viewer = $(".screenshot-viewer-screenshot");
        var picture = $(".screenshot-viewer-screenshot div div img");
        if (viewer.hasClass("none")) {
            aqua.scrollPosition = window.scrollY;
            $("#menu-bar").addClass("none");
            $(".header").addClass("none");
            $(".header-banner-container").addClass("none");
            $(".community-info").addClass("none");
            $(".community-type").addClass("none");
            $(".community-post-list").addClass("none");
            $(".post-permalink").addClass("none");
            picture.attr("src", $(capture).children(":first-child").attr("src"));
            viewer.removeClass("none");
        } else {
            viewer.addClass("none");
            $("#menu-bar").removeClass("none");
            $(".header").removeClass("none");
            $(".header-banner-container").removeClass("none");
            $(".community-info").removeClass("none");
            $(".community-type").removeClass("none");
            $(".community-post-list").removeClass("none");
            $(".post-permalink").removeClass("none");
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
    wiiuSound.playSoundByName("BGM_OLV_MAIN", 3);
    setTimeout(function () {
        wiiuSound.playSoundByName("BGM_OLV_MAIN_LOOP_NOWAIT", 3);
    }, 90000);
    wiiuBrowser.lockUserOperation(false);
})

$(document).on("pjax:click", function () {
    wiiuBrowser.lockUserOperation(true);
})

$(document).on("pjax:beforeReplace", function () {
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
})