
var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = {'country': []};
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');

var countries = {
	'at': {
		center: {lat: 47.516231, lng: 14.550072},
		zoom: 4 
	},
	'cz': {
		center: {lat: 50.083333 , lng: 14.466667},
		zoom: 4
	},
	'dk': {
		center: {lat: 56.26392, lng: 9.501785},
		zoom: 4 
	},
	'fi': {
		center: {lat: 61.92411, lng: 25.748151},
		zoom: 4
	},
	'fr': {
		center: {lat: 46.227638, lng: 2.213749},
		zoom: 4
	},
	'de': {
		center: {lat: 51.165691, lng: 10.451526},
		zoom: 4
	},
	'gr': {
		center: {lat: 39.074208, lng: 21.824312},
		zoom: 4
	},
	'hu': {
		center: {lat: 47.162494, lng: 19.503304},
		zoom: 4
	},
	'ie': {
		center: {lat: 53.41291, lng: -8.24389},
		zoom: 4
	},
	'is': {
		center: {lat: 64.963051, lng: -19.020835},
		zoom: 4
	},
	'it': {
		center: {lat: 41.87194, lng: 12.56738},
		zoom: 4
	},
	'nl': {
		center: {lat: 52.132633, lng: 5.291266},
		zoom: 4
	},
	'no': {
		center: {lat: 60.472024, lng: 8.468946},
		zoom: 4
	},
	'pl': {
		center: {lat: 51.919438, lng: 19.145136},
		zoom: 4
	},
	'pt': {
		center: {lat: 39.399872, lng: -8.224454},
		zoom: 4
	},
	'sk': {
		center: {lat: 48.669026, lng: 19.699024},
		zoom: 4
	},
	'es': {
		center: {lat: 40.463667, lng: -3.74922},
		zoom: 4
	},
	'se': {
		center: {lat: 60.128161, lng: 18.643501},
		zoom: 4
	},
	'ch': {
		center: {lat: 46.818188, lng: 8.227512},
		zoom: 4
	},
	'uk': {
		center: {lat: 55.378051, lng: -3.435973},
		zoom: 4
	}
};

// // Initialize and add the map
// function initMap() {
// 	// The location of Europe
// 	var europe = {lat: 52.3007112, lng: 7.5177695};
// 	// The map, centered at Europe
// 	var map = new google.maps.Map(
// 		document.getElementById('map'), {
// 			zoom: 4, 
// 			center: europe
// 		});

// 	// The marker, positioned at Uluru
// 	// var marker = new google.maps.Marker({position: uluru, map: map});

// 	// Create an array of alphabetical characters used to label the markers.
// 	var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// }


function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  zoom: countries['de'].zoom,
	  center: countries['de'].center,
	  mapTypeControl: false,
	  panControl: false,
	  zoomControl: false,
	  streetViewControl: false
	});

	infoWindow = new google.maps.InfoWindow({
	  content: document.getElementById('info-content')
	});

	// Create the autocomplete object and associate it with the UI input control.
	// Restrict the search to the default country, and to place type "cities".
	autocomplete = new google.maps.places.Autocomplete(
		/** @type {!HTMLInputElement} */ (
			document.getElementById('autocomplete')), {
		  types: ['(cities)'],
		  componentRestrictions: countryRestrict
		});
	places = new google.maps.places.PlacesService(map);

	autocomplete.addListener('place_changed', onPlaceChanged);

	// Add a DOM event listener to react when the user selects a country.
	document.getElementById('country').addEventListener(
		'change', setAutocompleteCountry);
  }

  // When the user selects a city, get the place details for the city and
  // zoom the map in on the city.
  function onPlaceChanged() {
	var place = autocomplete.getPlace();
	if (place.geometry) {
	  map.panTo(place.geometry.location);
	  map.setZoom(15);
	  search();
	} else {
	  document.getElementById('autocomplete').placeholder = 'Enter a city';
	}
  }

  // Search for hotels in the selected city, within the viewport of the map.
  function search() {
	var search = {
	  bounds: map.getBounds(),
	  types: ['lodging']
	};

	places.nearbySearch(search, function(results, status) {
	  if (status === google.maps.places.PlacesServiceStatus.OK) {
		clearResults();
		clearMarkers();
		// Create a marker for each hotel found, and
		// assign a letter of the alphabetic to each marker icon.
		for (var i = 0; i < results.length; i++) {
		  var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
		  var markerIcon = MARKER_PATH + markerLetter + '.png';
		  // Use marker animation to drop the icons incrementally on the map.
		  markers[i] = new google.maps.Marker({
			position: results[i].geometry.location,
			animation: google.maps.Animation.DROP,
			icon: markerIcon
		  });
		  // If the user clicks a hotel marker, show the details of that hotel
		  // in an info window.
		  markers[i].placeResult = results[i];
		  google.maps.event.addListener(markers[i], 'click', showInfoWindow);
		  setTimeout(dropMarker(i), i * 100);
		  addResult(results[i], i);
		}
	  }
	});
  }

  function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
	  if (markers[i]) {
		markers[i].setMap(null);
	  }
	}
	markers = [];
  }

  // Set the country restriction based on user input.
  // Also center and zoom the map on the given country.
  function setAutocompleteCountry() {
	var country = document.getElementById('country').value;
	if (country == 'all') {
	  autocomplete.setComponentRestrictions({'country': []});
	//   autocomplete.setComponentRestrictions({'country': ['at','cz','dk','fi','fr','de','gr','hu','ie','is','it','nl','no','pl','pt','sk','es','se','ch','uk']});
	  map.setCenter({lat: 53, lng: 9});
	  map.setZoom(4);
	} else {
	  autocomplete.setComponentRestrictions({'country': country});
	  map.setCenter(countries[country].center);
	  map.setZoom(countries[country].zoom);
	}
	clearResults();
	clearMarkers();
  }

  function dropMarker(i) {
	return function() {
	  markers[i].setMap(map);
	};
  }

  function addResult(result, i) {
	var results = document.getElementById('results');
	var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
	var markerIcon = MARKER_PATH + markerLetter + '.png';

	var tr = document.createElement('tr');
	tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
	tr.onclick = function() {
	  google.maps.event.trigger(markers[i], 'click');
	};

	var iconTd = document.createElement('td');
	var nameTd = document.createElement('td');
	var icon = document.createElement('img');
	icon.src = markerIcon;
	icon.setAttribute('class', 'placeIcon');
	icon.setAttribute('className', 'placeIcon');
	var name = document.createTextNode(result.name);
	iconTd.appendChild(icon);
	nameTd.appendChild(name);
	tr.appendChild(iconTd);
	tr.appendChild(nameTd);
	results.appendChild(tr);
  }

  function clearResults() {
	var results = document.getElementById('results');
	while (results.childNodes[0]) {
	  results.removeChild(results.childNodes[0]);
	}
  }

  // Get the place details for a hotel. Show the information in an info window,
  // anchored on the marker for the hotel that the user selected.
  function showInfoWindow() {
	var marker = this;
	places.getDetails({placeId: marker.placeResult.place_id},
		function(place, status) {
		  if (status !== google.maps.places.PlacesServiceStatus.OK) {
			return;
		  }
		  infoWindow.open(map, marker);
		  buildIWContent(place);
		});
  }

  // Load the place information into the HTML elements used by the info window.
  function buildIWContent(place) {
	document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
		'src="' + place.icon + '"/>';
	document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
		'">' + place.name + '</a></b>';
	document.getElementById('iw-address').textContent = place.vicinity;

	if (place.formatted_phone_number) {
	  document.getElementById('iw-phone-row').style.display = '';
	  document.getElementById('iw-phone').textContent =
		  place.formatted_phone_number;
	} else {
	  document.getElementById('iw-phone-row').style.display = 'none';
	}

	// Assign a five-star rating to the hotel, using a black star ('&#10029;')
	// to indicate the rating the hotel has earned, and a white star ('&#10025;')
	// for the rating points not achieved.
	if (place.rating) {
	  var ratingHtml = '';
	  for (var i = 0; i < 5; i++) {
		if (place.rating < (i + 0.5)) {
		  ratingHtml += '&#10025;';
		} else {
		  ratingHtml += '&#10029;';
		}
	  document.getElementById('iw-rating-row').style.display = '';
	  document.getElementById('iw-rating').innerHTML = ratingHtml;
	  }
	} else {
	  document.getElementById('iw-rating-row').style.display = 'none';
	}

	// The regexp isolates the first part of the URL (domain plus subdomain)
	// to give a short URL for displaying in the info window.
	if (place.website) {
	  var fullUrl = place.website;
	  var website = hostnameRegexp.exec(place.website);
	  if (website === null) {
		website = 'http://' + place.website + '/';
		fullUrl = website;
	  }
	  document.getElementById('iw-website-row').style.display = '';
	  document.getElementById('iw-website').textContent = website;
	} else {
	  document.getElementById('iw-website-row').style.display = 'none';
	}
  }




