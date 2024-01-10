var pjax = new Pjax({
    selectors : [".wrapper", "body"]
});

    setInterval(function() {
        wiiu.gamepad.update();

        if(wiiu.gamepad.hold === 16384) {
            wiiuSound.playSoundByName("SE_OLV_MII_CANCEL", 3);
            aquamarine.back();
        }
    }, 100)

console.log("init aqua");

window.addEventListener("load", function () {
    aquamarine.init();
    aquamarine.initSounds();
    aquamarine.initEmpathy();
    aquamarine.initSpoilers();
    aquamarine.initNavBar();

    aquamarine.backButtonUpdate();
})

document.addEventListener("pjax:send", function() {
    wiiuBrowser.lockUserOperation(true)
})

document.addEventListener("pjax:complete", function() {
    aquamarine.initSounds();
    aquamarine.initEmpathy();
    aquamarine.initSpoilers();
    aquamarine.backButtonUpdate();
    wiiuBrowser.lockUserOperation(false);
})

var aquamarine = {
    init: function () {
        wiiuBrowser.endStartUp();
        wiiuSound.playSoundByName("BGM_OLV_MAIN", 3);

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
                for (var i = 0; i < els.length; i++) {
                    if (els[i].classList.contains('selected'))
                        els[i].classList.remove('selected');
                }
                el.classList.add("selected");
            });
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

            var xml = new XMLHttpRequest();
            xml.open("POST", "https://api.olv.nonamegiven.xyz/v1/posts/"+id+"/empathies");
            xml.send();

            xml.onreadystatechange = function() {
                if (xml.readyState === 4) {
                    if (count.classList.contains('added')) {
                        count.classList.remove('added');
                        el.innerHTML = 'Yeah!';
                        if (count) count.innerText -= 1;
                        wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
        
                    }
                    else {
                        count.classList.add('added');
                        el.innerHTML = 'Unyeah!';
                        if (count) count.innerText = ++count.innerText;
                        wiiuSound.playSoundByName('SE_OLV_MII_ADD', 1);
                    }
                    el.disabled = false;
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
        
    },
    toggleFavorite: function () {
        var favoriteBtn = document.querySelector(".favorite-button.button");
        if (favoriteBtn.classList.contains("checked")) {
            wiiuSound.playSoundByName("SE_OLV_MII_CANCEL", 3);
            favoriteBtn.classList.remove("checked");
        } else {
            wiiuSound.playSoundByName("SE_OLV_MII_ADD", 3);
            favoriteBtn.classList.add("checked");
        }
    },
    back : function back() {
        history.back();
    },
    backButtonUpdate: function() {
        var backBtn = document.getElementById("menu-bar-back");
        var exitBtn = document.getElementById("menu-bar-exit");

        if(wiiuBrowser.canHistoryBack()) {
            backBtn.classList.remove('selected');
            backBtn.classList.remove('none');
            exitBtn.classList.add('none');

            exitBtn.removeEventListener("click", function() {

            });
            backBtn.addEventListener("click", function() {
                aquamarine.back();
            })
        }
        else {
            backBtn.classList.remove('selected');
            backBtn.classList.add('none');
            exitBtn.classList.remove('none');

            backBtn.removeEventListener("click", function() {

            });
            exitBtn.addEventListener("click", function() {
                aquamarine.exitApplet();
            })
        }
    }
}