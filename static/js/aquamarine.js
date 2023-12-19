// if its true, do testing things
var testingMode = true;

// if a disableSidebar element is found, disable the sidebar
if (document.getElementById("disableSidebar")) cave.toolbar_setVisible(0);
else cave.toolbar_setVisible(1);

// when the page content is loaded, call onContentLoad()
document.addEventListener("DOMContentLoaded", function() {
    onContentLoad();
});

function onContentLoad()
{
    // check if back button should be on or off
    if (history.length > 1 && !document.getElementById("disableBackButton")) cave.toolbar_setButtonType(1);
    else if (history.length <= 1 || document.getElementById("disableBackButton")) cave.toolbar_setButtonType(0);

    cave.snd_playBgm("BGM_CAVE_MAIN");
    
    // set the toolbar callbacks                 my menu                                 activity feed                           communities                             notifications
    cave.toolbar_setToolbarCallback(function() { onToolbarPress(5, true) }, function() { onToolbarPress(2, true) }, function() { onToolbarPress(3, true) }, function() { onToolbarPress(4, true) });
    
    // set back button callbacks
    cave.toolbar_setCallback(99, goBack);
    cave.toolbar_setCallback(1, goBack);
    
    // if its in testing mode, set notification count to your country id
    if (testingMode)
    {
        cave.toolbar_setNotificationCount(cave.getCountry());
    }
}

// if you can go back, go back
function goBack() {
    if (history.length >= 1) history.back();
}

function onToolbarPress(number, setActive) {
    //alert("Guys. This is a certified\nAMOGUS!!!!\nmoment");
    if (setActive) {
        cave.toolbar_setActiveButton(number);
    }

    // switch statement for the 4 main toolbar buttons
    switch (number) {
        case 5:
            //alert("My Menu")

            alert("That feature isn't ready yet, but this will eventually be your menu! For now, let's show you our error screen!")
            
            var paths = window.location.pathname.split("/");

            if (paths[1] != "communities" || testingMode == false) window.location.pathname = "/titles/error/1234/" + encodeURIComponent(Base64.encode("Hello! Thank your for participating in this test error!"));
            else paths[2] = parseInt(paths[2]) + 1; window.location.pathname = paths.join("/");
            break;
        case 2:
            //alert("Activity Feed")
            window.location.pathname = "/titles/activity_feed"
            break;
        case 3:
            //alert("Communities")
            window.location.pathname = "/titles/show"
            break;
        case 4:
            //alert("Notifications")
            window.location.pathname = "/titles/notifications"
            break;
        default:
            alert("what the flip did you press (default switch case message)")
            break;
    }
}

function submit_post() {
    var body = document.getElementById("body_input").value

    alert(body)

    //var formData = new FormData()
    //formData.append("body", body)

    alert(body)

    var xml = new XMLHttpRequest()

    xml.open("POST", "https://api.olv.nonamegiven.xyz/v1/posts")

    alert(body)
    xml.send()

    alert(body)
}

// just a little testing ban message
function banMessage()
{
    cave.error_callFreeErrorViewer(20102, "You have been banned. MUAAHHAAHHAHAHAHAHHAHAHAHAHAHHAHAAHHAH!!!!!!!!!");
    cave.exitApp();
}