
// checks if element is fully visible
function checkVisible( elm, evalType ) {
  evalType = evalType || "visible";
  var vpH = $(window).height(); // Viewport Height
  var st = $(window).scrollTop(); // Scroll Top
  var y = $(elm).offset().top;
  var elementHeight = $(elm).height();

  if (evalType === "visible") {
    return ((y < (vpH + st)) && (y > (st - elementHeight)));
  }

  if (evalType === "above") {
    return ((y < (vpH + st)));
  }  
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

$(document).ready(function () {
  // Shift nav in mobile when clicking the menu.
  $(document).on("click", "[data-toggle='wy-nav-top']", function() {
    $("[data-toggle='wy-nav-shift']").toggleClass("shift");
    $("[data-toggle='rst-versions']").toggleClass("shift");
  });

  // Close menu when you click a link.
  $(document).on("click", ".wy-menu-vertical .current ul li a", function() {
    $("[data-toggle='wy-nav-shift']").removeClass("shift");
    $("[data-toggle='rst-versions']").toggleClass("shift");
  });

  $(document).on("click", "[data-toggle='rst-current-version']", function() {
    $("[data-toggle='rst-versions']").toggleClass("shift-up");
  });

  // Make tables responsive
  $("table.docutils:not(.field-list)").wrap(
    "<div class='wy-table-responsive'></div>"
  );

  hljs.initHighlightingOnLoad();

  $("table").addClass("docutils");
});

window.SphinxRtdTheme = (function(jquery) {
  var stickyNav = (function() {
    var navBar,
      win,
      stickyNavCssClass = "stickynav",
      applyStickNav = function() {
        if (navBar.height() <= win.height()) {
          navBar.addClass(stickyNavCssClass);
        } else {
          navBar.removeClass(stickyNavCssClass);
        }
      },
      enable = function() {
        applyStickNav();
        win.on("resize", applyStickNav);
      },
      init = function() {
        navBar = jquery("nav.wy-nav-side:first");
        win = jquery(window);
      };
    jquery(init);
    return {
      enable: enable
    };
  })();
  return {
    StickyNav: stickyNav
  };
})($);

// initializes a top nav with a list of teleport versions
function handeBreadcrumbs() {
  var docVersions = window.grvConfig.docVersions || [];
  var docCurrentVer = window.grvConfig.docCurrentVer;

  function getVerUrl(ver) {
    return window.location.href.replace(docCurrentVer, ver);
  }

  var $versionList = $(
    '<div class="grv-nav-versions">' +
    ' <div class="m-r-sm"> Version </div >' +
    '</div>'
  );

  if (docVersions.length === 0) {
    $versionList.append(
      '<div class="grv-current-ver m-r-sm">' + docCurrentVer + "</div>"
    );
  }

  // show links to other versions
  for (var i = 0; i < docVersions.length; i++) {
    var ver = docVersions[i];
    var $li = null;

    if (ver === docCurrentVer) {
      $li = $('<div class="grv-ver grv-current-ver" >' + ver + "</div>");
    } else {
      var baseUrl = getVerUrl(ver);
      $li = $(
        '<div class="grv-ver" > ' +
        '  <a href="' + baseUrl + '" >' + ver + "</a>" +
        '</div>'
      );
    }

    $versionList.append($li);
  }

  var $content = $('<div class="grv-breadcrumbs-content"/>');
  $content.append($versionList);
  $content.append(    
    '<div class="grv-breadscrumbs-menu"> ' +
    '    <a class="grv-breadscrumbs-menu-item-downloads m-r-sm" ' +
    '        href="../downloads">Downloads ' +
    '    </a>  ' +
    '    <a href="https://gravitational.com">About Us</a> ' +
    '</div>'
  );

  var $breadcrumbs = $(".grv-breadcrumbs");
  $breadcrumbs.append($content);
  $breadcrumbs.append("<hr/>");

  // show warning if older version
  var isLatest =
    docVersions.length === 0 ||
    docCurrentVer === docVersions[docVersions.length - 1];
  if (!isLatest) {
    var latestVerUrl = getVerUrl(docVersions[docVersions.length - 1]);
    $breadcrumbs.append(
      '<div class="admonition warning" style="margin-bottom: 5px;"> ' +
      '   <p class="admonition-title">Version Warning</p> ' +
      '   <p>This chapter covers Teleport ' + docCurrentVer +'. We highly recommend evaluating ' +
      '   the <a href="' + latestVerUrl + '">latest</a> version instead.</p> ' +
      '</div>'
    );
  }
}

function handleDefaultFocus() {
  var $searchResultInput = $('#mkdocs-search-query');
  if ($searchResultInput.length > 0) {
    $searchResultInput.focus();
  } else {
    $('#rtd-search-form input').focus();
  }
}

function handleDownloads() {
  if (!window.grvConfig.isDownloadPage) {
    return;
  }

  const cfg = {
    baseUrl: window.grvConfig.houstonUrl,
    api: {
      releasesPath: "/webapi/releases-oss?page=:pageN"
    }
  };
  
  $('.rst-content [role="main"]').append(
    '<div class="section grv-downloads"> <div id="grv-download-id"/> </div>'
  );

  $(".grv-nav-left-item.--downloads:first").addClass("current");
  
  houstonCtrlLib.init(cfg);
  houstonCtrlLib.downloads.show("grv-download-id");
}

function handleNavScroll() {  
  var $menus = $(".toctree-l1.current");  
  var $targets = $(".section.grv-markdown").find('[id]');
  var activeClass = '--active';
  var linkMap = {};
  
  $menus.find("a").each(function (i, value) {
    var $value = $(value);
    var href = $value.attr('href').replace('#', '');
    linkMap[href] = $value;
  })
          
  function hasMenuItem(id) {
    return !!linkMap[id];        
  }
  
  function selectMenuItem(id) {    
    if (!hasMenuItem(id)) {
      return;
    }

    var $link = $(linkMap[id]);        
    $menus.find('.'+activeClass).removeClass(activeClass);
    $link.addClass(activeClass)            
  }
      
  function findAndActivateClosest() {    
    for (var i = $targets.length-1; i > 0; i--){
      var a = $(window).scrollTop();
      var b = $targets.eq(i).offset().top 
      if (b > a) {
        continue;
      }

      var id = $targets.eq(i).attr('id');
      if (hasMenuItem(id)) {
        selectMenuItem(id);
        return;
      }      
    }
  }
  
  function auto() {        
    for (var i = 0; i < $targets.length; i++) {            
      var id = $targets.eq(i).attr('id');
      if (checkVisible($targets.eq(i)) && hasMenuItem(id) ) {              
        selectMenuItem(id);
        return;
      }             
    }

    findAndActivateClosest();        
  }
  
  var hash = window.document.location.hash;
  if (!hash) {
    auto();  
  } else {
    selectMenuItem(hash.replace('#', ''));
  } 
  
  window.onscroll = debounce(auto, 50);      
}

$(document).ready(handeBreadcrumbs);
$(document).ready(handleDownloads);
$(document).ready(handleDefaultFocus);
$(document).ready(handleNavScroll);
