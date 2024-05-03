var aqua = {
    modified_posts: [],
    modified_communities: [],
    scrollPosition: 0,
    api_domain: "https://d1-api.olv.aquamarine.lol",
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
        13: "A",
        27: "B",
        88: "X",
        89: "Y",
        76: "L",
        82: "R",
        80: "plus",
        77: "minus"
    },
    isEmpathyBeingAdded: false,
    isPostBeingSent: false,
    menuBarSoundAdded: false,
    isLoadingMoreContentLocked: false,
    currentPage: null,
    isLoadingMoreContent: false,
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
    initSound: function () {
        var e = $("[data-sound]");

        function playSnd(event) {
            if (aqua.open_toggle) {
                aqua.open_toggle.toggle.addClass("none");
                aqua.open_toggle = null;
            }

            wiiuSound.playSoundByName($(event.currentTarget).attr("data-sound"), 3);
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
            switch (r) {
                case 27:
                    if (aqua.currentPage === aqua.pageType.ACCOUNT_CREATION && $('.back-setup-modal-button').is(':visible')) {
                        $('.back-setup-modal-button:visible').trigger('click');
                    }
                    if (aqua.open_modal) {
                        wiiuSound.playSoundByName("SE_WAVE_BACK", 3);
                        aqua.open_modal.close();
                    } else if (wiiuBrowser.canHistoryBack() && !$("#menu-bar-back").hasClass("none")) {
                        wiiuSound.playSoundByName("SE_WAVE_BACK", 3);
                        history.back();
                    }
                    break;
                case 77:
                    if (aqua.open_modal && $('.screenshot-viewer-screenshot .button.yt-jump-button').is(':visible')) {
                        $('.screenshot-viewer-screenshot .button.yt-jump-button').trigger('click');
                    }
                    break;
                case 89:
                    if (aqua.open_modal) {
                        aqua.open_modal.close();
                    }
                    if (aqua.open_toggle) {
                        aqua.open_toggle.toggle.addClass("none");
                        aqua.open_toggle = null;
                    }
                    wiiuSound.playSoundByName("SE_OLV_BALLOON_OPEN", 3);
                    $.pjax.reload('.wrapper', {
                        container: ".wrapper",
                        fragment: ".wrapper"
                    })
                    break;
                default:
                    break;
            }
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
    setNavBarSelected: function (tab) {
        $("#menu-bar li").removeClass("selected")
        if (tab) {
            tab.addClass("selected")
        }
        var canShowBackButton =
            aqua.currentPage === aqua.pageType.TITLES_SHOW ||
            aqua.currentPage === aqua.pageType.USERS_ME ||
            aqua.currentPage === aqua.pageType.NEWS_LIST ||
            aqua.currentPage === aqua.pageType.FRIEND_REQUEST_LIST ||
            aqua.currentPage === aqua.pageType.MESSAGES_LIST ||
            aqua.currentPage === aqua.pageType.ACTIVITY_FEED;

        if (wiiuBrowser.canHistoryBack() && !canShowBackButton) {
            $("#menu-bar #menu-bar-exit").addClass("none")
            $("#menu-bar #menu-bar-back").removeClass("none")
        } else {
            $("#menu-bar #menu-bar-exit").removeClass("none")
            $("#menu-bar #menu-bar-back").addClass("none")
        }
    },
    initPjax: function () {
        $.pjax.defaults.timeout = 10000

        $(document).pjax("a[data-pjax]", {
            container: ".wrapper",
            fragment: ".wrapper"
        });

        $(document).pjax("a[data-tab-query]", {
            container: ".wrapper",
            fragment: ".wrapper",
        });

        $(document).pjax("a[data-news]", {
            container: ".wrapper",
            fragment: ".wrapper",
            push: false
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
                    wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
                } else {
                    wiiuSound.playSoundByName('SE_OLV_MII_ADD', 1);
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
                    wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
                } else {
                    wiiuSound.playSoundByName('SE_OLV_MII_ADD', 1);
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
    initToggle: function () {
        var elt = $("[data-toggle]");
        if (!elt) return;
        elt.on("click", function () {
            var target = $($(this).attr("data-toggle"));
            if (aqua.open_toggle && aqua.open_toggle.toggler != $(this).attr("data-toggle")) {
                aqua.open_toggle.toggle.addClass("none");
                aqua.open_toggle = null;
            }
            if (target.hasClass("none")) {
                aqua.open_toggle = { toggle: target, toggler: $(this).attr("data-toggle") };
                wiiuSound.playSoundByName('SE_OLV_BALLOON_OPEN', 3);
                target.removeClass("none");
            } else {
                wiiuSound.playSoundByName('SE_OLV_BALLOON_CLOSE', 3);
                target.addClass("none");
                aqua.open_toggle = null;
            }
        })
    },
    initSpoiler: function () {
        var els = $("a.hidden-content-button");
        if (!els) return;

        els.off("click", removeSpoiler);
        els.on("click", removeSpoiler);

        function removeSpoiler(evt) {
            evt.preventDefault();
            var el = $(evt.currentTarget);
            var postToShow = el.parent().parent().parent().parent().parent();
            postToShow.removeClass("hidden");
            el.html("");
            el.parent().parent().html("");
        }
    },
    setCommunityBtns: function () {
        var favoriteBtn = $(".favorite-button.button");
        favoriteBtn.on("click", function () {
            if (favoriteBtn.hasClass("checked")) {
                wiiuSound.playSoundByName("SE_OLV_MII_CANCEL", 3);
            } else {
                wiiuSound.playSoundByName("SE_OLV_MII_ADD", 3);
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
                wiiuDialog.alert($("#app-jump-modal").attr('data-app-jump-error-text'), $("#app-jump-modal").attr('data-app-jump-ok-text')), appJumpModal.close();
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
    },
    setUpPostJumpButtons: function () {

        var urlBtn = $(".button.link-button");
        var urlModal = new aqua.modalManager($("#url-jump-modal"), jumpToUrl);

        var ytBtn = $(".button.yt-button");
        var ytScrBtn = $(".screenshot-viewer-screenshot .button.yt-jump-button");
        var ytModal = new aqua.modalManager($("#yt-jump-modal"), jumpToUrl);

        function jumpToUrl() {
            wiiuBrowser.jumpToBrowser(aqua.open_modal.modal.attr("data-url"));
        }

        urlBtn.on("click", function () {
            urlModal.open();
        })

        ytBtn.on("click", function () {
            ytModal.open();
        })

        ytScrBtn.on("click", function () {
            aqua.open_modal.close();
            ytModal.open();
        })

    },
    setUpPosting: function () {
        var postTog = $(".add-post-button");
        var scrSel = $(".screenshot-toggle-button");
        var scrTV;
        var scrDRC;
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
                wiiuDialog.alert(postModal.modal.attr('data-no-text-error'), postModal.modal.attr('data-no-text-ok-text'));
                wiiuBrowser.lockHomeButtonMenu(false);
                wiiuBrowser.showLoadingIcon(false);
                $('.button.ok-confirm-post-button').removeClass('disabled').attr('href', 'javascript:void(0)');
                aqua.isPostBeingSent = false;
                return;
            }

            wiiuDialog.showLoading(postModal.modal.attr('data-loading-text'));

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
                        $.pjax.reload(".wrapper", {
                            fragment: ".wrapper",
                            container: ".wrapper",
                        });
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
            scrSel.find("img").attr("src", "/img/sprsheet/screenshot_selector.png")
            $("#screenshot_val_input").val("");
            $(".screenshot-toggle-container").addClass("none");
        })

        $(".spoiler-button").on("click", function () {
            if (aqua.open_toggle) {
                aqua.open_toggle.toggle.addClass("none");
                aqua.open_toggle = null;
            }

            $(this).find('input').prop('checked') ? wiiuSound.playSoundByName('SE_OLV_CHECKBOX_CHECK', 3) : wiiuSound.playSoundByName('SE_OLV_CHECKBOX_UNCHECK', 3);
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


    },
    setUpScreenshots: function () {
        var screenshotModal = new aqua.modalManager($(".screenshot-viewer-screenshot"));
        var f = $("a.screenshot-permalink");
        f.each(function () {
            var $this = $(this);
            if (!$this.data("screenListAdded")) {
                $this.on("click", function () {
                    var img = $(this).find(".post-content-screenshot").attr("src");
                    screenshotModal.modal.find("img").attr("src", img);
                    screenshotModal.open();
                });
                $this.data("screenListAdded", true);
            }
        });
    },
    prepareBOSS: function () {
        wiiuBOSS.unregisterDirectMessageTask();
        if (!wiiuBOSS.isRegisteredDirectMessageTask().isRegistered) {
            wiiuBOSS.registerDirectMessageTaskEx(720, 2);
        }
    },
    modalManager: function (modal, acceptCallback) {
        var that = this;

        this.modal = modal;

        this.open = function () {
            aqua.scrollPosition = window.scrollY;
            aqua.open_modal = that;
            if ($("#menu-bar").length) {
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
            }
            that.modal.removeClass("none");
        };

        this.close = function () {
            aqua.open_modal = null;
            if ($("#menu-bar").length) {
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

        var pathRegexes = [
            /^\/settings\/profile$/,
            /^\/account\/create_account$/
        ];

        function playB(s) {
            wiiuSound.playSoundByName(s, 3);
        }

        for (var i = 0; i < pathRegexes.length; i++) {
            var match = path.match(pathRegexes[i]);

            if (match !== null) {
                switch (i) {
                    case 0:
                        playB("BGM_OLV_SETTING");
                        break;
                    case 1:
                        playB("BGM_OLV_INIT");
                        break;
                }
                break;
            }
        }

        if (match === null) {
            playB("BGM_OLV_MAIN");
            aqua.bg_music_interval = setInterval(function () {
                playB("BGM_OLV_MAIN_LOOP_NOWAIT");
            }, 90000);
        }
    },
    setNotificationInterval: function () {
        if (aqua.currentPage === aqua.pageType.ACCOUNT_CREATION) { return; }

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
        setInterval(checkNews, 15000);
        checkNews();
    },
    scrollEndLoadMoreContent: function () {
        if (!$("[data-scroll-event]").length) { return; }
        if (aqua.isLoadingMoreContent || aqua.open_modal || aqua.isLoadingMoreContentLocked) { return; }
        var url = $("[data-scroll-url]").attr("data-scroll-url")
        var cont = $("[data-scroll-container]").attr("data-scroll-container")
        var query = "";
        if ($("[data-scroll-tab]").length >= 1) {
            query = "&type=" + $("[data-tab-query].selected").attr("data-tab-query")
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
    aqua.setNavBarSelected($("#menu-bar #menu-bar-community"))
    aqua.setUpEmpathy();
    aqua.setCommunityBtns();
    aqua.setUpPosting();
    aqua.initSpoiler();
    aqua.initToggle();
    aqua.setUpScreenshots();
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
        wiiuSound.playSoundByName('JGL_OLV_INIT_END', 3);
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

    function createAccount() {

    }

    function signIn() {

    }

    $("[data-toggle-hide]").off("click", changeSetUpModal);
    $("[data-toggle-hide]").on("click", changeSetUpModal);

    $("#welcome-create .game_experience_form label").off("click", selectExperienceTab);
    $("#welcome-create .game_experience_form label").on("click", selectExperienceTab);

    $("#welcome-create .welcome_account_form #submit2").off("click", createAccount);
    $("#welcome-log-in .welcome_account_form #submit1").off("click", signIn);

    $("#welcome-create .welcome_account_form #submit2").on("click", createAccount);
    $("#welcome-log-in .welcome_account_form #submit1").on("click", signIn);
});

aqua.router.connect(".*", function () {
    console.log("Not detected page");
    aqua.currentPage = aqua.pageType.NONE;
    aqua.initSound();
    aqua.setNavBarSelected();
});

$(document).on("DOMContentLoaded", function () {
    console.log("Aqua - Initializing")
    aqua.initPjax();
    aqua.router.checkRoutes(window.location.pathname);
    aqua.prepareBGMusicByPath(window.location.pathname);
    aqua.setNotificationInterval();
    aqua.initButton();
    wiiuBrowser.endStartUp();
})

$(document).on("pjax:click", function () {
    wiiuBrowser.lockUserOperation(true);
})

$(document).on("pjax:end", function () {
    aqua.isLoadingMoreContentLocked = false;
    aqua.router.checkRoutes(window.location.pathname);
    aqua.prepareBGMusicByPath(window.location.pathname);
    wiiuBrowser.lockUserOperation(false);
})

$(window).on("pjax:error", function () {
    wiiuBrowser.lockUserOperation(false);
})

$(window).on("popstate", function () {
    aqua.initPopstate();
})

$(window).on("scroll", function () {
    if (aqua.open_toggle) {
        wiiuSound.playSoundByName('SE_OLV_BALLOON_CLOSE', 3);
        aqua.open_toggle.toggle.addClass("none");
        aqua.open_toggle = null;
    }

    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
        $(document).trigger("aqua:scroll-end")
    }
})

$(window).on("aqua:scroll-end", aqua.scrollEndLoadMoreContent);