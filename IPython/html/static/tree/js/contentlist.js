//----------------------------------------------------------------------------
//  Copyright (C) 2008-2011  The IPython Development Team
//
//  Distributed under the terms of the BSD License.  The full license is in
//  the file COPYING, distributed as part of this software.
//----------------------------------------------------------------------------

//============================================================================
// ContentList
//============================================================================

var IPython = (function (IPython) {

    var ContentList = function (selector) {
        this.selector = selector;
        if (this.selector !== undefined) {
            this.element = $(selector);
            this.style();
            this.bind_events();
        };
        this.folders = new Array();
    };

    ContentList.prototype.style = function() {
        $('#content_list_header').addClass('list_header');
        this.element.addClass("list_container");
    };

    ContentList.prototype.bind_events = function () {
        var that = this;
        this.element.bind('dragover', function () {
            return false;
        });
        this.element.bind('drop', function(event){
            that.handelFilesUpload(event,'drop');
            return false;
        });
    };

    ContentList.prototype.baseProjectUrl = function () {
        return $('body').data('baseProjectUrl');
    };

    ContentList.prototype.contentPath = function() {
        var path = $('body').data('notebookPath');
        path = decodeURIComponent(path);
        return path;
    };

    ContentList.prototype.clear_list = function () {
        this.folders = new Array();
        this.element.children('.list_item').remove();
    };

    ContentList.prototype.test_folder_name = function(name) {
        var l = this.folders.length;
        for (i=0; i<l; i++) {
            if (this.folders[i] == name) {
                return false;
            };
        };
        return true;
    };

    ContentList.prototype.load_list = function() {
        var that = this;
        var settings = {
            processData : false,
            cache : false,
            type : "GET",
            dataType : "json",
            success : $.proxy(this.list_loaded, this),
            error : $.proxy( function(){
                that.list_loaded([], null, null, {msg:"Error connecting to server."});
                             },this)
        };

        var url = this.baseProjectUrl() + 'api/contents' + this.contentPath();
        $.ajax(url, settings);
    };
    
    ContentList.prototype.list_loaded = function (data, status, xhr, param) {
        var len = data.length;
        this.clear_list();
        for (var i=0; i<len; i++) {
            if (data[i].type == "dir") {
                this.folders.push(data[i].name)
            };
        };
        var len = this.folders.length;
        if (this.contentPath() != '') {
            var item = this.new_item(0)
            this.add_link_up_level(this.contentPath(), item);
        };
        for (var i=0; i<len; i++) {
            var name = this.folders[i];
            var path = this.contentPath();
            var item = this.new_item(i);
            this.add_link(path, name, item);
            name = this.contentPath() + name;
        };

    };


    ContentList.prototype.new_item = function (index) {
        var item = $('<div/>').addClass("list_item").addClass("row-fluid");
        
        item.append($("<div/>").addClass("span12").css("font-weight", 'bold').append(
            $("<a/>").addClass("item_link").append(
                $("<i/>").addClass("icon-folder-close")).append(
                $("<span/>").addClass("item_name")
            )
        ).append(
            $('<div/>').addClass("item_buttons btn-group pull-right")
        ));
        
        this.element.append(item);
        return item;
    };


    ContentList.prototype.add_link = function (path, name, item) {
        item.data('name', name);
        item.data('path', path);
        item.find(".item_name").text(" " + name);
        item.find("a.item_link")
            .attr('href', this.baseProjectUrl() + "tree" + this.contentPath() + name);
    };


    ContentList.prototype.add_link_up_level = function(path, item) {
        var crumbs = path.split('/');
        var new_crumbs = crumbs.splice(0,crumbs.length-2);
        var new_path = new_crumbs.join('/');
        item.find(".item_name").text(" ..");
        item.find("a.item_link")
            .attr('href', this.baseProjectUrl() + "tree" + new_path)
    };

    ContentList.prototype.create_folder = function() {
        var that = this;
        var dialog = $('<div/>').append(
            $("<p/>").addClass("create-folder-message")
                .html('Enter a folder name:')
        ).append(
            $("<br/>")
        ).append(
            $('<input/>').attr('type','text').attr('size','25')
        );
        IPython.dialog.modal({
            title: "Create a Folder",
            body: dialog,
            buttons : {
                "Cancel": {},
                "OK": {
                    class: "btn-primary",
                    click: function () {
                    var new_name = $(this).find('input').val();
                    if (!IPython.notebook.test_folder_name(new_name)) {
                        $(this).find('.create-folder-message').html(
                            "Invalid notebook name. Notebook names must "+
                            "have 1 or more characters and can contain any characters " +
                            "except :/\\. Please enter a new notebook name:"
                        );
                        return false;
                    } else {
                        this.new_folder(new_name);
                    }
                }}
                },
            open : function (event, ui) {
                var that = $(this);
                // Upon ENTER, click the OK button.
                that.find('input[type="text"]').keydown(function (event, ui) {
                    if (event.which === 13) {
                        that.find('.btn-primary').first().click();
                        return false;
                    }
                });
                that.find('input[type="text"]').focus();
            }
        });
    };

    ContentList.prototype.new_folder = function(name) {
        var fname = {'name': name}
        var path = this.contentPath();
        var settings = {
            processData : false,
            cache : false,
            type : "POST",
            dataType : "json",
            data : JSON.stringify(fname),
            success:$.proxy(function (data, status, xhr){
                name = data.name;
                window.open(this.baseProjectUrl() +'tree' + this.contentPath() + name, '_self');
            }, this)
        };
        var url = this.baseProjectUrl() + 'api/contents' + path;
        $.ajax(url, settings);
    };

    IPython.ContentList = ContentList;

    return IPython;

}(IPython));
