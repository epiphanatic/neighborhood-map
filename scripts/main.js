$(document).ready(function(){
    // model

    const locations = [
        {
            name: 'Noosa Heads',
            location: {lat: -26.398, lng: 153.093}
        },
        {
            name: 'Eumundi Markets',
            location: {lat: -26.476191, lng: 152.951991}
        },
        {
            name: 'Mooloolaba',
            location: {lat: -26.682, lng: 153.118}
        },
        {
            name: 'Coolum Beach',
            location: {lat: -26.527692, lng: 153.073633}
        },
        {
            name: 'Crystal Waters',
            location: {lat: -26.781821, lng: 152.716863}
        },
    ];


// ViewModel
    const ViewModel = function () {
        const self = this;

        this.locations = ko.observableArray([]);
        locations.forEach(function (locItem) {
            self.locations.push(new Location(locItem));
        });

        // make a filter for search input box in view.
        // return locations that have whatever string is entered (as user types)
        self.currentFilter = ko.observable();

        self.filterLocations = ko.computed(function() {
            if(!self.currentFilter()) {
                return self.locations();
            } else {
                return ko.utils.arrayFilter(self.locations(), function (location) {
                    return location.name.toLowerCase().match(new RegExp(self.currentFilter().toLowerCase(), 'ig'))
                });
            }
        });


        // console.log(this.locList()[0]);

        // sets the first current location from the list
        // this.currentLoc = ko.observable(this.locList()[0]);

        // when you click location the model is automatically passed in (clickedLoc)
        // this.setLoc = function(clickedLoc){
        //     // console.log(clickedLoc);
        //     self.currentLoc(clickedLoc);
        // }
    };

// location object
    const Location = function (loc) {
        this.name = loc.name;
    };

    ko.applyBindings(new ViewModel());


// initialize the map
    function initMap() {
        // Create a map variable
        let map;
        // Create a new blank array for all the listing markers.
        const markers = [];
        // use a constructor to create a new map JS object. You can use the coordinates
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -26.527692, lng: 153.073633},
            zoom: 10,
            // styles: styles,
            mapTypeControl: false
        });


        const largeInfowindow = new google.maps.InfoWindow();
        const bounds = new google.maps.LatLngBounds();


        for (let i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            let position = locations[i].location;
            let title = locations[i].name;
            // Create a marker per location, and put into markers array.
            let marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i
            });
            // Push the marker to our array of markers.
            markers.push(marker);
            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow);
            });
            bounds.extend(markers[i].position);
        }
        // Extend the boundaries of the map for each marker
        // map.fitBounds(bounds);

    }

    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker !== marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick',function(){
                infowindow.setMarker = null;
            });
        }
    }

    // Calls the initMap() function when the page loads
    window.addEventListener('load', initMap);
    // Vanilla JS way to listen for resizing of the window
    // and adjust map bounds
    // window.addEventListener('resize', function(e) {
    //     //Make sure the map bounds get updated on page resize
    //     map.fitBounds(mapBounds);
    // });
});