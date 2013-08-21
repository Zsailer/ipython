//----------------------------------------------------------------------------
//  Copyright (C) 2008-2011  The IPython Development Team
//
//  Distributed under the terms of the BSD License.  The full license is in
//  the file COPYING, distributed as part of this software.
//----------------------------------------------------------------------------

//============================================================================
// SessionList
//============================================================================

var IPython = (function (IPython) {

    var SessionList = function (selector) {
        this.selector = selector;
        if (this.selector !== undefined) {
            this.element = $(selector);
            this.style();
            this.bind_events();
        };
        this.session_list = null;
    };

    SessionList.prototype.style = function() {
        $('#session_list_header').addClass('list_header');
        this.element.addClass("list_container");
    };

    SessionList.prototype.bind_events = function () {
        var that = this;
        this.element.bind('dragover', function () {
            return false;
        });
        this.element.bind('drop', function(event){
            that.handelFilesUpload(event,'drop');
            return false;
        });
    };

    SessionList.prototype.baseProjectUrl = function () {
        return $('body').data('baseProjectUrl');
    };

    SessionList.prototype.test_session_name = function(name){
        var l = this.content_list.length;
        var bool = true
        for (i=0; i<l; i++) {
            if (this.session_list[i] == name) {
                bool = false;
            };
        }
        return bool;
    };

    SessionList.prototype.clear_list = function () {
        this.session_list = new Array();
        this.element.children('.list_item').remove();
    };

    SessionList.prototype.load_list = function() {
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

        var url = this.baseProjectUrl() + 'api/sessions';
        $.ajax(url, settings);
    };
    
    SessionList.prototype.list_loaded = function (data, status, xhr, param) {
        var len = data.length;
        this.clear_list();
        for (var i=0; i<len; i++) {
            var name = data[i].name;
            var path = data[i].path;
            var item = this.new_item(i);
            this.add_link(path, name, item);
        };

    };

    SessionList.prototype.new_item = function (index) {
        var item = $('<div/>').addClass("list_item").addClass("row-fluid");
        
        item.append($("<div/>").addClass("span12").css("font-weight", 'bold').append(
            $("<a/>").addClass("item_link").append(
                $("<i/>")).append(
                $("<span/>").addClass("item_name")
            )
        ).append(
            $('<div/>').addClass("item_buttons btn-group pull-right")
        ));
        /*
        if (index === 1) {
            this.element.append(item);
        } else {
            this.element.children().eq(index).after(item);
        
        }*/
        this.element.append(item);
        return item;
    };


    SessionList.prototype.add_link = function (path, name, item) {
        var nbname = name.slice(0,-6);
        item.data('name', name);
        item.data('path', path);
        item.find(".item_name").text(nbname);
        item.find("a.item_link")
            .attr('href', this.baseProjectUrl() + "notebooks" + path + name)
            .attr('target','_blank');
            
    };

    IPython.SessionList = SessionList;

    return IPython;

}(IPython));
