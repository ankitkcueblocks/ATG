var app = angular.module("atg", ["ngRoute", 'ngSanitize'])
        .factory("interceptors", [function () {

                return {
                    // if beforeSend is defined call it
                    'request': function (request) {

                        if (request.beforeSend)
                            request.beforeSend();

                        return request;
                    },
                    // if complete is defined call it
                    'response': function (response) {

                        if (response.config.complete)
                            response.config.complete(response);

                        return response;
                    }
                };

            }])
        .config(function ($routeProvider, $locationProvider, $httpProvider) {
            $routeProvider
                    .when("/dashboard", {
                        templateUrl: "pages/dashboard.html",
                        controller: "dashboardCtrl",
                        controllerAs: "dashboard"
                    })
                    .when("/search", {
                        templateUrl: "pages/search.html",
                        controller: "searchCtrl",
                        controllerAs: "search",
                    })
                    .when("/browse", {
                        templateUrl: "pages/browse.html",
                        controller: "browseCtrl",
                        controllerAs: "browse",
                    })
                    .when("/detail/:id", {
                        templateUrl: "pages/detail.html",
                        controller: "detailCtrl",
                        controllerAs: "detail",
                    })
                    .when("/single", {
                        templateUrl: "pages/single.html",
                        controller: "singleCtrl",
                        controllerAs: "single",
                    })
                    .otherwise({
                        redirectTo: '/dashboard'
                    });

            // configure html5 to get links working on jsfiddle
            $locationProvider.hashPrefix('');

            $httpProvider.interceptors.push('interceptors');
        })

        .controller("dashboardCtrl", function ($http) {
            this.barcode = function () {
                var id = scan($http);
            }
        })
        .controller("searchCtrl", function ($http, $location, $anchorScroll) {

            var th = this;

            if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                var d = document.getElementById("searchBar");
                d.className += " i-search";
            }

            $http({
                method: 'GET',
                cache: true,
                url: 'https://apps.cueblocks.com/atg_app/app/get_all_products',
                beforeSend: function () {
                    show_loader();
                },
                complete: function () {
                    hide_loader();
                }
            })
                    .then(function (response) {
                        var replacement = '_medium.';
                        var item = response.data;
                        //console.log(item[2]);
                        var i;
                        for (i = 0; i < item.length; i++) {
                            if (item[i].image != null && item[i].image.src.indexOf('.') >= 0) {

                                item[i].image.src = item[i].image.src.replace(/.([^.]*)$/, replacement + '$1'); //a_b!c
                            }
                        }
                        th.products = item;
                        th.noResult = '<span>OOPS!</span>No Product found!';
                        setTimeout(function () {
                            //equalheight('.browseProducts li');
                        }, 100);

                    },
                            function (response) {
                                //console.log(response);
                            }
                    );

            th.isActive = false;
            th.toggleField = function () {
                th.isActive = !th.isActive;

                if (th.isActive) {
                    setTimeout(function () {
                        $('#searchField').focus();
                    }, 100);
                } else {
                    th.searchText = '';
                }

            }
        })
        .controller("browseCtrl", function ($http) {
            var th = this;

            var staticQueAns = [
                {
                    'que': "How to place an order? / I wasn’t able to add ‘Seed(s) to cart on the webstore. How can I place the order now.",
                    'ans': '<p>For placing an order you can visit our online store, <a href="http://www.allthatgrows.in/">www.allthatgrows.in</a>, browse through our seeds collection and add to cart all that you have finalized. On the checkout page choose the preferred payment method and you are done!</p><p>In case, there’s some problem in buying directly from our online store. You can also contact us on email hello@allthatgrows.in or call us at 8968675588 with the product(s) name and quantity required with complete mailing address and the preferred payment method.</p> '

                },
                {
                    'que': "How will you ship my order to me?",
                    'ans': '<p>All orders are shipped via Delhivery & India Post.</p>'

                },
                {
                    'que': "How long until I receive my order?",
                    'ans': '<p>The receipt of your order will depend on the mode of your payment. Please see below the processing time for deliver for different order types:<p><span>PROCESSING TIME FOR DELIVERY:</span></p><p> For COD orders: 8 - 10 days</p><p> For Online Transaction Orders: 5 - 6 days</p> </p>'
                },
                {
                    'que': "What do I do if I receive something other than what was ordered?",
                    'ans': '<p>We regret any inconvenience caused to you from our end, but we, at AllThatGrows, are ever-ready to help you. In case you receive a package with items missing or containing something other than what you ordered, then you can reach out to us via email <a href="mailto:hello@allthatgrows.in">hello@allthatgrows.in</a> or call us at 8968675588.</p>'
                },
                {
                    'que': "Do you ship internationally?",
                    'ans': '<p>No, currently our shipping is restricted to regions within India itself. We offer free nationwide shipping and do NOT ship outside India.</p>'
                },
                {
                    'que': "What if I am not satisfied with the quality of the product received?",
                    'ans': '<p>We have strict quality check measures and if the product you receive is not up to the mark or as expected then we will do the best to resolve the situation. You can write to us at <a href="mailto:hello@allthatgrows.in">hello@allthatgrows.in</a> or call at 8968675588 to report an issue and we will make sure the necessary corrective steps are taken.</p>'
                },
                {
                    'que': "Can I return the order if I don't want the particular seed at the time?",
                    'ans': '<p>Yes, you can. Please check out our ‘<a href="https://www.allthatgrows.in/pages/return-policy">Returns policy</a>’ to return the order which is not as per your requirement.</p>'
                },
                {
                    'que': "What if I want to change the delivery address and date, after the order has been shipped?",
                    'ans': '<p>The delivery address and the date can only be modified before the order is shipped and not at a later stage.</p>'
                }
            ]

            th.queAns = staticQueAns;
            th.isSubmit = false;
            th.isActive = false;
            th.toggleQueAns = function ($event) {
                // add class to answers
                angular.element($event.currentTarget).parent().next().toggleClass("active");
                //toggle class on click question
                angular.element($event.currentTarget).toggleClass("active");
            }

            th.toggleField = function () {

                th.isActive = !th.isActive;
            }

            th.formData = {};
            th.processForm = function (form) {
                if (form.$valid) {
                    $http({
                        method: "POST",
                        url: 'https://apps.cueblocks.com/atg_app/app/submit_query/',
                        data: $.param(th.formData), // pass in data as strings
                        beforeSend: function () {
                            show_loader();
                        },
                        complete: function () {
                            hide_loader();
                        },
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
                    })
                            .then(function (response) {
                                // show success message
                                th.isSubmit = true;

                                // scroll to top
                                $('html, body').animate({
                                    scrollTop: 0
                                });

                                // empty all input fields
                                form.$setPristine();
                                th.name = th.email = th.phone = th.message = th.submitted = false;
                                th.formData = {};


                            }, function (response) {

                            })
                }
            };

            $('.faq-btn-active').click(function () {
                $(this).fadeOut();
                if ($(window).scrollTop() > 0) {
                    $('html, body').animate({
                        scrollTop: 0
                    }, 300, function () {
                        $('.haveaQExpanded form').slideDown();
                    });
                } else {
                    $('.haveaQExpanded form').slideDown();
                }
            });

            $('.faq-btn-inactive').click(function () {
                $('.haveaQExpanded form').slideUp(function () {
                    $('.faq-btn-active').fadeIn();
                });

            });
        })
        .controller("detailCtrl", function ($http, $routeParams) {
            var th = this;

            $http({
                method: 'GET',
                cache: true,
                url: 'https://apps.cueblocks.com/atg_app/app/get_product/' + $routeParams.id,
                beforeSend: function () {
                    show_loader();
                },
                complete: function () {
                    hide_loader();
                }
            })
                    .then(function (response) {
                        if (response.data != '') {


                            // script for removing month tags
                            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                            var tags = response.data.tags.split(',');
                            var newTags = '';
                            for (var i = 0; i < tags.length; i++) {
                                if (months.indexOf(tags[i].trim()) <= 0) {
                                    newTags += tags[i] + ',';
                                }
                            }
                            response.data.tags = newTags.replace(/,\s*$/, "");

                            //script for meta details
                            var meta = response.data.meta;
                            var how_to_harvest = [];
                            var how_to_plant = [];
                            var req_to_grow = [];
                            var nutrition = [];
                            var benefit = [];
                            var desc_titles = [];
                            var have_desc = false;
                            var value, digit, unit;
                            console.log(meta);
                            for (var i = 0; i < meta.length; i++) {

                                // set how to harvest
                                if (meta[i].namespace.trim() == 'how_to_harvest') {
                                    how_to_harvest.push({key: meta[i].key, value: meta[i].value});
                                    have_desc = true;
                                }

                                // set how to plant
                                if (meta[i].namespace.trim() == 'how_to_plant') {
                                    how_to_plant.push({key: meta[i].key, value: meta[i].value});
                                    have_desc = true;
                                }

                                // set how to grow
                                if (meta[i].namespace.trim() == 'requirements_to_grow') {
                                    req_to_grow.push({key: meta[i].key, value: meta[i].value});
                                    have_desc = true;
                                }

                                // set nutrition
                                if (meta[i].namespace.trim() == 'nutrition') {
                                    if (meta[i].key.trim() == 'introduction') {
                                        th.nutrition_intro = meta[i].value;
                                    } else if (meta[i].value.trim() != '~' && meta[i].value.trim() != '-') {

                                        // set span in between digit and unit
                                        unit = meta[i].value.replace(/[^a-zA-Z]+/g, '').trim();
                                        digit = meta[i].value.replace(/[a-zA-Z]+/g, '').trim();

                                        value = digit + '<span>' + unit + '</span>'
                                        nutrition.push({key: meta[i].key, value: value});
                                    }
                                    have_desc = true;
                                }

                                // set benefits
                                if (meta[i].namespace.trim() == 'health_benefit') {
                                    benefit.push({key: meta[i].key, value: meta[i].value});
                                    have_desc = true;
                                }
                            }

                            if (how_to_plant.length !== 0)
                                desc_titles.push({key: 'How to Plant'});
                            if (req_to_grow.length !== 0)
                                desc_titles.push({key: 'How to Grow'});
                            if (how_to_harvest.length !== 0)
                                desc_titles.push({key: 'How to Harvest'});
                            if (nutrition.length !== 0)
                                desc_titles.push({key: 'Nutrition Value'});
                            if (benefit.length !== 0)
                                desc_titles.push({key: 'Health Benefit'});

                            th.desc_titles = desc_titles;

                            th.how_to_harvest = how_to_harvest;
                            th.how_to_plant = how_to_plant;
                            th.req_to_grow = req_to_grow;
                            th.nutrition = nutrition;
                            th.benefit = benefit;
                            th.have_desc = have_desc;

                            th.product = response.data;
                            th.description = response.data.body_html;

                            setTimeout(function () {
                                singlePage();
                            }, 100);

                        } else {
                            alert("No seed found");
                            history.back();
                        }
                    },
                            function (response) {
                                alert('here');
                                alert("No seed found");
                                history.back();
                            }
                    );


        });


function scan()
{
    cordova.plugins.barcodeScanner.scan(
            function (result) {
                window.location = '#/detail/' + result.text;
            },
            function (error) {
                alert("Scanning failed: " + error);
            },
            {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: false, // iOS and Android
                showTorchButton: false, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: "Place a barcode inside the scan area", // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS
            }

    );
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    if (navigator.connection.type == 0)
    {
        alert('This application requires internet. Please connect to the internet.');
        navigator.app.exitApp();
    } else if (navigator.connection.type == 'none')
    {
        alert('This application requires internet. Please connect to the internet.');
        navigator.app.exitApp();
    }

    document.addEventListener("backbutton", function (e) {
        if (window.location.hash === "#/dashboard") {
            if (confirm("Do you want to exit ATG?")) {
                navigator.app.exitApp();
            }
        } else {
            navigator.app.backHistory();
        }
    }, false);


    document.addEventListener("offline", onOffline, false);
    document.addEventListener("online", ononline, false);

    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
//        var d = document.getElementById("searchBar");
        //var blank = document.getElementById("i-phone_blank");
//        d.className += " i-search";
        //blank.className += "blank";
        //blank.classList.add("blank");
    }


}

function show_loader() {
    document.getElementById('loader').style.display = 'block';
}

function hide_loader() {
    document.getElementById('loader').style.display = 'none';
}


/* Thanks to CSS Tricks for pointing out this bit of jQuery
 http://css-tricks.com/equal-height-blocks-in-rows/
 It's been modified into a function called at page load and then each time the page is resized. One large modification was to remove the set height before each new calculation. */

equalheight = function (container) {
    var currentTallest = 0,
            currentRowStart = 0,
            rowDivs = new Array(),
            $el,
            topPosition = 0;
    $(container).each(function () {

        $el = $(this);
        $($el).height('auto')
        topPostion = $el.position().top;

        if (currentRowStart != topPostion) {
            for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }
            rowDivs.length = 0; // empty the array
            currentRowStart = topPostion;
            currentTallest = $el.height();
            rowDivs.push($el);
        } else {
            rowDivs.push($el);
            currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
        }
        for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
            rowDivs[currentDiv].height(currentTallest);
        }
    });
}

$('.searchIcon').click(function () {
    $(this).toggleClass('offBtn');
});

function singlePage() {
    $('.product-detail-slider').slick({
        centerMode: true,
        arrows: false,
        infinite: true,
        centerPadding: '20px',
        autoplay: false,
        slidesToShow: 1,
        draggable: false,
        adaptiveHeight: true,
        //cssEase: 'linear',
        responsive: [{
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '20px',
                    slidesToShow: 1
                }
            }, {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '20px',
                    slidesToShow: 1
                }
            }]
    });

    $('.product-detail-slider').on('beforeChange', function () {
        $('.product-detail-slider').slick('slickSetOption', 'adaptiveHeight', false);
    });

    $('.product-detail-slider').on('afterChange', function () {
        $('.product-detail-slider').slick('slickSetOption', 'adaptiveHeight', true);
    });

    $('.next').click(function (e) {
        e.preventDefault();
        $('.product-detail-slider').slick("slickNext");
    })

    $('.productmenu-block ul li').each(function (i) {
        $('.productmenu-block .slide-' + i + ' a').click(function () {
            $('.product-detail-slider').slick('slickGoTo', i);
            $('.productdetail-block').addClass('slide');
            setTimeout(function () {
                $('.productmenu-block').hide();
            }, 500);
        });
    });

    $('.prev').click(function () {
        $('.productdetail-block').removeClass('slide');
        $('.productmenu-block').show();

    });
}



function onOffline() {
    // Handle the offline event

    //alert('Internet Gone');
}

function ononline() {
    // Handle the offline event

    //alert('Internet Started');
}