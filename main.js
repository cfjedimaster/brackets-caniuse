/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window, Mustache */

define(function (require, exports, module) {
    'use strict';

    var
        featureHtml     = require("text!templates/feature.html"),
        catlistHtml     = require("text!templates/catlist.html"),
        mainHtml        = require("text!templates/display.html");

    var Commands                = brackets.getModule("command/Commands"),
        CommandManager          = brackets.getModule("command/CommandManager"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        NativeFileSystem        = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils               = brackets.getModule("file/FileUtils"),
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        Menus                   = brackets.getModule("command/Menus"),
        Resizer                 = brackets.getModule("utils/Resizer");
    
    //commands
    var VIEW_HIDE_CANIUSE = "caniuse.run";
    var categories = [];
    var loaded = false;
    var featureList = {};

    //hard coded list of browsers we care about, also must match order of display table
    var browserList = ["ie", "firefox", "chrome", "safari", "opera", "ios_saf", "android"];
    var browserVersionLookup = {};

    function handleFeatureFocus(e) {
        if (e.type === 'click') { $(this).focus() }
        displayFeature($(this).data("featureid"));
    }

    function displayFeature(id) {
        var feature = featureList[id];
        var data;
        //console.log(feature);
        //Bit of manipulation for things Mustache can't do - but most likely my fault
        feature.totalUsage = (feature.usage_perc_y + feature.usage_perc_a).toFixed(2);
        //This is the biggest manipulation. Going to try to cache this a bit.
        feature.featuresupport = [];

        var vList = [{label:"Previous",key:"previous"}, {label:"Current",key:"current"}, {label:"Near Future",key:"future"}];

        vList.forEach(function(v) {

            data = {label : v.label};
            data.browsers = [];
            for (var i = 0, len = browserList.length; i < len; i++) {
                var browser = browserList[i];
                var version = browserVersionLookup[browser][v.key];
                var supportclass = feature.stats[browser][version];
                if(supportclass) supportclass = "caniuse_"+supportclass;
                data.browsers.push({"supportclass" : supportclass, "version" : version});
            }

            feature.featuresupport.push(data);

        });

        var s = Mustache.render(featureHtml,feature);
        $("#caniuse_supportdisplay").html(s);
    }

    function filterFeatures() {
        var f = $('#caniuse_filter').val().toLowerCase().trim();
        var hasMatches = false;
        $("#caniuse .caniuse_cat").each(function() {
            var catHasMatches = false;
            $(".caniuse_feature", this).each(function(index,elm) {
                var text = $(this).text().toLowerCase();
                if(text.indexOf(f) === -1) { $(this).hide();  }
                else {
                    $(this).show();
                    catHasMatches = hasMatches = true;
                }
            });
            if (catHasMatches) { $(this).show() }
            else { $(this).hide(); }
        });
        if (hasMatches) { $('#caniuse .caniuse_noMatches').hide() }
        else { $('#caniuse .caniuse_noMatches').show() }
    }

    function handleKeyboard(e) {
        var $targetEl = null;

        // The filter input is the event source
        if ($(this).is('input')) {
            // Down arrow key
            if (e.keyCode === 40 && isKeyPlain(e))
                $targetEl = $("#caniuse .caniuse_feature:visible:eq(0)")
            filterFeatures();
        // A feature in the list is the event source
        // Down arrow key or J key
        } else if ((e.keyCode === 40 || e.keyCode === 74) && isKeyPlain(e)) {
            e.preventDefault();
            $targetEl = $(this).nextAll('.caniuse_feature:visible:eq(0)');
            if (! $targetEl.length)
                $targetEl = $(this).parent().nextAll('.caniuse_cat:visible:eq(0)').find('.caniuse_feature:visible:eq(0)');
        // Up arrow key or K key
        } else if ((e.keyCode === 38 || e.keyCode === 75) && isKeyPlain(e)) {
            e.preventDefault();
            $targetEl = $(this).prevAll('.caniuse_feature:visible:eq(0)');
            if (! $targetEl.length)
                $targetEl = $(this).parent().prevAll('.caniuse_cat:visible:eq(0)').find('.caniuse_feature:visible:last');
            if (! $targetEl.length)
                $targetEl = $('#caniuse_filter');
        }
        $targetEl && $targetEl.focus();
    }

    function isKeyPlain(e) {
        return ! e.altKey && ! e.shiftKey && ! e.ctrlKey && ! e.metaKey;
    }

    function renderData(rawdata) {

        /*
        Going to create a browswerVersionLookup table that allows me to do
        browserVersionLookup[browserkey].previous == "some version num"
        Then I can use "some version num" in the features.stats lookup.
        This makes sense. Honest.
        */
        for(var i=0, len=browserList.length; i<len; i++) {
            var browser = browserList[i];
            //our hard coded logic for prev/current/next is based on
            //positions in the array
            var s = {"previous":rawdata.agents[browser].versions[16], 
                     "current":rawdata.agents[browser].versions[17],
                     "future":rawdata.agents[browser].versions[18]}
            browserVersionLookup[browser] = s;
        }

        var catLookup = {};

        for (var key in rawdata.cats) {
            categories.push({name: key, features: [], subcategories: rawdata.cats[key]});
            for (var i = 0, len = rawdata.cats[key].length; i < len; i++) {
                catLookup[rawdata.cats[key][i]] = key;
            }
        }

        for (key in rawdata.data) {
            var feature = rawdata.data[key];
            featureList[key] = feature;
            //each feature can have multiple categories, but they appear to always be within one core cat
            var cat = catLookup[feature.categories[0]];
            for (var i = 0, len = categories.length; i < len; i++) {
                if (categories[i].name === cat) {
                    //add an in ID field
                    feature.id = key;
                    categories[i].features.push(feature);
                    break;
                }
            }
        }

        var s = Mustache.render(catlistHtml,{"categories":categories});

        $("#caniuse_catlist").html(s);
        $("#caniuse_supportdisplay").html("");

        $("#caniuse_filter").on("keyup", handleKeyboard);
        $("#caniuse .caniuse_feature").on("keydown", handleKeyboard);
        
        $("#caniuse .caniuse_feature").on("click focus", handleFeatureFocus);

        loaded = true;
    }

    function showFeatureIfOnlyOneMatch() {
        var $matches = $("#caniuse .caniuse_feature:visible")
        if ($matches.length === 1) { displayFeature($matches.attr('data-featureid')) }
    }

    function _handleShowCanIUse() {
        var $caniuse = $("#caniuse");
        var $filter = $("#caniuse_filter");
        
        if ($caniuse.css("display") === "none") {
            $caniuse.show();
            CommandManager.get(VIEW_HIDE_CANIUSE).setChecked(true);

            // Filter on the selected text if any
            var editor = EditorManager.getFocusedEditor();
            var selectedText = editor && editor.getSelectedText();
            if (selectedText && selectedText !== $filter.val()) {
                $filter.val(selectedText);
                $("#caniuse_supportdisplay").empty();
            }

            // Focus the filter field
            $filter.focus();
            
            //get data if we don't have it yet
            if (!loaded) {
                $("#caniuse_supportdisplay").html("Getting stuff - stand by and be patient.");
                var moduleDir = FileUtils.getNativeModuleDirectoryPath(module);
                var dataFile = new NativeFileSystem.FileEntry(moduleDir + '/data.json');
                FileUtils.readAsText(dataFile)
                    .done(function (text, readTimestamp) {
                        renderData(JSON.parse(text));
                        filterFeatures();
                        showFeatureIfOnlyOneMatch();
                    })
                    .fail(function (error) {
                        FileUtils.showFileOpenError(error.name, dataFile);
                    });

            } else {
                filterFeatures();
                showFeatureIfOnlyOneMatch();
            }
        } else {
            $caniuse.hide();
            CommandManager.get(VIEW_HIDE_CANIUSE).setChecked(false);
            EditorManager.focusEditor();
        }
        EditorManager.resizeEditor();
    }
    
    CommandManager.register("Show CanIUse", VIEW_HIDE_CANIUSE, _handleShowCanIUse);

    function init() {
        
        ExtensionUtils.loadStyleSheet(module, "caniuse-brackets.css");

        //add the HTML UI
        var s = Mustache.render(mainHtml);
        $(s).insertBefore("#status-bar");

        $('#caniuse').hide();
        
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(VIEW_HIDE_CANIUSE, "Ctrl-Alt-U", Menus.AFTER);

        $('#caniuse .close').click(function () {
            CommandManager.execute(VIEW_HIDE_CANIUSE);
        });

        // AppInit.htmlReady() has already executed before extensions are loaded
        // so, for now, we need to call this ourself
        Resizer.makeResizable($('#caniuse').get(0), "vert", "top", 200);
    }
    
    init();
    
});