var pjax = {
    history : [],

    initNewPage : function initNewPage() {
        $("content a").on("click", function() {
            wiiuSound.playSoundByName("SE_WAVE_OK", 1);
        })        
    },

    updateBackButton : function updateBackButton() {
        //console.log(pjax.history)
        //console.log(pjax.history.length)

        if (pjax.history.length > 0) {
            console.log("history is more than 0")

            $("#close").attr("style", "color: black;");
            $("#close span ").text("Back");

            $("#close span.symbols").text("b");
            $("#close span.symbols").addClass("back");

            $("#close .b_button").attr("style", "display: block;");

            $("#close").off("click");
            $("#close").on("click", function() { pjax.back(); });
        } else {
            console.log("history is less than 0")

            $("#close").attr("style", "color: white; background-image: -webkit-radial-gradient(rgb(53, 53, 53), rgb(61, 61, 61));");
            $("#close span ").text("Close");

            $("#close span.symbols").text("x");
            $("#close span.symbols").removeClass("back");

            $("#close .b_button").attr("style", "display: none;");

            $("#close").off("click");
            $("#close").on("click", function() {
                console.log("Closing applet!")
                wiiuSound.playSoundByName('SE_WAVE_EXIT', 1); 
                wiiuBrowser.closeApplication();
            })
        }
    },

    loadIntoElement : function loadIntoElement(element_selector, url) {
        var xml = new XMLHttpRequest();

        xml.open("GET", url);
        xml.setRequestHeader("X-PJAX", true);
        xml.send();

        $("#loading").show();

        xml.onreadystatechange = function(e) {
            if (xml.readyState == 4 && xml.status == 200) {
                $(element_selector).append(xml.responseText);
                $("#loading").hide();

                return true;
            }
        }
    },

    loadNewPage : function loadNewPage(dom_element, url, no_push, sound) {
        wiiuBrowser.lockUserOperation(true);

        var xml = new XMLHttpRequest();

        xml.open("GET", url);
        xml.setRequestHeader("X-PJAX", true);
        xml.send();

        if (!no_push) {
            pjax.history.push(window.location.pathname)
        }

        xml.onreadystatechange = function(e) {
            if (xml.readyState == 4 && (xml.status === 200 || xml.status === 404)) {
                window.history.replaceState(null, "", url);
                $(dom_element).empty();
                $(dom_element).append(xml.responseText);

                pjax.updateBackButton();
                pjax.initNewPage();
                wiiuBrowser.lockUserOperation(false);

                if (sound) {
                    wiiuSound.playSoundByName(sound, 1)
                }

                return true;
            }
        }
    },

    back : function back() {
        if (pjax.history.length == 0) {
            console.log("Closing applet!")
            wiiuSound.playSoundByName('SE_WAVE_EXIT', 1); 
            wiiuBrowser.closeApplication(); 

            return;
        }

        var url = pjax.history.splice(-1, 1);
        
        pjax.loadNewPage("content", url, true, "SE_OLV_MII_CANCEL");
    }
}