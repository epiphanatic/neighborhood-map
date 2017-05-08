// handles toggling of side menu

let menuIsOpen = false;
let mobileView = false;

function togglePane() {

    if (menuIsOpen) {
        // close it
        document.getElementById("map").style.marginLeft = "0";
        document.getElementById("map").style.width = "100%";
        document.getElementById("left-pane").style.width = "0";

        menuIsOpen = false;

        // refresh map to get rid of extra whitespace
        google.maps.event.trigger(map, 'resize')

    } else {
        // open it
        if (mobileView) {
            document.getElementById("left-pane").style.width = "100%";
        } else {
            document.getElementById("left-pane").style.width = "25%";
            document.getElementById("map").style.marginLeft = "25%";
            document.getElementById("map").style.width = "75%";
        }
        menuIsOpen = true;

    }

}

// listens for changes in width
if (matchMedia) {
    const mq = window.matchMedia("(min-width: 691px)");
    mq.addListener(WidthChange);
    WidthChange(mq);
}


// media query change
function WidthChange(mq) {
    if (mq.matches) {
        // window width is at least 691px
        mobileView = false;

    } else {
        // window width is less than 691px

        mobileView = true;

        // close menu and toggle var
        document.getElementById("left-pane").style.width = "0";
        document.getElementById("map").style.marginLeft = "0";
        document.getElementById("map").style.width = "100%";
        menuIsOpen = false;
    }
}

// initial menu open
function menuInit() {
    if (!mobileView) {
        document.getElementById("map").style.marginLeft = "25%";
        document.getElementById("map").style.width = "75%";
        document.getElementById("left-pane").style.width = "25%";

        menuIsOpen = true;
    }
}

// open menu on page load
window.addEventListener('load', menuInit());