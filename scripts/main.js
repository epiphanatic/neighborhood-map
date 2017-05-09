

    // global vars
    let map;
    let markers = [];

    // model

    const locations = [
        {
            title: 'Noosa Heads',
            location: {lat: -26.398, lng: 153.093},
            id: 0
        },
        {
            title: 'Eumundi',
            location: {lat: -26.476191, lng: 152.951991},
            id: 1
        },
        {
            title: 'Mooloolaba',
            location: {lat: -26.682, lng: 153.118},
            id: 2
        },
        {
            title: 'Coolum Beach',
            location: {lat: -26.527692, lng: 153.073633},
            id: 3
        },
        {
            title: 'Lake Weyba',
            location: {lat: -26.44264, lng: 153.070689},
            id: 4
        },
    ];

    // location object
    const Location = function (loc) {
        this.title = loc.title;
        this.id = loc.id;
        this.location = loc.location;
    };

    // ViewModel
    const ViewModel = function () {
        const self = this;

        // google api error handling
        self.gMapError = ko.observable();

        self.googleErrorHandler = ko.computed(function () {
            return self.gMapError('Failed to get map resources from Google');
        });

        // location pop
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
                    return location.title.toLowerCase().match(new RegExp(self.currentFilter().toLowerCase(), 'ig'));
                });
            }
        });

        // subscribe to filterLocations to handle visible markers (non-template related)
        self.filterLocations.subscribe(function () {

            if (markers) {
                // first get markers that match the current filtered locations
                self.matchedMarkers = ko.utils.arrayFilter(markers, function (marker) {
                    return marker.title.toLowerCase().match(new RegExp(self.currentFilter().toLowerCase(), 'ig'));
                });

                // now go through the markers, and for each one iterated through the matchedMarkers and to see if there is a match between them.
                // if so, flag the marker as matched
                // if it was matched, add it to the map. if not, remove it.
                for (let marker of markers) {
                    let matched = false;
                    for (let matchedMarker of self.matchedMarkers) {
                        if (marker.title === matchedMarker.title) {
                            matched = true;
                        }
                    }
                    (matched) ? marker.setMap(map) : marker.setMap(null);
                }
            }
        });

        // ** list click handling ** //

        // set the location, open marker corresponding to clicked location in list
        // note: when you click location the model is automatically passed in (clickedLoc)
        this.setLoc = function(clickedLoc){
            if (markers) {
                for (let marker of markers) {
                    if (clickedLoc.id === marker.id) {
                        // click the marker
                        new google.maps.event.trigger(marker, 'click');
                        // bounce the marker when location is clicked
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                        // make it stop bouncing after two bounces
                        stopAnimation(marker);
                    }
                }
            }
        };



    };

    // initialize the map
    function initMap() {

        // use a constructor to create a new map JS object. You can use the coordinates
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -26.527692, lng: 153.073633},
            zoom: 9,
        });
        const largeInfowindow = new google.maps.InfoWindow();
        const bounds = new google.maps.LatLngBounds();

        for (let i = 0; i < locations.length; i++) {
            // Get info from the locations array.
            let position = locations[i].location;
            let title = locations[i].title;
            let id = locations[i].id;
            // Create a marker per location, and put into markers array.
            let marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: id
            });
            // Push the marker to array of markers.
            markers.push(marker);

            // get wiki entry
            let wikiEntry;
            const wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+title+'&format=json&callback=wikiCallback';

            $.ajax({
                url: wikiUrl,
                dataType: 'jsonp',
                // jsonp: callback  <- for use if you want to overide above callback in url
                success: function (response) {
                    wikiEntry = response[2][0];
                }
            }).fail(function () {
                wikiEntry = 'Failed to get Wikipedia description';
            });

            // get wiki picture/thumbnail
            let wikiPic;
            const wikiPicUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cpageterms&generator=prefixsearch&redirects=1&formatversion=2&piprop=thumbnail&pithumbsize=150&pilimit=20&wbptterms=description&gpssearch='+title;
            $.ajax({
                url: wikiPicUrl,
                dataType: 'jsonp',
                // jsonp: callback  <- for use if you want to overide above callback in url
                success: function (response) {
                    wikiPic = response.query.pages[0].thumbnail.source;
                }
            }).fail(function () {
                wikiPic = 'img/fail.png';
            });

            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', function() {
                populateInfoWindow(this, largeInfowindow, wikiEntry, wikiPic);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                stopAnimation(marker);
            });
            bounds.extend(markers[i].position);
        }

        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);

        window.addEventListener('resize', function(e) {
            //Make sure the map bounds get updated on page resize
            map.fitBounds(bounds);
        });

    }

    ko.applyBindings(new ViewModel());

    function populateInfoWindow(marker, infowindow, wikiEntry, wikiPic) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker !== marker) {
            infowindow.marker = marker;
            infowindow.setContent(
                '<div style="text-align: center">'+
                    '<h3>' + marker.title + '</h3>' +
                    '<p>'+ wikiEntry + '</p>' +
                    '<img src="'+ wikiPic + '">' +
                '</div>'
            );
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick',function(){
                infowindow.setMarker = null;
            });
        }
    }

    // function googleErrorHandler() {
    //     let message = '<div class="alert alert-danger alert-dismissable">Failed to get map resources from Google </div>';
    //     $('#map').append(message);
    // }

    function stopAnimation(marker) {
        setTimeout(function () {
            marker.setAnimation(null);
        }, 1400);
    }

