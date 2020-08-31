
//    </div >//Getting started with the client side on the Weavy DocSite https://docs.weavy.com/sdk/client

console.log("enabler.js");

Weavy.defaults.url = "https://twentyfouronoff.weavycloud.com/";
//Weavy.defaults.url = "https://localhost:44323/";

//global variables
var intervalAppMenu;
var intervalProjects;
var intervalReinsert;
var userId;
var sJWT;
var weavy;


// can be linked to existing user profile images 
// you can also do things like 
var profileImages = {
    dave: "https://i.imgur.com/fswFJVU.jpg",
    frank: "https://i.imgur.com/QUPCJNj.png",
    joseph: "https://i.imgur.com/YVPi2Ru.png",
    matt: "https://i.imgur.com/cpaqdMz.png",
    rickard: "https://i.imgur.com/zZO1udE.png",
    vard: "https://i.imgur.com/SXXLhAg.png",
    allen: "https://i.imgur.com/HXNVZZn.png",
};

var profileNames = {
    dave: "Dave Koncsol",
    frank: "Frank Sinatra",
    joseph: "Joseph Yo",
    matt: "Matt Kim",
    rickard: "Rickard Hansson",
    vard: "Vard Sargsyan",
    allen: "Allen Sales",
};

//ICONS
var messengerIconSVG = `
    <svg class="weavy-svg" viewBox="0 0 24 24" width="24" height="18" ><path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20" /></svg>`;


var notificationsIconSVG = `
<svg class="weavy-svg" viewBox="0 0 24 24" width="24" height="18"><path d="M16,17H7V10.5C7,8 9,6 11.5,6C14,6 16,8 16,10.5M18,16V10.5C18,7.43 15.86,4.86 13,4.18V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V4.18C7.13,4.86 5,7.43 5,10.5V16L3,18V19H20V18M11.5,22A2,2 0 0,0 13.5,20H9.5A2,2 0 0,0 11.5,22Z" /></svg>

`;
var hubIconSVG = `
<svg class="weavy-svg" viewBox="0 0 24 24" width="24" height="18"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>
        `;



var messengerIcon = `

<a class="notification_link ng-scope weavy-messenger-btn">
                    <i class="fa fa-comment-o" aria-hidden="true"></i>
                    
                </a>
              

`;

var hubIcon = `

<a class="notification_link ng-scope weavy-hub-btn">
                    <i class="fa fa-circle-o" aria-hidden="true"></i>
                    
                </a>
`;

var notificationsIcon = `
<a class="notification_link ng-scope weavy-notifications-btn">
                    <i class="fa fa-bell-o" aria-hidden="true"></i>
                    
                </a>
`;





(function ($) {

    function initialURLCheck() {
        var url = window.location.pathname;
        console.log("url check run");
        if ($('.weavy-messenger-btn').length < 1) {
            intervalReinsert = window.setInterval(reInsertMenu, 200);
        }

        if (url.includes("/projects/")) {
            console.log("articles");
            intervalProjects = window.setInterval(findProjectsStage, 200);
        }
      
    }



    // listen for url change
    $(window).bind('hashchange', function () {
    });

    function hashHandler() {
        this.oldHash = window.location.pathname;
        this.Check;
        var that = this;
        var detect = function () {
            if (that.oldHash != window.location.pathname) {
                console.log('hash changed')
                initialURLCheck();
                that.oldHash = window.location.pathname;
            }
        };
        this.Check = setInterval(function () { detect() }, 100);
    }

    var hashChanged = new hashHandler();

    window.addEventListener("hashchange", hashChanged);

    //messenger click
    $(document).on("click", ".weavy-messenger-btn", function () {
        console.log("clicked")
        weavy.space("main").toggle({ type: "messenger", key: "main-messenger" });
    });
    //notifications click
    $(document).on("click", ".weavy-notifications-btn", function () {
        weavy.space("main").toggle({ type: "notifications", key: "main-notifications" });
    });

    //hub click
    $(document).on("click", ".weavy-hub-btn", function () {
        weavy.space("main").toggle({ type: "posts", name: "Hub", key: "main-hub" });
    });




    //window intervals
    intervalAppMenu = window.setInterval(findAppMenu, 1000);


    //find Stage for injection 
    function findAppMenu() {
        var $menu = $('.top-bar__right-block');
        console.log($menu);
        if ($menu.length) {
            window.clearInterval(intervalAppMenu);
            $('.top-bar__left-block').find('p').hide()
            addGlobalWidgets($menu);
        }
    };


    function reInsertMenu() {
        var $menu = $('.top-bar__right-block');
        console.log($menu);
        if ($menu.length && $('.weavy-messenger-btn').length <1) {
            console.log('reinsert')
            window.clearInterval(intervalReinsert);
            $('.top-bar__left-block').find('p').hide();
            function insert($menu) {
                $menu.append(notificationsIcon);
                $menu.append(hubIcon);
                $menu.append(messengerIcon);
            }
        }
    };


    function findProjectsStage() {
        var $container = $('.project-inf-block.project-inf-block--deviations');
        if ($container.length) {
            window.clearInterval(intervalProjects);
            addProjectsWidgets($container);
            console.log($container, "container")
        } 
    }
  

    // initialize initial Weavy instance and add global widgets
    function addGlobalWidgets($menu) {
        $menu.append(notificationsIcon);
        $menu.append(hubIcon);
        $menu.append(messengerIcon);
 
        $("body").append(`<div class="widget-drawer"><div class="weavy-widget"></div></div>`);

        try {
            console.log(weavy.space("main").apps)
            weavy.space("main").apps.forEach(function (app) {
                $(`.weavy-${app.name.toLowerCase()}`).replaceWith(app.container[0])
            })
        }

        catch {

            // Single Sign-On - https://docs.weavy.com/sdk/client/sso
            // email for SSO - 
            userId = "dave424@weavy.com";

            // Header
            var oHeader = { alg: 'HS256', typ: 'JWT' };
            // Payload
            var oPayload = {};
            var tNow = KJUR.jws.IntDate.get('now');
            var tEnd = KJUR.jws.IntDate.get('now + 1day');
            oPayload.iss = "http://localhost:44323/";
            oPayload.sub = userId;
            oPayload.email = userId;
            oPayload.exp = tEnd;
            oPayload.picture = profileImages[userId.split("@")[0].match(/[0-9]/gi) ? userId.split("@")[0].split(/[0-9]/gi)[0] : userId.split("@")[0]];
            oPayload.name = profileNames[userId.split("@")[0].match(/[0-9]/gi) ? userId.split("@")[0].split(/[0-9]/gi)[0] : userId.split("@")[0]];

            // Sign JWT, password=616161
            var sHeader = JSON.stringify(oHeader);
            var sPayload = JSON.stringify(oPayload);
            var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "astrolabs");

            weavy = window.weavy = new Weavy({
                jwt: sJWT,
                spaces: [
                    {
                        key: "main",
                        container: $(".weavy-widget"),
                        tabbed: true,
                        apps: [
                            { type: "messenger", key: "main-messenger"},
                            { type: "notifications", key: "main-notifications"},
                            { type: "posts", key: "main-hub", name: "Hub" },
                        ]
                    },
                ]
            });

            
            weavy.maximize = () => { };

            console.log(weavy);

            /// handle badge updates

            weavy.on("badge", function (e, data) {
                var messenger = $(".weavy-messenger-btn");
                var notifications = $(".weavy-notifications-btn");
                console.log(data)
                if (data.conversations > 0) {
                    messenger.find(".badge").remove()
                    messenger.append(`<div class="badge">${data.conversations}</div>`)
                } else { 
                messenger.find(".badge").remove();
            }
                if (data.notifications > 0) {
                    notifications.find(".badge").remove()
                    notifications.append(`<div class="badge">${data.notifications}</div>`)
                }else {
                    notifications.find(".badge").remove()
                }
                console.log(data)
            });

            // what happens when a certain app opens
            weavy.on("open", function (e, open) {
                if (open.space.options.key === "main") {
                    $(`.widget-drawer`).addClass("widget-drawer-in");


                } /*else {
                    $(`.weavy-${open.app.type}`).parent('li').addClass("active");
                }*/
            });
            // what happens when a certain app closes
            weavy.on("close", function (e, close) {
                console.log(close.space.options.key, "close- key")
                if (close.space.options.key === "main") {
                    $(`.widget-drawer`).removeClass("widget-drawer-in");
                } /*else {
                    $(`.weavy-${close.app.type}`).parent('li').removeClass("active");
                }
            */
            });

            weavy.on("message-inserted.weavy.rtmweavy", function (e, message) {
            });
        }
        initialURLCheck();
    }

    //creating spaces functions - https://docs.weavy.com/sdk/client/structure

    function addProjectsWidgets($container) {
        var key = window.location.search;
        $container.before(`<ul class="nav nav-tabs nav-justified" style="border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;">
                    <li><a class="Button weavy-posts-btn">Posts</a></li><li><a class="Button weavy-files-btn">Files</a></li><li><a class="Button weavy-tasks-btn">Tasks</a></li>
                   
                </div>`)
        $container.before(`<div class="weavy-space">`);
     
        weavy.space({ key: key, container: $(".weavy-space"), tabbed: true}).app(
            [
                { type: "posts", key: key + "posts", tabbed:true },
                { type: "files", key: key + "files", tabbed: true },
                { type: "tasks", key: key + "tasks", tabbed: true }
            ]);
        weavy.space(key).toggle({ type: "posts", key: key + "posts" })
        $(document).on('click', '.weavy-posts-btn', function () {
            console.log('posts')
            weavy.space(key).open({ type: "posts", key: key + "posts" })
        })
        $('.weavy-files-btn').click(function () {
            console.log('posts')
            weavy.space(key).open({ type: "files", key: key + "files" })
        })
        $('.weavy-tasks-btn').click(function () {
            console.log('posts')
            weavy.space(key).open({ type: "tasks", key: key + "tasks" })
        })      
    }



})(jQuery);




//var messengerIconSVG = `
//    <svg viewBox="0 0 24 24" width="18" height="18" ><path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H6L4,18V4H20" /></svg>`;


//var notificationsIconSVG = `
//<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>
//          `;
//var hubIconSVG = `
//<svg viewBox="0 0 24 24" width="18" height="18"><path d="M16,17H7V10.5C7,8 9,6 11.5,6C14,6 16,8 16,10.5M18,16V10.5C18,7.43 15.86,4.86 13,4.18V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V4.18C7.13,4.86 5,7.43 5,10.5V16L3,18V19H20V18M11.5,22A2,2 0 0,0 13.5,20H9.5A2,2 0 0,0 11.5,22Z" /></svg>
//        `;