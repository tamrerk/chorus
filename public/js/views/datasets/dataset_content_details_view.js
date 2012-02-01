chorus.views.DatasetContentDetails = chorus.views.Base.extend({
    className:"dataset_content_details",

    subviews : {
        ".data_preview" : "resultsConsole"
    },

    events : {
        "click .preview" : "dataPreview",
        "click .create_chart .cancel" : "cancelVisualization",
        "click .chart_icon" : "selectVisualization",
        "mouseenter .chart_icon" : "showTitle",
        "mouseleave .chart_icon" : "showSelectedTitle"
    },

    setup: function() {
        this.dataset = this.options.dataset;
        this.resultsConsole = new chorus.views.ResultsConsole({titleKey: "dataset.data_preview", enableClose: true});
        this.resultsConsole.bind("action:close", this.closeDataPreview, this);
    },

    dataPreview : function(e) {
        e.preventDefault();

        this.$(".column_count").addClass("hidden");
        this.$(".data_preview").removeClass("hidden");

        this.resultsConsole.trigger("file:executionStarted");
        this.preview = this.dataset.preview();
        this.preview.bind("loaded", this.onFetchComplete, this);
        this.preview.fetch();
    },

    closeDataPreview : function() {
        this.$(".column_count").removeClass("hidden");
        this.$(".data_preview").addClass("hidden");
    },

    onFetchComplete: function() {
        this.resultsConsole.trigger("file:executionCompleted", this.preview);
    },
    
    postRender:function () {
        var self = this;
        chorus.menu(this.$('.transform'), {
            content:this.$(".transform_options").html(),
            orientation:"left",
            contentEvents:{
                '.visualize':_.bind(this.startVisualizationWizard, this)
            }
        });
    },

    startVisualizationWizard : function() {
        this.trigger("transform:visualize")
        this.$('.definition').addClass ("hidden")
        this.$('.create_chart').removeClass("hidden")

    },

    selectVisualization: function(e) {
        $(e.target).siblings('.chart_icon').removeClass('selected');
        $(e.target).addClass('selected');
        this.showTitle(e);
    },

    cancelVisualization: function(e) {
        e.preventDefault();
        this.$('.definition').removeClass ("hidden")
        this.$('.create_chart').addClass("hidden")
    },

    showTitle: function(e) {
        $(e.target).siblings('.title').addClass('hidden');
        $(e.target).siblings('.title.'+ $(e.target).data('chart_type')).removeClass('hidden');
    },

    showSelectedTitle: function(e) {
        $(e.target).siblings('.title').addClass('hidden');
        var type = this.$('.selected').data('chart_type');
        $(e.target).siblings('.title.'+ type).removeClass('hidden');
    }
});