(function($, ns) {
    ns.TabControl = ns.Base.extend({
        className: 'tab_control',
        tagName: 'ul',

        events : {"click li" : 'clickTab'},

        setup: function(tabs) {
            this.tabs = tabs;
            _.each(this.tabs, function(tab) {
                tab.selector = tab.selector || "." + tab.name;
            });
        },

        additionalContext: function() {
            return {
                tabKeys: _.map(this.tabs, function(tabOptions) {
                    return {cssClass : tabOptions.name, text : t('tabs.' + tabOptions.name)}
                })
            };
        },

        removeTab: function(name) {
            this.$("li." + name).remove();
        },

        clickTab: function(evt) {
            this.setSelectedTab($(evt.target));
        },

        setSelectedTab : function(tab) {
            tab.siblings().removeClass("selected")
            tab.addClass("selected")

            this.selectedTabName = tab.data('name');
            this.toggleTabbedArea();
            this.trigger("selected:" + tab.data("name"));
            this.trigger("selected");
        },

        selectedTab: function() {
            return _.find(this.tabs, _.bind(function(tab) {
                return tab.name == this.selectedTabName;
            }, this))
        },

        postRender: function() {
            var tab = this.selectedTabName ? this.$("li." + this.selectedTabName) : this.$('li:first');
            this.setSelectedTab(tab);
        },

        toggleTabbedArea : function() {
            var element = $('.tabbed_area').find(this.selectedTab().selector);
            element.siblings().addClass("hidden");
            element.removeClass("hidden");
        }
    });
})(jQuery, chorus.views);
