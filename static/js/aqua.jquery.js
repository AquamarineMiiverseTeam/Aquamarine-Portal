var aqua = {
    modifed_posts: [],
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
        function checkScroll() {
            if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
                $(document).trigger("aqua:scroll-end")
            }
        }

        if (!$("[data-scroll-event]").length >= 1) {
            $(document).off("scroll");
            $(document).off("aqua:scroll-end")
            return;
        }

        var currently_downloading = false;
        function download() {
            if (currently_downloading) { return; }
            var url = $("[data-scroll-url]").attr("data-scroll-url")
            var cont = $("[data-scroll-container]").attr("data-scroll-container")
            var query;
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
                            $(cont).children()[$(cont).children().length - 1].outerHTML += xhttp.responseText;
                            aqua.initSnd();
                            currently_downloading = false;
                            break;
                        case 204:
                            $("#loading").hide()
                            currently_downloading = false;
                            break;
                        default:
                            $("#loading").hide()
                            currently_downloading = false;
                            break;
                    }
                } else {
                    $("#loading").show()
                }
            }
        }

        $(document).on("aqua:scroll-end", download)
        $(document).on("scroll", checkScroll);
    },
    initEmp: function () {
        var els = $("button[data-post-id].miitoo-button");

        if (!els.length) return;

        els.off('click').on("click", yeah);

        function yeah(e) {
            wiiuSound.playSoundByName('', 1);
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
                                    wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
                                    count.removeClass('added');
                                    el.text("Yeah!");
                                    if (count) {
                                        var countText = parseInt(count.text());
                                        count.text(countText - 1);
                                    }
                                } else if (!count.hasClass('added') && response == "created") {
                                    wiiuSound.playSoundByName('SE_OLV_MII_ADD', 1);
                                    count.addClass('added');
                                    el.text("Unyeah!");
                                    if (count) {
                                        var countText = parseInt(count.text());
                                        count.text(++countText);
                                    }
                                }
                            } else {
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
    initEmpPopstate: function () {
        if ($("#post_list").length == 0) { return; }
        for (var i = 0; i < aqua.modifed_posts.length; i++) {
            if (aqua.modifed_posts[i].state == "created" && aqua.modifed_posts[i].changed) {
                $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta button").text("Unyeah!")
                $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta a .feeling").addClass("added")
                $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta a .feeling").text(aqua.modifed_posts[i].count);
                aqua.modifed_posts[i].changed = false;
            } else if (aqua.modifed_posts[i].state == "deleted" && aqua.modifed_posts[i].changed) {
                $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta button").text("Yeah!")
                $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta a .feeling").removeClass("added")
                $("#post-" + aqua.modifed_posts[i].id + " .post-body-content .post-body .post-meta a .feeling").text(aqua.modifed_posts[i].count);
                aqua.modifed_posts[i].changed = false;
                aqua.modifed_posts.splice(i, 1);
            }
        }
    }
}

$(document).on("DOMContentLoaded", function () {
    wiiuBrowser.endStartUp();
    wiiuBrowser.lockUserOperation(true);
    aqua.initSnd();
    aqua.initPjx();
    aqua.initTbs();
    aqua.initNav();
    aqua.initScrl();
    aqua.initEmp();
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
    aqua.initEmpPopstate();
})