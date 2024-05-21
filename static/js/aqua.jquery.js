var aqua = {
    modified_posts: [],
    modified_communities: [],
    spoiler_cache: [],
    scrollPosition: 0,
    api_domain: "https://d1-api.olv.aquamarine.lol",
    current_url: window.location.protocol + "//" + window.location.hostname,
    open_modal: null,
    open_toggle: null,
    bg_music_interval: null,
    pageType: {
        NONE: 0,
        TITLES_SHOW: 1,
        TITLES_COMMUNITIES: 2,
        COMMUNITIES: 3,
        POSTS: 4,
        USERS_ME: 5,
        MESSAGES_LIST: 6,
        NEWS_LIST: 7,
        FRIEND_REQUEST_LIST: 8,
        ACTIVITY_FEED: 9,
        ACCOUNT_CREATION: 10,
        IDENTIFIED_POSTS: 11,
        TITLES_FAVORITES: 12
    },
    buttonType: {
        13: "a",
        27: "b",
        88: "x",
        89: "y",
        76: "l",
        82: "r",
        80: "plus",
        77: "minus"
    },
    isEmpathyBeingAdded: false,
    isPostBeingSent: false,
    isLoadingMoreContentLocked: false,
    currentPage: null,
    isLoadingMoreContent: false,
    topButtonTimeout: null,
    router: {
        routes: [],
        connect: function (regex, handler) {
            this.routes.push({ regex: new RegExp(regex), handler: handler });
        },
        checkRoutes: function (url) {
            var matchFound = false;
            for (var i = 0; i < this.routes.length; i++) {
                var route = this.routes[i];
                var match = url.match(route.regex);
                if (match) {
                    matchFound = true;
                    route.handler.apply(null, match.slice(1));
                    break;
                }
            }
        }
    },
    getLoc: function (str) {
        return $("[" + str + "]").attr(str);
    },
    playSnd: function (name) {
        wiiuSound.playSoundByName(name, 3);
    },
    initSound: function () {
        var e = $("[data-sound]");

        function playSnd(event) {
            if (aqua.open_toggle) {
                aqua.open_toggle.toggle.addClass("none");
                aqua.open_toggle = null;
            }

            aqua.playSnd($(event.currentTarget).attr("data-sound"));
        }

        e.each(function () {
            var $this = $(this);
            if (!$this.data("playSndAdded")) {
                $this.on("click", playSnd);
                $this.data("playSndAdded", true);
            }
        });
    },
    initButton: function () {
        var lockW = null;

        function doButtonAction(r) {
            $('.accesskey-' + aqua.buttonType[r] + ':visible').trigger('click');
        }

        $(document).on("keypress", function (event) {
            if (lockW === null) {
                var f = event.which;
                lockW = f;
                doButtonAction(f);
            }
        });

        $(document).on("keyup", function (event) {
            if (lockW === event.which) {
                lockW = null;
            }
        });

    },
    initNavBar: function () {
        $("#menu-bar #menu-bar-exit").on("click", function () {
            setTimeout(function () { wiiuBrowser.closeApplication() }, 0);
        })

        $("#menu-bar #menu-bar-back").on("click", function () {
            history.back();
        })
    },
    setNavBarSelected: function (tab) {
        $("#menu-bar li").removeClass("selected")
        if (tab) {
            tab.addClass("selected")
        }
        var canShowBackButton = aqua.currentPage === aqua.pageType.TITLES_SHOW;

        if (wiiuBrowser.canHistoryBack() && !canShowBackButton) {
            $("#menu-bar #menu-bar-exit").addClass("none")
            $("#menu-bar #menu-bar-back").removeClass("none")
        } else {
            $("#menu-bar #menu-bar-exit").removeClass("none")
            $("#menu-bar #menu-bar-back").addClass("none")
        }
    },
    initPjax: function () {
        $.pjax.defaults.timeout = 30000

        $(document).pjax("a[data-pjax]", {
            container: ".wrapper",
            fragment: ".wrapper"
        });

        $(document).pjax("a[data-tab-query]", {
            container: ".wrapper",
            fragment: ".wrapper",
            replace: true
        });

        $(document).pjax("a[data-news]", {
            container: ".wrapper",
            fragment: ".wrapper",
            push: false,
            replace: true
        });
    },
    setUpEmpathy: function () {
        var els = $("button[data-post-id].miitoo-button");

        if (!els.length) return;

        els.each(function () {
            var $this = $(this);
            if (!$this.data("empathyListAdded")) {
                $this.on("click", yeah);
                $this.data("empathyListAdded", true);
            }
        });

        function yeah(e) {
            var el = $(e.currentTarget);

            var id = el.attr("data-post-id");
            var ematext = el.attr("data-yeah-text");
            var emdtext = el.attr("data-unyeah-text");
            var emc = +el.attr("data-empathy-count");
            var rec = +el.attr("data-reply-count");
            //post viewer miitoo
            if (el.hasClass("post-viewer-miitoo-button")) {
                if (el.hasClass('added')) {
                    aqua.playSnd('SE_OLV_MII_CANCEL');
                } else {
                    aqua.playSnd('SE_OLV_MII_ADD');
                }
                var miisContainer = $(".post-content-miis");
                var postContent = $(".post-content:not(.memo)");
                var userCount = miisContainer.find(".user-count");
                var miis = miisContainer.find(".user-icon-container");
                var miiVisitor = miisContainer.find(".user-icon-container.visitor");
                aqua.isEmpathyBeingAdded = true;
                el.prop('disabled', true);

                if (!el.attr('data-in-progress')) {
                    el.attr('data-in-progress', 'true');

                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", aqua.api_domain + "/v1/posts/" + id + "/empathies");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            el.removeAttr('data-in-progress');

                            if (xhr.status === 200) {
                                var response = JSON.parse(xhr.responseText).result;
                                if (el.hasClass('added') && response == "deleted") {
                                    emc -= 1;
                                    el.attr("data-empathy-count", emc);
                                    var existingIndex = -1;
                                    for (var i = 0; i < aqua.modified_posts.length; i++) {
                                        if (aqua.modified_posts[i].id === id) {
                                            existingIndex = i;
                                            break;
                                        }
                                    }
                                    if (existingIndex !== -1) {
                                        aqua.modified_posts[existingIndex].count = emc;
                                        aqua.modified_posts[existingIndex].state = response;
                                        aqua.modified_posts[existingIndex].changed = true;
                                    } else {
                                        aqua.modified_posts.push({ id: id, count: emc, state: response, changed: true, yeah_text: ematext, unyeah_text: emdtext });
                                    }
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
                                    var existingIndex = -1;
                                    for (var i = 0; i < aqua.modified_posts.length; i++) {
                                        if (aqua.modified_posts[i].id === id) {
                                            existingIndex = i;
                                            break;
                                        }
                                    }
                                    if (existingIndex !== -1) {
                                        aqua.modified_posts[existingIndex].count = emc;
                                        aqua.modified_posts[existingIndex].state = response;
                                        aqua.modified_posts[existingIndex].changed = true;
                                    } else {
                                        aqua.modified_posts.push({ id: id, count: emc, state: response, changed: true, yeah_text: ematext, unyeah_text: emdtext });
                                    }
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
                                wiiuErrorViewer.openByCode(1155927);
                            }

                            el.prop('disabled', false);
                            aqua.isEmpathyBeingAdded = false;
                        }
                    };
                    xhr.send();
                }
                return;
            } //post preview miitoo
            else {
                var parent = $("#post-" + id);
                var count = parent.find(".feeling");
                if (count.hasClass('added')) {
                    aqua.playSnd('SE_OLV_MII_CANCEL');
                } else {
                    aqua.playSnd('SE_OLV_MII_ADD');
                }
                el.prop('disabled', true);
                aqua.isEmpathyBeingAdded = true;

                if (!el.attr('data-in-progress')) {
                    el.attr('data-in-progress', 'true');

                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", aqua.api_domain + "/v1/posts/" + id + "/empathies");
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            el.removeAttr('data-in-progress');

                            if (xhr.status === 200) {
                                var response = JSON.parse(xhr.responseText).result;
                                if (count.hasClass('added') && response == "deleted") {
                                    count.removeClass('added');
                                    el.text($(el).attr("data-yeah-text"));
                                    if (count) {
                                        var countText = parseInt(count.text());
                                        count.text(countText - 1);
                                    }
                                } else if (!count.hasClass('added') && response == "created") {
                                    count.addClass('added');
                                    el.text($(el).attr("data-unyeah-text"));
                                    if (count) {
                                        var countText = parseInt(count.text());
                                        count.text(++countText);
                                    }
                                }
                            } else {
                                wiiuErrorViewer.openByCode(1155927);
                            }

                            el.prop('disabled', false);
                            aqua.isEmpathyBeingAdded = false;
                        }
                    };
                    xhr.send();
                }
            }
        }

    },
    initPopstate: function () {
        if ($(".post-list").length != 0) {
            for (var x = 0; x < aqua.modified_posts.length; x++) {
                var emp = aqua.modified_posts[x]
                if (emp.state == "created" && emp.changed) {
                    $("#post-" + emp.id + " .post-body-content .post-body .post-meta button").text(emp.unyeah_text);
                    $("#post-" + emp.id + " .post-body-content .post-body .post-meta a .feeling").addClass("added");
                } else if (emp.state == "deleted" && emp.changed) {
                    $("#post-" + emp.id + " .post-body-content .post-body .post-meta button").text(emp.yeah_text);
                    $("#post-" + emp.id + " .post-body-content .post-body .post-meta a .feeling").removeClass("added");
                }
                $("#post-" + emp.id + " .post-body-content .post-body .post-meta a .feeling").text(emp.count);
                emp.changed = false;
                aqua.modified_posts.splice(x, 1);
            }

            aqua.initSpoilerCache();

        } else if ($(".communities-listing").length != 0) {
            for (var y = 0; y < aqua.modified_communities.length; y++) {
                var com = aqua.modified_communities[y];
                if (com.state == "created" && com.changed) {
                    $("li#community-" + com.id + " .favorited").addClass("show")
                } else if (com.state == "deleted" && com.changed) {
                    $("li#community-" + com.id + " .favorited").removeClass("show")
                }
                $("li#community-" + com.id + " .empathy-count span").text(com.count);
                com.changed = false;
                aqua.modified_communities.splice(y, 1);
            }
        }
    },
    initSpoilerCache: function () {
        if (wiiuLocalStorage.getItem("spoiler") && JSON.parse(wiiuLocalStorage.getItem("spoiler").length < 200)) {
            aqua.spoiler_cache = JSON.parse(wiiuLocalStorage.getItem("spoiler"));
        }
        for (var e = 0; e < aqua.spoiler_cache.length; e++) {
            var hid = aqua.spoiler_cache[e];
            if ($("#post-" + hid.id).hasClass("hidden")) {
                $("#post-" + hid.id).removeClass("hidden");
                $("#post-" + hid.id + " .hidden-content").html("");
            }
        }
    },
    jumpUrl: function (url) {
        wiiuBrowser.jumpToBrowser(url);
    },
    initToggle: function () {
        var elt = $("[data-toggle]");
        if (!elt) return;

        elt.each(function () {
            var toggle = $(this);
            if (!toggle.data("toggleAdded")) {
                toggle.on("click", function () {
                    var target = $($(this).attr("data-toggle"));
                    if (aqua.open_toggle && aqua.open_toggle.toggler != $(this).attr("data-toggle")) {
                        aqua.open_toggle.toggle.addClass("none");
                        aqua.open_toggle = null;
                    }
                    if (target.hasClass("none")) {
                        aqua.open_toggle = { toggle: target, toggler: $(this).attr("data-toggle") };
                        aqua.playSnd('SE_OLV_BALLOON_OPEN');
                        target.removeClass("none");
                    } else {
                        aqua.playSnd('SE_OLV_BALLOON_CLOSE');
                        target.addClass("none");
                        aqua.open_toggle = null;
                    }
                });
                toggle.data("toggleAdded", true);
            }

            $(toggle.attr("data-toggle")).find("li a.checkbox-button").each(function () {
                var checkbox = $(this);
                if (!checkbox.data("checkListAdd")) {
                    checkbox.on("click", function () {
                        $(toggle.attr("data-toggle")).find("li a").removeClass("selected");
                        checkbox.addClass("selected");
                    });
                    checkbox.data("checkListAdd", true);
                }
            });
        });

    },
    ifToggleClose: function (w) {
        if (aqua.open_toggle) {
            if (w === 1) {
                aqua.playSnd('SE_OLV_BALLOON_CLOSE');
            }
            aqua.open_toggle.toggle.addClass("none");
            aqua.open_toggle = null;
        }
    },
    ifModalClose: function () {
        if (aqua.open_modal) {
            aqua.open_modal.close();
        }
    },
    initSpoiler: function () {
        var els = $("a.hidden-content-button");
        if (!els) return;

        els.each(function () {
            var s = $(this);
            if (!s.data("spoilerListener")) {
                s.on("click", function (evt) {
                    evt.preventDefault();
                    var el = $(evt.currentTarget);
                    var postToShow = el.parent().parent().parent().parent().parent();
                    aqua.spoiler_cache.push({ id: postToShow.attr('id').replace("post-", "") });
                    wiiuLocalStorage.setItem("spoiler", JSON.stringify(aqua.spoiler_cache))
                    postToShow.removeClass("hidden");
                    el.parent().parent().html("");
                });
                s.data("spoilerListener", true);
            }
        });
    },
    setCommunityBtns: function () {
        if ($(".community-info").data("communityBtnSet")) { return; }
        var favoriteBtn = $(".favorite-button.button");
        favoriteBtn.on("click", function () {
            if (favoriteBtn.hasClass("checked")) {
                aqua.playSnd("SE_OLV_MII_CANCEL");
            } else {
                aqua.playSnd("SE_OLV_MII_ADD");
            }

            favoriteBtn.prop("disabled", true);
            var id = $("header.header.with-data").attr("data-community-id");
            var count = +favoriteBtn.attr("data-favorite-count");
            var xhr = new XMLHttpRequest();
            xhr.open("POST", aqua.api_domain + "/v1/communities/" + id + "/favorite");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText).result;
                        if (favoriteBtn.hasClass("checked") && response == "deleted") {
                            count -= 1;
                            favoriteBtn.attr("data-favorite-count", count);
                            var existingIndex = -1;
                            for (var i = 0; i < aqua.modified_communities.length; i++) {
                                if (aqua.modified_communities[i].id === id) {
                                    existingIndex = i;
                                    break;
                                }
                            }
                            if (existingIndex !== -1) {
                                aqua.modified_communities[existingIndex].state = response;
                                aqua.modified_communities[existingIndex].changed = true;
                                aqua.modified_communities[existingIndex].count = count;
                            } else {
                                aqua.modified_communities.push({ id: id, state: response, count: count, changed: true });
                            }
                            favoriteBtn.prop("disabled", false);
                            favoriteBtn.removeClass("checked");
                        } else if (!favoriteBtn.hasClass("checked") && response == "created") {
                            count += 1;
                            favoriteBtn.attr("data-favorite-count", count);
                            var existingIndex = -1;
                            for (var i = 0; i < aqua.modified_communities.length; i++) {
                                if (aqua.modified_communities[i].id === id) {
                                    existingIndex = i;
                                    break;
                                }
                            }
                            if (existingIndex !== -1) {
                                aqua.modified_communities[existingIndex].state = response;
                                aqua.modified_communities[existingIndex].changed = true;
                                aqua.modified_communities[existingIndex].count = count;
                            } else {
                                aqua.modified_communities.push({ id: id, state: response, count: count, changed: true });
                            }
                            favoriteBtn.prop("disabled", false);
                            favoriteBtn.addClass("checked");
                        }
                    }
                    else {
                        wiiuErrorViewer.openByCodeAndMessage(155299, 'There was an error favoriting this community.')
                        favoriteBtn.prop("disabled", false);
                    }
                }
            }
            xhr.send();
        })

        var communitySetBtn = $(".settings-button.button");
        var settingsModal = new aqua.modalManager($("#change-settings-modal"));

        var appJumpBtn = $(".app-jump-button.button");
        var appJumpModal = new aqua.modalManager($("#app-jump-modal"), jumpToAppTitle);

        appJumpModal.modal.find(".eshop-button").on("click", function () {
            var titleId = $("header.header.with-data").attr("data-community-title-id-hex").split(",")[0];
            wiiuBrowser.jumpToEshop('version=1.0.0&scene=detail&dst_title_id=' + titleId + '&src_title_id=0005003010016100');
        })

        var appJumpTIDs = $("header.header.with-data").attr("data-community-title-id-hex").split(",").map(function (tid) {
            return tid.replace(/^0{3}/, '');
        });

        var g;
        var isVino = false;

        for (var h = 0; h < appJumpTIDs.length; h++) {
            if (wiiuDevice.existsTitle(appJumpTIDs[h])) {
                if (appJumpTIDs[h] == '5000010013000' || appJumpTIDs[h] == '500301001310a' || appJumpTIDs[h] == '500301001320a') {
                    isVino = true;
                }
                g = appJumpTIDs[h];
                break;
            }
        }

        function jumpToAppTitle() {
            if (g && !isVino) {
                wiiuBrowser.jumpToApplication(g, 1, 0, '', '')
            } else if (g && isVino) {
                wiiuBrowser.jumpToTvii();
            } else {
                wiiuDialog.alert(aqua.getLoc('data-app-jump-error-text'), aqua.getLoc('data-app-jump-ok-text')), appJumpModal.close();
            }
        }


        $(".community-settings-dropdown .community-settings-drop").on("change", function () {
            var newT = $(this).children('option:selected').text();
            $(".community-settings-dropdown span").text(newT);
        })

        communitySetBtn.on("click", function () {
            settingsModal.open();
        })

        if (appJumpBtn.length) {
            appJumpBtn.on("click", function () {
                appJumpModal.open();
            })
        }

        $(".community-info").data("communityBtnSet", true);
    },
    setUpPostJumpButtons: function () {

        var urlBtn = $(".button.link-button");
        var urlModal = new aqua.modalManager($("#url-jump-modal"), urlJumper);

        function urlJumper() {
            aqua.jumpUrl(aqua.open_modal.modal.attr("data-url"));
        }

        urlBtn.on("click", function () {
            urlModal.open();
        })

    },
    setUpPosting: function () {
        if ($("#add-new-post-modal").data("isReady")) { return; }
        var postTog = $(".add-post-button");
        var scrSel = $(".screenshot-toggle-button");
        var scrTV;
        var scrDRC;
        var defaultScr = new Image();
        defaultScr.src = "/img/sprsheet/screenshot_selector.png";
        var postModal = new aqua.modalManager($("#add-new-post-modal"), sendPost)

        function sendPost() {
            if (aqua.isPostBeingSent) { return; }

            aqua.isPostBeingSent = true;
            $('.button.ok-confirm-post-button').addClass('disabled').removeAttr('href');
            wiiuBrowser.lockHomeButtonMenu(true);

            var type_of_post = $('label.checked input[name="_post_type"]').val();
            var owns_title;
            var titleIDTest = $("header.header.with-data").attr("data-community-title-id-hex").split(",");

            if (type_of_post == 'body' && !$('.textarea-text').val()) {
                wiiuDialog.alert(aqua.getLoc('data-no-text-error'), aqua.getLoc('data-no-text-ok-text'));
                wiiuBrowser.lockHomeButtonMenu(false);
                wiiuBrowser.showLoadingIcon(false);
                $('.button.ok-confirm-post-button').removeClass('disabled').attr('href', 'javascript:void(0)');
                aqua.isPostBeingSent = false;
                return;
            }

            wiiuDialog.showLoading(aqua.getLoc('data-loading-text'));

            for (var q = 0; q < titleIDTest.length; q++) {
                if (wiiuDevice.existsTitle(titleIDTest[q])) {
                    owns_title = titleIDTest[q];
                    break;
                }
            }

            var postObj = new FormData();
            if (type_of_post === 'body') {
                postObj.append("body", $('.textarea-text').val());
            } else {
                postObj.append("painting", $('.textarea-memo-value').val());
            }

            postObj.append("owns_title", owns_title ? 1 : 0);
            if ($("#screenshot_val_input").val().length !== 0) {
                postObj.append("screenshot", $("#screenshot_val_input").val().replace(/^data:image\/\w+;base64,/, ''));
            }

            if ($(".topic-entry .tag-entry").val().length !== 0) {
                postObj.append("topic_tag", $(".topic-entry .tag-entry").val());
            }

            postObj.append("community_id", +$("header.with-data").attr("data-community-id"))
            postObj.append("feeling_id", +$(".feeling-selector .buttons li.checked input").val())

            $('.spoiler-button').find('input[type="checkbox"]').is(':checked') ? postObj.append("spoiler", 1) : postObj.append("spoiler", 0);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', aqua.api_domain + "/v2/posts");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 201) {
                        wiiuMemo.reset();
                        wiiuDialog.hideLoading();
                        aqua.open_modal.close();
                        wiiuBrowser.lockUserOperation(true);
                        $.pjax({ url: aqua.current_url + "/communities/" + $("header.with-data").attr("data-community-id"), fragment: ".wrapper", container: ".wrapper", push: false, replace: true })
                        wiiuBrowser.lockHomeButtonMenu(false);
                        $('.button.ok-confirm-post-button').removeClass('disabled').attr('href', 'javascript:void(0)');
                        aqua.isPostBeingSent = false;
                    }
                    else {
                        wiiuMemo.reset();
                        wiiuDialog.hideLoading();
                        wiiuErrorViewer.openByCodeAndMessage(155289, 'There was an error making a new post, Please try again later.')
                        wiiuBrowser.lockHomeButtonMenu(false);
                        $('.button.ok-confirm-post-button').removeClass('disabled').attr('href', 'javascript:void(0)');
                        aqua.isPostBeingSent = false;
                    }
                }
            }
            xhr.send(postObj);

        }

        function openMemo() {
            if (!wiiuDevice.isDrc()) {
                wiiuDialog.alert(aqua.getLoc('data-no-drc-memo-text'), aqua.getLoc('data-no-text-ok-text'));
                return;
            }
            
            wiiuMemo.open(false);
            var intervalId = setInterval(function () {
                if (wiiuMemo.isFinish()) {
                    clearInterval(intervalId);
                    $('.textarea-memo-value').val(wiiuMemo.getImage(true));
                    $(".textarea-container .textarea-memo-preview").attr('src', 'data:image/png;base64,' + wiiuMemo.getImage(false));
                }
            }, 100);
        }

        wiiuMainApplication.getScreenShot(true) ? scrSel.removeClass("none") : "";

        if (wiiuMainApplication.getScreenShot(true)) {
            srcTV = "data:image/jpeg;base64," + wiiuMainApplication.getScreenShot(true);
            srcDRC = "data:image/jpeg;base64," + wiiuMainApplication.getScreenShot(false);

            $(".screenshot-toggle-container img.screenshot-tv").attr("src", srcTV);
            $(".screenshot-toggle-container img.screenshot-drc").attr("src", srcDRC);
        }

        $(".screenshot-toggle-container li input").on("click", function () {
            $(".screenshot-toggle-container li").removeClass("checked")
            $(this).parent().addClass("checked")
            $(this).val() == "top" ? scrSel.find("img").attr("src", srcTV) : scrSel.find("img").attr("src", srcDRC);
            $(this).val() == "top" ? $("#screenshot_val_input").val(srcTV) : $("#screenshot_val_input").val(srcDRC)
            $(".screenshot-toggle-container").addClass("none");
        })

        $(".screenshot-toggle-container .cancel-toggle-button").on("click", function () {
            $(".screenshot-toggle-container li").removeClass("checked")
            scrSel.find("img").attr("src", defaultScr.src)
            $("#screenshot_val_input").val("");
            $(".screenshot-toggle-container").addClass("none");
        })

        $(".spoiler-button").on("click", function () {
            if (aqua.open_toggle) {
                aqua.open_toggle.toggle.addClass("none");
                aqua.open_toggle = null;
            }

            $(this).find('input').prop('checked') ? aqua.playSnd('SE_OLV_CHECKBOX_CHECK') : aqua.playSnd('SE_OLV_CHECKBOX_UNCHECK');
            $(this).toggleClass('checked')
        })

        $(".textarea-with-menu .textarea-menu label").on("click", function () {
            $(".textarea-with-menu .textarea-menu label").removeClass('checked');

            if ($(this).find('input').val() == "body") {
                $(".textarea-memo").addClass('none');
                $(".textarea-text").removeClass('none');
            } else {
                $(".textarea-text").addClass('none');
                $(".textarea-memo").removeClass('none');
                openMemo();
            }

            $(this).addClass('checked');
        })

        $(".textarea-container .textarea-memo-trigger").on("click", function () {
            openMemo();
        })

        $(".feeling-selector .buttons li").on("click", function () {
            $(".feeling-selector .buttons li").removeClass("checked");
            $(".mii-icon-container .icon").attr("src", $(this).find("input").attr("data-mii-face-url"));
            $(this).addClass("checked");
        })

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

        postTog.on("click", function () {
            postModal.open();
        })

        $("#add-new-post-modal").data("isReady", true);
    },
    setUpJournal: function () {
        if ($("#tutorial-confirmation-wrapper").data("isReady")) { return; }
        var scrSel = $(".screenshot-toggle-button");
        var scrTV;
        var scrDRC;
        var defaultScr = new Image();
        defaultScr.src = "/img/sprsheet/screenshot_selector.png";
        var diaryBtn = $(".header .add-journal-button");
        var diaryPostBtn = $("#tutorial-confirmation-wrapper .add-post-button:not(.back-button)");
        var diaryModal = new aqua.modalManager($("#tutorial-confirmation-wrapper"));

        function sendJournalPost() {
            if (aqua.isPostBeingSent) { return; }

            aqua.isPostBeingSent = true;
            $('header.header .add-post-button:not(.back-button)').addClass('disabled').removeAttr('href');
            wiiuBrowser.lockHomeButtonMenu(true);


            if (!$('.textarea-text').val()) {
                wiiuDialog.alert(aqua.getLoc('data-no-text-error'), aqua.getLoc('data-no-text-ok-text'));
                wiiuBrowser.lockHomeButtonMenu(false);
                wiiuBrowser.showLoadingIcon(false);
                $('header.header .add-post-button:not(.back-button)').removeClass('disabled').attr('href', 'javascript:void(0)');
                aqua.isPostBeingSent = false;
                return;
            }

            wiiuDialog.showLoading(aqua.getLoc('data-loading-text'));

            var postObj = new FormData();
            postObj.append("body", $('.textarea-text').val());

            postObj.append("owns_title", 1);
            postObj.append("is_journal", 1);
            postObj.append("community_id", diaryModal.modal.find("header.header").attr('data-diary-community-id'));
            if ($("#screenshot_val_input").val().length !== 0) {
                postObj.append("screenshot", $("#screenshot_val_input").val().replace(/^data:image\/\w+;base64,/, ''));
            }

            postObj.append("feeling_id", +$(".feeling-selector .buttons li.checked input").val())

            $('.spoiler-button').find('input[type="checkbox"]').is(':checked') ? postObj.append("spoiler", 1) : postObj.append("spoiler", 0);

            var xhr = new XMLHttpRequest();
            xhr.open('POST', aqua.api_domain + "/v2/posts");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 201) {
                        wiiuMemo.reset();
                        wiiuDialog.hideLoading();
                        aqua.open_modal.close();
                        wiiuBrowser.lockUserOperation(true);
                        $.pjax.reload(".wrapper", {
                            fragment: ".wrapper",
                            container: ".wrapper",
                        });
                        wiiuBrowser.lockHomeButtonMenu(false);
                        $('header.header .add-post-button:not(.back-button)').removeClass('disabled').attr('href', 'javascript:void(0)');
                        aqua.isPostBeingSent = false;
                    }
                    else {
                        wiiuMemo.reset();
                        wiiuDialog.hideLoading();
                        wiiuErrorViewer.openByCodeAndMessage(155289, 'There was an error making a new post, Please try again later.')
                        wiiuBrowser.lockHomeButtonMenu(false);
                        $('header.header .add-post-button:not(.back-button)').removeClass('disabled').attr('href', 'javascript:void(0)');
                        aqua.isPostBeingSent = false;
                    }
                }
            }
            xhr.send(postObj);

        }

        wiiuMainApplication.getScreenShot(true) ? scrSel.removeClass("none") : "";

        if (wiiuMainApplication.getScreenShot(true)) {
            srcTV = "data:image/jpeg;base64," + wiiuMainApplication.getScreenShot(true);
            srcDRC = "data:image/jpeg;base64," + wiiuMainApplication.getScreenShot(false);

            $(".screenshot-toggle-container img.screenshot-tv").attr("src", srcTV);
            $(".screenshot-toggle-container img.screenshot-drc").attr("src", srcDRC);
        }

        $(".screenshot-toggle-container li input").on("click", function () {
            $(".screenshot-toggle-container li").removeClass("checked")
            $(this).parent().addClass("checked")
            $(this).val() == "top" ? scrSel.find("img").attr("src", srcTV) : scrSel.find("img").attr("src", srcDRC);
            $(this).val() == "top" ? $("#screenshot_val_input").val(srcTV) : $("#screenshot_val_input").val(srcDRC)
            $(".screenshot-toggle-container").addClass("none");
        })

        $(".screenshot-toggle-container .cancel-toggle-button").on("click", function () {
            $(".screenshot-toggle-container li").removeClass("checked")
            scrSel.find("img").attr("src", defaultScr.src)
            $("#screenshot_val_input").val("");
            $(".screenshot-toggle-container").addClass("none");
        })

        $(".spoiler-button").on("click", function () {
            if (aqua.open_toggle) {
                aqua.open_toggle.toggle.addClass("none");
                aqua.open_toggle = null;
            }

            $(this).find('input').prop('checked') ? aqua.playSnd('SE_OLV_CHECKBOX_CHECK') : aqua.playSnd('SE_OLV_CHECKBOX_UNCHECK');
            $(this).toggleClass('checked')
        })

        $(".feeling-selector .buttons li").on("click", function () {
            $(".feeling-selector .buttons li").removeClass("checked");
            $(".mii-icon-container .icon").attr("src", $(this).find("input").attr("data-mii-face-url"));
            $(this).addClass("checked");
        })

        diaryBtn.on("click", function () {
            diaryModal.open();
        })

        diaryPostBtn.on("click", sendJournalPost);

        $("#tutorial-confirmation-wrapper").data("isReady", true);
    },
    setUpScreenshots: function () {
        var screenshotModal = new aqua.modalManager($(".screenshot-viewer-screenshot"));
        var ytModal = new aqua.modalManager($("#yt-jump-modal"));

        if (!$("header.header").data("ytButtonListener")) {
        screenshotModal.modal.find(".yt-jump-button").on("click", function() {
            ytModal.modal.find(".js-youtube-video-id").text($(this).attr("data-yt-url-jump"))
            aqua.open_modal.close();
            ytModal.open();
        })

        ytModal.modal.find(".ok-confirm-app-jump").on("click", function() {
            aqua.jumpUrl(ytModal.modal.find(".js-youtube-video-id").text());
        })

        $("header.header").data("ytButtonListener", true);
    }

        var f = $("a.screenshot-permalink");
        f.each(function () {
            var $this = $(this);
            if (!$this.data("screenListAdded")) {
                $this.on("click", function () {
                    var scrA = $(this);
                    screenshotModal.modal.find("img").attr("src", scrA.find("img").attr("src"));
                    if (scrA.attr("data-yt-url")) {
                        screenshotModal.modal.find(".screenshot-img-wrapper div:not(.screenshot)").addClass("double-button");
                        screenshotModal.modal.find(".button.yt-jump-button").removeClass("none");
                        screenshotModal.modal.find(".button.yt-jump-button").attr("data-yt-url-jump", scrA.attr("data-yt-url"))
                    } else {
                        screenshotModal.modal.find(".screenshot-img-wrapper div:not(.screenshot)").removeClass("double-button");
                        screenshotModal.modal.find(".button.yt-jump-button").addClass("none")
                        screenshotModal.modal.find(".button.yt-jump-button").removeAttr("data-yt-url-jump");
                    }
                    screenshotModal.open();
                });
                $this.data("screenListAdded", true);
            }
        });
    },
    modalManager: function (modal, acceptCallback, hideNavBar) {
        var that = this;

        this.modal = modal;

        this.open = function () {
            aqua.scrollPosition = window.scrollY;
            aqua.open_modal = that;
            if ($("#menu-bar").length && !hideNavBar) {
                $("#menu-bar").addClass("none");
            }
            if (aqua.currentPage === aqua.pageType.COMMUNITIES) {
                $("header.header").addClass("none");
                $(".header-banner-container").addClass("none");
                $(".community-info").addClass("none");
                $(".community-type").addClass("none");
                $(".community-post-list").addClass("none");
            } else if (aqua.currentPage === aqua.pageType.POSTS) {
                $("header.header").addClass("none");
                $(".post-permalink").addClass("none");
            } else if (aqua.currentPage === aqua.pageType.IDENTIFIED_POSTS) {
                $("header.header").addClass("none");
                $(".identified-user-info").addClass("none");
                $(".community-post-list").addClass("none");
            } else if (aqua.currentPage === aqua.pageType.ACCOUNT_CREATION) {
                $("#window-setup-1").addClass("none");
            } else if (aqua.currentPage === aqua.pageType.ACTIVITY_FEED) {
                $("header.header:not(.tutorial-confirmation)").addClass("none");
                $(".community-post-list").addClass("none");
            }
            that.modal.removeClass("none");
        };

        this.close = function () {
            aqua.open_modal = null;
            if ($("#menu-bar").length && !hideNavBar) {
                $("#menu-bar").removeClass("none");
            }
            if (aqua.currentPage === aqua.pageType.COMMUNITIES) {
                $("header.header").removeClass("none");
                $(".header-banner-container").removeClass("none");
                $(".community-info").removeClass("none");
                $(".community-type").removeClass("none");
                $(".community-post-list").removeClass("none");
            } else if (aqua.currentPage === aqua.pageType.POSTS) {
                $("header.header").removeClass("none");
                $(".post-permalink").removeClass("none");
            } else if (aqua.currentPage === aqua.pageType.IDENTIFIED_POSTS) {
                $("header.header").removeClass("none");
                $(".identified-user-info").removeClass("none");
                $(".community-post-list").removeClass("none");
            } else if (aqua.currentPage === aqua.pageType.ACCOUNT_CREATION) {
                $("#window-setup-1").removeClass("none");
            } else if (aqua.currentPage === aqua.pageType.ACTIVITY_FEED) {
                $("header.header:not(.tutorial-confirmation)").removeClass("none");
                $(".community-post-list").removeClass("none");
            }
            that.modal.addClass("none");
            window.scrollTo(0, aqua.scrollPosition);
        };

        this.isOpen = function () {
            return !that.modal.hasClass("none");
        };

        if (typeof acceptCallback == "function" && modal.hasClass("window-page") && modal.find(".window-bottom-buttons .button:not(.cancel-button)").length) {
            modal.find(".window-bottom-buttons .button:not(.cancel-button)").on("click", acceptCallback)
        }

        if (modal.hasClass("window-page") && modal.find(".window-bottom-buttons .cancel-button").length) {
            modal.find(".window-bottom-buttons .cancel-button").on("click", this.close)
        }

        if (modal.find(".back-button").length) {
            modal.find(".back-button").on("click", this.close)
        }
    },
    setTutorialAsRead: function (tutorial) {
        var tutorialType = $(tutorial).attr("data-tutorial");
        var tutorialReqObj = {
            tutorial_id: tutorialType
        }

        var tutorialReq = new XMLHttpRequest();
        tutorialReq.open("POST", aqua.api_domain + "/v2/tutorials")
        tutorialReq.setRequestHeader("Content-Type", "application/json")
        tutorialReq.send(JSON.stringify(tutorialReqObj));
        $(".tutorial-window").addClass("none")
    },
    prepareBGMusicByPath: function (path) {
        clearInterval(aqua.bg_music_interval);
        var match = path.match("^/settings") ? "BGM_OLV_SETTING" :
            path.match("^/account/create_account$") ? "BGM_OLV_INIT" :
                "BGM_OLV_MAIN";

        aqua.playSnd(match);

        if (match === "BGM_OLV_MAIN") {
            aqua.bg_music_interval = setInterval(function () {
                aqua.playSnd("BGM_OLV_MAIN_LOOP_NOWAIT");
            }, 90000);
        }
    },
    setNotificationInterval: function () {
        if (aqua.currentPage === aqua.pageType.ACCOUNT_CREATION) { return; }

        var newsPopup = $(".news-balloon-popup");
        var newsA = $("#menu-bar #menu-bar-news a");
        var messageA = $("#menu-bar #menu-bar-message a");

        function checkNews() {
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", aqua.api_domain + "/v2/notifications")
            xhttp.send()

            xhttp.onreadystatechange = function (e) {
                if (xhttp.readyState == xhttp.DONE) {
                    switch (xhttp.status) {
                        case 200:
                            var responseObj = JSON.parse(xhttp.responseText)

                            if (responseObj.notifications.notifications_length >= 1) {
                                if (responseObj.notifications.notifications_length > 99) {
                                    newsA.find(".badge").text("99+")
                                } else {
                                    newsA.find(".badge").text(String(responseObj.notifications.notifications_length))
                                }

                                newsA.find(".badge").css("display", "block")
                            }

                            if (responseObj.notifications.messages_length >= 1) {
                                if (responseObj.notifications.messages_length > 99) {
                                    messageA.find(".badge").text("99+")
                                } else {
                                    messageA.find(".badge").text(String(responseObj.notifications.messages_length))
                                }

                                messageA.find(".badge").css("display", "block")
                            }

                            if (responseObj.notifications.popup_message) {
                                newsPopup.removeClass("none")
                                newsPopup.removeClass("read")

                                newsPopup.find("p").text(String(responseObj.notifications.popup_message))

                                setTimeout(function () {
                                    newsPopup.addClass("read")
                                    setTimeout(function () {
                                        newsPopup.addClass("none")
                                    }, 1000)
                                }, 8000)
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

        setInterval(checkNews, 15000);
        checkNews();

        newsA.on("click", function () {
            newsA.find(".badge").css("display", "none");
            if (!newsPopup.hasClass("read")) {
                newsPopup.addClass("read");
                setTimeout(function () {
                    newsPopup.addClass("none")
                }, 1200)
            }
        })

        messageA.on("click", function () {
            messageA.find(".badge").css("display", "none");
        })
    },
    scrollEndLoadMoreContent: function () {
        if (!$("[data-scroll-event]").length) { return; }
        if (aqua.isLoadingMoreContent || aqua.open_modal || aqua.isLoadingMoreContentLocked) { return; }
        var url = $("[data-scroll-url]").attr("data-scroll-url")
        var cont = $("[data-scroll-container]").attr("data-scroll-container")
        var query = "";
        if ($("[data-scroll-tab]").length >= 1) {
            query = "&type=" + $("[data-tab-query]:not(div).selected").attr("data-tab-query")
        }
        if (!$(cont).length || $(".no-content-window").length) { return; }
        var xhttp = new XMLHttpRequest()
        xhttp.open("GET", url += ("?offset=" + $(cont)[0].children.length) + query)
        xhttp.setRequestHeader("x-embedded-dom", true)
        xhttp.send()
        aqua.isLoadingMoreContent = true;

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                switch (xhttp.status) {
                    case 200:
                        $(".loading").removeClass("none")
                        $(cont).append(xhttp.responseText);

                        aqua.initSound();
                        aqua.setUpEmpathy();
                        aqua.initSpoiler();
                        aqua.setUpScreenshots();
                        aqua.initSpoilerCache();
                        aqua.isLoadingMoreContent = false;
                        break;
                    case 204:
                        $(".loading").addClass("none")
                        aqua.isLoadingMoreContent = false;
                        aqua.isLoadingMoreContentLocked = true;
                        break;
                    default:
                        $(".loading").addClass("none")
                        aqua.isLoadingMoreContent = false;
                        break;
                }
            }
        }
    },
    setUpScrollTopButton: function () {
        $(".button-scroll-top").on("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        })
    }
}

aqua.router.connect("^/titles/show$", function () {
    aqua.currentPage = aqua.pageType.TITLES_SHOW;
    aqua.initSound();
    aqua.setNavBarSelected($("#menu-bar #menu-bar-community"))
    aqua.initToggle();
});

aqua.router.connect("^/communities/(\\d+)$", function (communityId) {
    console.log("Viewing community:", communityId);
    aqua.currentPage = aqua.pageType.COMMUNITIES;
    aqua.initSound();
    aqua.setNavBarSelected($("#menu-bar #menu-bar-community"));
    aqua.setUpEmpathy();
    aqua.setCommunityBtns();
    aqua.setUpPosting();
    aqua.initSpoiler();
    aqua.initToggle();
    aqua.setUpScreenshots();
    aqua.initSpoilerCache();
});

aqua.router.connect("^/titles/communities$", function () {
    console.log("Viewing titles communities");
    aqua.currentPage = aqua.pageType.TITLES_COMMUNITIES;
    aqua.initSound();
    aqua.setNavBarSelected($("#menu-bar #menu-bar-community"));
});

aqua.router.connect("^/titles/favorites$", function () {
    console.log("Viewing titles favorites");
    aqua.currentPage = aqua.pageType.TITLES_FAVORITES;
    aqua.initSound();
    aqua.setNavBarSelected();
});

aqua.router.connect("^/messages$", function () {
    console.log("Viewing messages");
    aqua.currentPage = aqua.pageType.MESSAGES_LIST;
    aqua.initSound();
    aqua.setNavBarSelected($("#menu-bar #menu-bar-message"));
});

aqua.router.connect("^/notifications$", function () {
    if ($(".tab-requests .friend_requests").hasClass("selected")) {
        aqua.router.checkRoutes("/notifications/friend_requests");
        return;
    }
    console.log("Viewing news");
    aqua.currentPage = aqua.pageType.NEWS_LIST;
    aqua.initSound();
    aqua.setNavBarSelected($("#menu-bar #menu-bar-news"));
});

aqua.router.connect("^/notifications/friend_requests$", function () {
    console.log("Viewing friend requests");
    aqua.currentPage = aqua.pageType.FRIEND_REQUEST_LIST;
    aqua.initSound();
    aqua.setNavBarSelected($("#menu-bar #menu-bar-news"));
});

aqua.router.connect("^/posts/(\\d+)$", function (postId) {
    console.log("Viewing post with ID:", postId);
    aqua.currentPage = aqua.pageType.POSTS;
    aqua.initSound();
    aqua.setNavBarSelected();
    aqua.setUpEmpathy();
    aqua.setUpPostJumpButtons();
    aqua.setUpScreenshots();
});

aqua.router.connect("^/users/@me$", function () {
    console.log("Viewing current user profile");
    aqua.currentPage = aqua.pageType.USERS_ME;
    aqua.initSound();
    aqua.setNavBarSelected($("#menu-bar #menu-bar-mymenu"));
});

aqua.router.connect("^/activity_feed$", function () {
    console.log("Viewing activity feed");
    aqua.currentPage = aqua.pageType.ACTIVITY_FEED;
    aqua.initSound();
    aqua.initToggle();
    aqua.setNavBarSelected($("#menu-bar #menu-bar-feed"));
    aqua.setUpJournal();
});

aqua.router.connect("^/identified_user_posts$", function () {
    console.log("Seeing identified user posts");
    aqua.currentPage = aqua.pageType.IDENTIFIED_POSTS;
    aqua.initSound();
    aqua.setUpEmpathy();
    aqua.setUpScreenshots();
    aqua.setNavBarSelected();
    aqua.initSpoiler();
});

aqua.router.connect("^/account/create_account$", function () {
    console.log("Viewing account creation");
    aqua.currentPage = aqua.pageType.ACCOUNT_CREATION;
    aqua.initSound();
    aqua.setNavBarSelected();

    function playFinishJingle() {
        aqua.playSnd('JGL_OLV_INIT_END');
    }

    function changeSetUpModal() {
        var el = $(this);
        var hideM = $(el.attr("data-toggle-hide"));
        var showM = $(el.attr("data-toggle-show"));
        hideM.addClass("none");
        showM.removeClass("none")
        window.scrollTo(0, 0);
    }

    function selectExperienceTab() {
        var tab = $(this);
        $("#welcome-create .game_experience_form label").removeClass("selected");
        tab.addClass("selected");
    }

    function selectBOSSTab() {
        var tab = $(this);
        $("#welcome-create .boss_form label").removeClass("selected");
        wiiuBrowser.showLoadingIcon(true);
        if (tab.find("input").val() == "1") {
            wiiuBOSS.registerDirectMessageTaskEx(720, 2);
        } else {
            wiiuBOSS.unregisterDirectMessageTask();
        }
        tab.addClass("selected");
        wiiuBrowser.showLoadingIcon(false);
    }

    function createAccount() {

    }

    function signIn() {

    }

    var pinModal = new aqua.modalManager($("#window-setup-pin-ask"), checkForPin);

    function checkForPin() {
        if ($(this).hasClass("close-app-button")) { return; }
        if (wiiuSystemSetting.checkParentalPinCode($(".pin_entry").val()).result) {
            pinModal.close();
        } else {
            wiiuDialog.alert("Incorrect PIN", "OK")
        }
    }

    wiiuSystemSetting.getParentalControlForMiiverse().restrictionLevel == "0" ? $("#window-setup-1").removeClass("none") : pinModal.open();

    $("[data-toggle-hide]").on("click", changeSetUpModal);

    $("#window-setup-pin-ask .close-app-button, .exit-setup-modal-button").on("click", function () {
        setTimeout(function () { wiiuBrowser.closeApplication() }, 0);
    });

    $("#welcome-create .game_experience_form label").on("click", selectExperienceTab);

    $("#welcome-create .boss_form label").on("click", selectBOSSTab);

    $("#welcome-log-in .welcome_account_form #submit1").off("click", signIn);

    $("#welcome-log-in .welcome_account_form #submit1").on("click", signIn);

    $(window).on("scroll", hideScrollHelper);

    function hideScrollHelper() {
        if ($(this).scrollTop() > 120 && !$('#window-setup-5').hasClass("none")) {
            $('.fixed-scroll-warning-setup:visible').addClass("read");
            setTimeout(function () {
                $('.fixed-scroll-warning-setup').addClass("none");
                $(window).off("scroll", hideScrollHelper);
            }, 1000);
        }
    }

});

aqua.router.connect(".*", function () {
    console.log("Not detected page");
    aqua.currentPage = aqua.pageType.NONE;
    aqua.initSound();
    aqua.setNavBarSelected();
});

$(document).on("DOMContentLoaded", function () {
    wiiuBrowser.lockUserOperation(true);
    console.log("Aqua - Init");
    aqua.initPjax();
    aqua.initNavBar();
    aqua.router.checkRoutes(window.location.pathname);
    aqua.prepareBGMusicByPath(window.location.pathname);
    aqua.setNotificationInterval();
    aqua.initButton();
    aqua.setUpScrollTopButton();
    wiiuBrowser.lockUserOperation(false);
    wiiuBrowser.endStartUp();
})

$(document).on("pjax:click", function () {
    wiiuBrowser.lockUserOperation(true);
    aqua.ifModalClose();
    aqua.ifToggleClose();
    $(".button-scroll-top").fadeOut(200);
})

$(document).on("pjax:end", function () {
    aqua.ifModalClose();
    aqua.ifToggleClose();
    aqua.isLoadingMoreContentLocked = false;
    aqua.router.checkRoutes(window.location.pathname);
    aqua.prepareBGMusicByPath(window.location.pathname);
    wiiuBrowser.lockUserOperation(false);
})

$(window).on("pjax:error", function () {
    wiiuErrorViewer.openByCode(1022107);
    wiiuBrowser.lockUserOperation(false);
})

$(window).on("pjax:timeout", function () {
    wiiuErrorViewer.openByCode(1022107);
    wiiuBrowser.lockUserOperation(false);
})

$(window).on("popstate", function () {
    aqua.initPopstate();
})

$(window).on("scroll", function () {
    clearTimeout(aqua.topButtonTimeout);
    aqua.topButtonTimeout = setTimeout(function() {
        if ($(window).scrollTop() > 100) {
            $(".button-scroll-top").fadeIn(200);
        } else {
            $(".button-scroll-top").fadeOut(200);
        }
    }, 100);

    aqua.ifToggleClose(1);

    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 40) {
        $(document).trigger('aqua:scroll-end');
    }
})

$(window).on("aqua:scroll-end", aqua.scrollEndLoadMoreContent);